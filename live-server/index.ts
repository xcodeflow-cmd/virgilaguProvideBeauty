import { randomUUID } from "crypto";
import { createServer, type IncomingMessage } from "http";

import { loadEnvConfig } from "@next/env";
import { WebSocketServer, WebSocket, type RawData } from "ws";

import {
  getLiveConsumerMonitorIntervalMs,
  getLiveJoinStaggerMs,
  getLiveMaxViewers,
  getLiveRoomSignalRateLimitMax,
  getLiveSignalRateLimitMax,
  getLiveSignalRateLimitWindowMs,
  getLiveWsBackpressureBytes,
} from "../lib/live-config";
import { verifyLiveToken } from "../lib/live-token";
import type {
  LiveConsumerProfile,
  LiveRole,
  LiveWsClientControlMessage,
  LiveWsEvent,
  LiveWsMessage,
  LiveWsRequest,
  LiveWsRequestMap,
} from "../types/live-media";

loadEnvConfig(process.cwd());

type MediasoupModule = typeof import("mediasoup");
type MediaWorker = Awaited<ReturnType<MediasoupModule["createWorker"]>>;
type MediaRouter = Awaited<ReturnType<MediaWorker["createRouter"]>>;
type MediaTransport = Awaited<ReturnType<MediaRouter["createWebRtcTransport"]>>;
type MediaProducer = Awaited<ReturnType<MediaTransport["produce"]>>;
type MediaConsumer = Awaited<ReturnType<MediaTransport["consume"]>>;

type RateLimitState = {
  windowStartedAt: number;
  count: number;
  violations: number;
};

type LivePeer = {
  id: string;
  userId: string;
  role: LiveRole;
  ws: WebSocket;
  roomId: string;
  lastSeenAt: number;
  joinedAt: number;
  closing: boolean;
  transports: Map<string, MediaTransport>;
  producers: Map<string, MediaProducer>;
  consumers: Map<string, MediaConsumer>;
  consumerProfiles: Map<string, LiveConsumerProfile>;
  consumerMonitors: Map<string, NodeJS.Timeout>;
  rateLimit: RateLimitState;
  lastBackpressureAt: number;
};

type LiveRoom = {
  id: string;
  router: MediaRouter;
  peers: Map<string, LivePeer>;
  broadcasterPeerId: string | null;
  producersByKind: Map<"audio" | "video", string>;
  lastActiveAt: number;
  nextViewerJoinAt: number;
  roomStateTimer: NodeJS.Timeout | null;
  roomRateLimit: RateLimitState;
};

type ConsumerMetrics = {
  score?: number;
  packetLossRatio?: number;
  rttMs?: number;
  backpressured?: boolean;
};

const LIVE_WS_PORT = Number(process.env.LIVE_WS_PORT || 3001);
const LIVE_WS_PATH = process.env.LIVE_WS_PATH || "/live";
const LIVE_LISTEN_IP = process.env.LIVE_LISTEN_IP || "0.0.0.0";
const LIVE_ANNOUNCED_ADDRESS = process.env.LIVE_ANNOUNCED_ADDRESS || undefined;
const LIVE_RTC_MIN_PORT = Number(process.env.LIVE_RTC_MIN_PORT || 40000);
const LIVE_RTC_MAX_PORT = Number(process.env.LIVE_RTC_MAX_PORT || 40199);
const LIVE_INITIAL_OUTGOING_BITRATE = Number(process.env.LIVE_INITIAL_OUTGOING_BITRATE || 1_000_000);
const LIVE_MAX_INCOMING_BITRATE = Number(process.env.LIVE_MAX_INCOMING_BITRATE || 1_500_000);
const LIVE_PEER_TIMEOUT_MS = Number(process.env.LIVE_PEER_TIMEOUT_MS || 30_000);
const LIVE_ROOM_IDLE_TIMEOUT_MS = Number(process.env.LIVE_ROOM_IDLE_TIMEOUT_MS || 60_000);
const LIVE_SERVER_SECRET = process.env.LIVE_SERVER_SECRET?.trim() || "";
const LIVE_WS_HEARTBEAT_INTERVAL_MS = 15_000;
const LIVE_MAX_VIEWERS = getLiveMaxViewers();
const LIVE_JOIN_STAGGER_MS = getLiveJoinStaggerMs();
const LIVE_SIGNAL_RATE_LIMIT_WINDOW_MS = getLiveSignalRateLimitWindowMs();
const LIVE_SIGNAL_RATE_LIMIT_MAX = getLiveSignalRateLimitMax();
const LIVE_ROOM_SIGNAL_RATE_LIMIT_MAX = getLiveRoomSignalRateLimitMax();
const LIVE_WS_BACKPRESSURE_BYTES = getLiveWsBackpressureBytes();
const LIVE_CONSUMER_MONITOR_INTERVAL_MS = getLiveConsumerMonitorIntervalMs();
const LIVE_ROOM_STATE_DEBOUNCE_MS = 100;

const mediaCodecs = [
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000,
  },
  {
    kind: "video",
    mimeType: "video/H264",
    clockRate: 90000,
    parameters: {
      "level-asymmetry-allowed": 1,
      "packetization-mode": 1,
      "profile-level-id": "42e01f",
    },
  },
];

const rooms = new Map<string, LiveRoom>();
let mediasoupModule: MediasoupModule | null = null;
let worker: MediaWorker | null = null;

async function getMediasoupModule() {
  if (process.env.VERCEL === "1") {
    throw new Error("mediasoup is disabled in Vercel build environments.");
  }

  if (mediasoupModule) {
    return mediasoupModule;
  }

  mediasoupModule = await import("mediasoup");
  return mediasoupModule;
}

function log(event: string, data?: Record<string, unknown>) {
  console.log(
    JSON.stringify({
      scope: "live-server",
      ts: new Date().toISOString(),
      event,
      ...(data || {}),
    })
  );
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isOpen(ws: WebSocket) {
  return ws.readyState === WebSocket.OPEN;
}

function isLiveServerSecretConfigured() {
  return LIVE_SERVER_SECRET.length > 0;
}

function isValidLiveServerSecret(secret: string | null | undefined) {
  if (!isLiveServerSecretConfigured()) {
    return true;
  }

  return typeof secret === "string" && secret.trim() === LIVE_SERVER_SECRET;
}

function resetRateLimitWindow(state: RateLimitState, now: number) {
  if (now - state.windowStartedAt >= LIVE_SIGNAL_RATE_LIMIT_WINDOW_MS) {
    state.windowStartedAt = now;
    state.count = 0;
  }
}

async function safeCloseTransport(peer: LivePeer, transport: MediaTransport, reason: string) {
  try {
    transport.close();
  } catch (error) {
    log("transport_close_failed", {
      liveId: peer.roomId,
      peerId: peer.id,
      transportId: transport.id,
      reason,
      message: error instanceof Error ? error.message : "transport close failed",
    });
  } finally {
    peer.transports.delete(transport.id);
  }
}

async function safeCloseConsumer(peer: LivePeer, consumer: MediaConsumer, reason: string) {
  const monitor = peer.consumerMonitors.get(consumer.id);

  if (monitor) {
    clearInterval(monitor);
    peer.consumerMonitors.delete(consumer.id);
  }

  peer.consumerProfiles.delete(consumer.id);

  try {
    consumer.close();
  } catch (error) {
    log("consumer_close_failed", {
      liveId: peer.roomId,
      peerId: peer.id,
      consumerId: consumer.id,
      reason,
      message: error instanceof Error ? error.message : "consumer close failed",
    });
  } finally {
    peer.consumers.delete(consumer.id);
  }
}

async function safeCloseProducer(peer: LivePeer, producer: MediaProducer, reason: string) {
  try {
    producer.close();
  } catch (error) {
    log("producer_close_failed", {
      liveId: peer.roomId,
      peerId: peer.id,
      producerId: producer.id,
      reason,
      message: error instanceof Error ? error.message : "producer close failed",
    });
  } finally {
    peer.producers.delete(producer.id);
  }
}

function parseConsumerScore(scorePayload: unknown) {
  if (!scorePayload || typeof scorePayload !== "object") {
    return undefined;
  }

  const score = scorePayload as { score?: number; scores?: Array<{ score?: number }> };

  if (typeof score.score === "number") {
    return score.score;
  }

  if (Array.isArray(score.scores)) {
    return Math.max(...score.scores.map((entry) => Number(entry?.score || 0)));
  }

  return undefined;
}

function parseConsumerStats(statsPayload: unknown) {
  const stats = Array.isArray(statsPayload) ? statsPayload : [];
  const metrics: ConsumerMetrics = {};

  for (const entry of stats as Array<Record<string, unknown>>) {
    if (metrics.packetLossRatio === undefined) {
      const fractionLost = Number(entry.fractionLost);

      if (Number.isFinite(fractionLost) && fractionLost >= 0) {
        metrics.packetLossRatio = fractionLost > 1 ? fractionLost / 256 : fractionLost;
      }
    }

    if (metrics.packetLossRatio === undefined) {
      const packetsLost = Number(entry.packetsLost);
      const packetsSent = Number(entry.packetCount || entry.packetsSent || entry.packetCountSent);

      if (Number.isFinite(packetsLost) && Number.isFinite(packetsSent) && packetsSent > 0) {
        metrics.packetLossRatio = Math.max(0, packetsLost / packetsSent);
      }
    }

    if (metrics.rttMs === undefined) {
      const roundTripTime = Number(entry.roundTripTime || entry.currentRoundTripTime || entry.rtt);

      if (Number.isFinite(roundTripTime) && roundTripTime >= 0) {
        metrics.rttMs = roundTripTime > 10 ? roundTripTime : roundTripTime * 1000;
      }
    }
  }

  return metrics;
}

function chooseConsumerProfile(metrics: ConsumerMetrics, currentProfile: LiveConsumerProfile) {
  if (
    metrics.backpressured ||
    (metrics.rttMs !== undefined && metrics.rttMs >= 900) ||
    (metrics.packetLossRatio !== undefined && metrics.packetLossRatio >= 0.08) ||
    (metrics.score !== undefined && metrics.score <= 4)
  ) {
    return "low";
  }

  if (
    (metrics.rttMs !== undefined && metrics.rttMs >= 450) ||
    (metrics.packetLossRatio !== undefined && metrics.packetLossRatio >= 0.03) ||
    (metrics.score !== undefined && metrics.score <= 7)
  ) {
    return "medium";
  }

  if (currentProfile === "low") {
    return "medium";
  }

  return "high";
}

function profileLayers(profile: LiveConsumerProfile) {
  switch (profile) {
    case "low":
      return { spatialLayer: 0, temporalLayer: 0 };
    case "medium":
      return { spatialLayer: 1, temporalLayer: 1 };
    case "high":
      return { spatialLayer: 2, temporalLayer: 2 };
  }
}

function sendPeerMessage(peer: LivePeer, message: LiveWsMessage, critical = false) {
  if (!isOpen(peer.ws)) {
    return false;
  }

  if (!critical && peer.ws.bufferedAmount > LIVE_WS_BACKPRESSURE_BYTES) {
    const now = Date.now();

    if (now - peer.lastBackpressureAt >= 5000) {
      peer.lastBackpressureAt = now;
      log("peer_backpressure", {
        liveId: peer.roomId,
        peerId: peer.id,
        role: peer.role,
        bufferedAmount: peer.ws.bufferedAmount,
      });
    }

    return false;
  }

  try {
    peer.ws.send(JSON.stringify(message));
    return true;
  } catch (error) {
    log("socket_send_failed", {
      liveId: peer.roomId,
      peerId: peer.id,
      messageType: message.type,
      message: error instanceof Error ? error.message : "socket send failed",
    });
    return false;
  }
}

function sendSuccess(peer: LivePeer, requestId: string, action: string, data: unknown) {
  sendPeerMessage(
    peer,
    {
      type: "response",
      requestId,
      ok: true,
      action,
      data,
    } as LiveWsMessage,
    true
  );
}

function sendFailure(peer: LivePeer, requestId: string, action: string, error: string) {
  sendPeerMessage(
    peer,
    {
      type: "response",
      requestId,
      ok: false,
      action,
      error,
    } as LiveWsMessage,
    true
  );
}

async function ensureWorker() {
  if (worker) {
    return worker;
  }

  const mediasoup = await getMediasoupModule();
  worker = await mediasoup.createWorker({
    rtcMinPort: LIVE_RTC_MIN_PORT,
    rtcMaxPort: LIVE_RTC_MAX_PORT,
    logLevel: "warn",
  });

  worker.on("died", () => {
    log("mediasoup_worker_died");
    process.exit(1);
  });

  return worker;
}

async function getOrCreateRoom(liveId: string) {
  const existing = rooms.get(liveId);

  if (existing) {
    existing.lastActiveAt = Date.now();
    return existing;
  }

  const currentWorker = await ensureWorker();
  const router = await currentWorker.createRouter({ mediaCodecs: mediaCodecs as never });
  const room: LiveRoom = {
    id: liveId,
    router,
    peers: new Map(),
    broadcasterPeerId: null,
    producersByKind: new Map(),
    lastActiveAt: Date.now(),
    nextViewerJoinAt: Date.now(),
    roomStateTimer: null,
    roomRateLimit: {
      windowStartedAt: Date.now(),
      count: 0,
      violations: 0,
    },
  };

  rooms.set(liveId, room);
  log("room_created", { liveId });
  return room;
}

function serializeTransport(transport: MediaTransport) {
  return {
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
    sctpParameters: transport.sctpParameters,
  };
}

function getViewerCount(room: LiveRoom) {
  let count = 0;

  for (const peer of room.peers.values()) {
    if (peer.role === "viewer") {
      count += 1;
    }
  }

  return count;
}

function scheduleRoomState(room: LiveRoom, immediate = false) {
  if (room.roomStateTimer) {
    if (!immediate) {
      return;
    }

    clearTimeout(room.roomStateTimer);
    room.roomStateTimer = null;
  }

  const emit = () => {
    room.roomStateTimer = null;

    const producers = [...room.producersByKind.entries()].map(([kind, producerId]) => ({
      producerId,
      kind,
    }));

    const event: LiveWsEvent = {
      type: "event",
      event: "roomState",
      data: {
        liveId: room.id,
        broadcasterOnline: Boolean(room.broadcasterPeerId) && producers.length > 0,
        viewerCount: getViewerCount(room),
        producers,
      },
    };

    for (const peer of room.peers.values()) {
      sendPeerMessage(peer, event, false);
    }
  };

  if (immediate) {
    emit();
    return;
  }

  room.roomStateTimer = setTimeout(emit, LIVE_ROOM_STATE_DEBOUNCE_MS);
}

function broadcastEvent(room: LiveRoom, event: LiveWsEvent, critical = false) {
  for (const peer of room.peers.values()) {
    sendPeerMessage(peer, event, critical);
  }
}

function closeProducer(room: LiveRoom, producerId: string) {
  for (const [kind, currentProducerId] of room.producersByKind.entries()) {
    if (currentProducerId === producerId) {
      room.producersByKind.delete(kind);
      broadcastEvent(
        room,
        {
          type: "event",
          event: "producerRemoved",
          data: { producerId, kind },
        },
        true
      );
      break;
    }
  }

  if (!room.producersByKind.size) {
    broadcastEvent(
      room,
      {
        type: "event",
        event: "streamOffline",
        data: { liveId: room.id },
      },
      true
    );
  }

  scheduleRoomState(room);
}

async function setConsumerProfile(
  peer: LivePeer,
  consumer: MediaConsumer,
  nextProfile: LiveConsumerProfile,
  reason: string
) {
  if (consumer.kind !== "video") {
    return;
  }

  const currentProfile = peer.consumerProfiles.get(consumer.id);

  if (currentProfile === nextProfile) {
    return;
  }

  try {
    const layers = profileLayers(nextProfile);
    await (
      consumer as MediaConsumer & {
        setPreferredLayers?: (layers: { spatialLayer: number; temporalLayer: number }) => Promise<void>;
      }
    ).setPreferredLayers?.(layers);
    peer.consumerProfiles.set(consumer.id, nextProfile);

    sendPeerMessage(
      peer,
      {
        type: "event",
        event: "consumerProfileChanged",
        data: {
          consumerId: consumer.id,
          profile: nextProfile,
          reason,
        },
      },
      false
    );

    log("consumer_profile_changed", {
      liveId: peer.roomId,
      peerId: peer.id,
      consumerId: consumer.id,
      profile: nextProfile,
      reason,
    });
  } catch (error) {
    log("consumer_profile_change_failed", {
      liveId: peer.roomId,
      peerId: peer.id,
      consumerId: consumer.id,
      profile: nextProfile,
      reason,
      message: error instanceof Error ? error.message : "consumer profile change failed",
    });
  }
}

function degradePeerConsumers(peer: LivePeer, reason: string) {
  for (const consumer of peer.consumers.values()) {
    if (consumer.kind === "video") {
      void setConsumerProfile(peer, consumer, "low", reason);
    }
  }
}

function monitorConsumer(peer: LivePeer, consumer: MediaConsumer) {
  if (consumer.kind !== "video") {
    return;
  }

  const timer = setInterval(async () => {
    if (peer.closing || !peer.consumers.has(consumer.id)) {
      clearInterval(timer);
      peer.consumerMonitors.delete(consumer.id);
      return;
    }

    try {
      const rawStats = await (consumer as MediaConsumer & { getStats?: () => Promise<unknown> }).getStats?.();
      const statsMetrics = parseConsumerStats(rawStats);
      const nextProfile = chooseConsumerProfile(
        {
          ...statsMetrics,
          backpressured: peer.ws.bufferedAmount > LIVE_WS_BACKPRESSURE_BYTES,
        },
        peer.consumerProfiles.get(consumer.id) || "medium"
      );

      await setConsumerProfile(peer, consumer, nextProfile, "stats-monitor");
    } catch (error) {
      log("consumer_monitor_failed", {
        liveId: peer.roomId,
        peerId: peer.id,
        consumerId: consumer.id,
        message: error instanceof Error ? error.message : "consumer monitor failed",
      });
    }
  }, LIVE_CONSUMER_MONITOR_INTERVAL_MS);

  peer.consumerMonitors.set(consumer.id, timer);
}

async function waitForViewerJoinSlot(room: LiveRoom, peer: LivePeer, action: string) {
  if (peer.role !== "viewer" || LIVE_JOIN_STAGGER_MS <= 0) {
    return;
  }

  const now = Date.now();
  const delayMs = Math.max(0, room.nextViewerJoinAt - now);
  room.nextViewerJoinAt = Math.max(now, room.nextViewerJoinAt) + LIVE_JOIN_STAGGER_MS;

  if (!delayMs) {
    return;
  }

  log("viewer_join_staggered", {
    liveId: room.id,
    peerId: peer.id,
    action,
    delayMs,
  });

  await wait(delayMs);
}

function withinRateLimit(peer: LivePeer, room: LiveRoom, request: LiveWsRequest) {
  if (request.action === "heartbeat") {
    return true;
  }

  const now = Date.now();
  resetRateLimitWindow(peer.rateLimit, now);
  resetRateLimitWindow(room.roomRateLimit, now);

  peer.rateLimit.count += 1;
  room.roomRateLimit.count += 1;

  if (
    peer.rateLimit.count > LIVE_SIGNAL_RATE_LIMIT_MAX ||
    room.roomRateLimit.count > LIVE_ROOM_SIGNAL_RATE_LIMIT_MAX
  ) {
    peer.rateLimit.violations += 1;
    room.roomRateLimit.violations += 1;

    log("signal_rate_limited", {
      liveId: room.id,
      peerId: peer.id,
      action: request.action,
      peerCount: peer.rateLimit.count,
      roomCount: room.roomRateLimit.count,
      peerViolations: peer.rateLimit.violations,
    });

    sendFailure(peer, request.requestId, request.action, "Too many live signaling requests. Please slow down.");

    if (peer.rateLimit.violations >= 3) {
      void closePeer(peer, "rate limit exceeded");
    }

    return false;
  }

  return true;
}

async function closePeer(peer: LivePeer, reason: string) {
  if (peer.closing) {
    return;
  }

  peer.closing = true;
  const room = rooms.get(peer.roomId);

  for (const consumer of [...peer.consumers.values()]) {
    await safeCloseConsumer(peer, consumer, reason);
  }

  for (const producer of [...peer.producers.values()]) {
    const producerId = producer.id;
    await safeCloseProducer(peer, producer, reason);

    if (room) {
      closeProducer(room, producerId);
    }
  }

  for (const transport of [...peer.transports.values()]) {
    await safeCloseTransport(peer, transport, reason);
  }

  peer.consumers.clear();
  peer.producers.clear();
  peer.transports.clear();
  peer.consumerMonitors.clear();
  peer.consumerProfiles.clear();

  if (room) {
    room.peers.delete(peer.id);
    room.lastActiveAt = Date.now();

    if (room.broadcasterPeerId === peer.id) {
      room.broadcasterPeerId = null;
      broadcastEvent(
        room,
        {
          type: "event",
          event: "streamOffline",
          data: { liveId: room.id },
        },
        true
      );
    }

    scheduleRoomState(room);
  }

  if (isOpen(peer.ws)) {
    try {
      peer.ws.close(1000, reason);
    } catch {}
  }

  log("client disconnected", {
    liveId: peer.roomId,
    peerId: peer.id,
    role: peer.role,
    reason,
  });
}

async function createWebRtcTransport(room: LiveRoom) {
  return room.router.createWebRtcTransport({
    listenInfos: [
      {
        protocol: "udp",
        ip: LIVE_LISTEN_IP,
        announcedAddress: LIVE_ANNOUNCED_ADDRESS,
        portRange: { min: LIVE_RTC_MIN_PORT, max: LIVE_RTC_MAX_PORT },
      },
      {
        protocol: "tcp",
        ip: LIVE_LISTEN_IP,
        announcedAddress: LIVE_ANNOUNCED_ADDRESS,
        portRange: { min: LIVE_RTC_MIN_PORT, max: LIVE_RTC_MAX_PORT },
      },
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: LIVE_INITIAL_OUTGOING_BITRATE,
  });
}

async function handleRequest(peer: LivePeer, request: LiveWsRequest) {
  const room = rooms.get(peer.roomId);

  if (!room) {
    sendFailure(peer, request.requestId, request.action, "Live room not found.");
    return;
  }

  room.lastActiveAt = Date.now();
  peer.lastSeenAt = Date.now();

  try {
    switch (request.action) {
      case "getRouterRtpCapabilities": {
        sendSuccess(peer, request.requestId, request.action, {
          routerRtpCapabilities: room.router.rtpCapabilities,
        });
        return;
      }

      case "createTransport": {
        const data = request.data as LiveWsRequestMap["createTransport"];

        if (data.direction === "send" && peer.role !== "broadcaster") {
          throw new Error("Only the broadcaster can create a send transport.");
        }

        await waitForViewerJoinSlot(room, peer, "createTransport");
        const transport = await createWebRtcTransport(room);

        if (data.direction === "send") {
          await transport.setMaxIncomingBitrate(LIVE_MAX_INCOMING_BITRATE);
        }

        transport.on("dtlsstatechange", (state: string) => {
          if (state === "failed") {
            void safeCloseTransport(peer, transport, "dtls failed");
            return;
          }

          if (state === "closed") {
            peer.transports.delete(transport.id);
          }
        });

        transport.on("icestatechange", (state: string) => {
          if (state === "failed" || state === "closed") {
            void safeCloseTransport(peer, transport, `ice ${state}`);
          }
        });

        transport.on("@close", () => {
          peer.transports.delete(transport.id);
        });

        peer.transports.set(transport.id, transport);

        log("transport_created", {
          liveId: room.id,
          peerId: peer.id,
          role: peer.role,
          direction: data.direction,
          transportId: transport.id,
        });

        sendSuccess(peer, request.requestId, request.action, serializeTransport(transport));
        return;
      }

      case "connectTransport": {
        const data = request.data as LiveWsRequestMap["connectTransport"];
        const transport = peer.transports.get(data.transportId);

        if (!transport) {
          throw new Error("Transport not found.");
        }

        await transport.connect({ dtlsParameters: data.dtlsParameters as never });
        sendSuccess(peer, request.requestId, request.action, { connected: true });
        return;
      }

      case "produce": {
        const data = request.data as LiveWsRequestMap["produce"];

        if (peer.role !== "broadcaster") {
          throw new Error("Only the broadcaster can publish media.");
        }

        const transport = peer.transports.get(data.transportId);

        if (!transport) {
          throw new Error("Transport not found.");
        }

        const existingProducerId = room.producersByKind.get(data.kind);

        if (existingProducerId) {
          for (const currentPeer of room.peers.values()) {
            const currentProducer = currentPeer.producers.get(existingProducerId);

            if (currentProducer) {
              await safeCloseProducer(currentPeer, currentProducer, "producer replaced");
              break;
            }
          }

          closeProducer(room, existingProducerId);
        }

        const producer = await transport.produce({
          kind: data.kind,
          rtpParameters: data.rtpParameters as never,
          appData: { liveId: room.id, peerId: peer.id, kind: data.kind },
        });

        producer.on("transportclose", () => {
          peer.producers.delete(producer.id);
          closeProducer(room, producer.id);
        });

        producer.on("@close", () => {
          peer.producers.delete(producer.id);
          closeProducer(room, producer.id);
        });

        peer.producers.set(producer.id, producer);
        room.producersByKind.set(data.kind, producer.id);
        room.broadcasterPeerId = peer.id;

        broadcastEvent(
          room,
          {
            type: "event",
            event: "producerAdded",
            data: {
              producerId: producer.id,
              kind: data.kind,
            },
          },
          true
        );

        scheduleRoomState(room);
        log("producer_published", {
          liveId: room.id,
          peerId: peer.id,
          producerId: producer.id,
          kind: data.kind,
        });

        sendSuccess(peer, request.requestId, request.action, { id: producer.id });
        return;
      }

      case "consume": {
        const data = request.data as LiveWsRequestMap["consume"];

        if (peer.role !== "viewer") {
          throw new Error("Only viewers can consume media.");
        }

        const transport = peer.transports.get(data.transportId);

        if (!transport) {
          throw new Error("Transport not found.");
        }

        if (!room.router.canConsume({ producerId: data.producerId, rtpCapabilities: data.rtpCapabilities as never })) {
          throw new Error("Router cannot consume this producer for the given RTP capabilities.");
        }

        await waitForViewerJoinSlot(room, peer, "consume");
        const consumer = await transport.consume({
          producerId: data.producerId,
          rtpCapabilities: data.rtpCapabilities as never,
          paused: true,
        });

        consumer.on("transportclose", () => {
          void safeCloseConsumer(peer, consumer, "transport closed");
        });

        consumer.on("producerclose", () => {
          void safeCloseConsumer(peer, consumer, "producer closed");
          sendPeerMessage(
            peer,
            {
              type: "event",
              event: "producerRemoved",
              data: {
                producerId: data.producerId,
                kind: consumer.kind,
              },
            },
            true
          );
        });

        consumer.on("score", (scorePayload: unknown) => {
          const score = parseConsumerScore(scorePayload);
          const nextProfile = chooseConsumerProfile(
            {
              score,
              backpressured: peer.ws.bufferedAmount > LIVE_WS_BACKPRESSURE_BYTES,
            },
            peer.consumerProfiles.get(consumer.id) || "medium"
          );

          void setConsumerProfile(peer, consumer, nextProfile, "score-update");
        });

        peer.consumers.set(consumer.id, consumer);
        await setConsumerProfile(peer, consumer, "medium", "initial");
        monitorConsumer(peer, consumer);

        sendSuccess(peer, request.requestId, request.action, {
          id: consumer.id,
          producerId: data.producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        });
        return;
      }

      case "resumeConsumer": {
        const data = request.data as LiveWsRequestMap["resumeConsumer"];
        const consumer = peer.consumers.get(data.consumerId);

        if (!consumer) {
          throw new Error("Consumer not found.");
        }

        await consumer.resume();
        sendSuccess(peer, request.requestId, request.action, { resumed: true });
        return;
      }

      case "updateConsumerProfile": {
        const data = request.data as LiveWsRequestMap["updateConsumerProfile"];
        const consumer = peer.consumers.get(data.consumerId);

        if (!consumer) {
          throw new Error("Consumer not found.");
        }

        await setConsumerProfile(peer, consumer, data.profile, data.reason || "client-request");
        sendSuccess(peer, request.requestId, request.action, {
          updated: true,
          profile: data.profile,
        });
        return;
      }

      case "restartIce": {
        const data = request.data as LiveWsRequestMap["restartIce"];
        const transport = peer.transports.get(data.transportId);

        if (!transport) {
          throw new Error("Transport not found.");
        }

        const iceParameters = await transport.restartIce();
        log("transport_ice_restarted", {
          liveId: room.id,
          peerId: peer.id,
          transportId: transport.id,
        });

        sendSuccess(peer, request.requestId, request.action, { iceParameters });
        return;
      }

      case "heartbeat": {
        sendSuccess(peer, request.requestId, request.action, { pong: true });
        return;
      }

      case "stopBroadcast": {
        if (peer.role !== "broadcaster") {
          throw new Error("Only the broadcaster can stop the stream.");
        }

        sendSuccess(peer, request.requestId, request.action, { stopped: true });
        await closePeer(peer, "broadcaster stopped");
        return;
      }

      default: {
        throw new Error("Unsupported live request.");
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected live server error.";

    log("request_failed", {
      liveId: peer.roomId,
      peerId: peer.id,
      action: request.action,
      message,
    });

    sendFailure(peer, request.requestId, request.action, message);
  }
}

function registerProcessSafety() {
  process.on("unhandledRejection", (reason) => {
    log("unhandled_rejection", {
      message: reason instanceof Error ? reason.message : String(reason),
    });
  });

  process.on("uncaughtException", (error) => {
    log("uncaught_exception", {
      message: error.message,
      stack: error.stack,
    });
  });
}

async function bootstrap() {
  registerProcessSafety();

  if (!isLiveServerSecretConfigured()) {
    log("live_server_secret_missing", {
      message: "LIVE_SERVER_SECRET is not configured. WebSocket clients will fall back to token-only authentication.",
    });
  }

  if (process.env.VERCEL === "1") {
    log("bootstrap_skipped", {
      reason: "vercel_environment",
    });
    return;
  }

  await ensureWorker();

  const httpServer = createServer((request, response) => {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    if (requestUrl.pathname === "/healthz") {
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      response.end(
        JSON.stringify({
          ok: true,
          service: "live-server",
          wsPath: LIVE_WS_PATH,
          wsPort: LIVE_WS_PORT,
          rooms: rooms.size,
          peers: [...rooms.values()].reduce((count, room) => count + room.peers.size, 0),
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(
      JSON.stringify({
        ok: true,
        service: "live-server",
        message: "Use /healthz for HTTP health and connect WebSocket clients to the configured live path.",
        websocketUrlExample: `ws://localhost:${LIVE_WS_PORT}${LIVE_WS_PATH}`,
      })
    );
  });

  const server = new WebSocketServer({
    server: httpServer,
    path: LIVE_WS_PATH,
  });

  server.on("connection", async (ws: WebSocket, request: IncomingMessage) => {
    const requestUrl = new URL(request.url || LIVE_WS_PATH, `http://${request.headers.host || "localhost"}`);
    const token = requestUrl.searchParams.get("token") || "";
    const querySecret = requestUrl.searchParams.get("secret");
    const remoteAddress = request.socket.remoteAddress || "unknown";
    let peer: LivePeer | null = null;
    let authTimeout: NodeJS.Timeout | null = null;

    log("client connected", {
      remoteAddress,
      path: requestUrl.pathname,
    });

    const clearAuthTimeout = () => {
      if (authTimeout) {
        clearTimeout(authTimeout);
        authTimeout = null;
      }
    };

    const rejectClient = (message: string) => {
      clearAuthTimeout();
      ws.close(4403, message);
    };

    try {
      const claims = verifyLiveToken(token);
      const requireSecret = isLiveServerSecretConfigured();
      let authenticated = isValidLiveServerSecret(querySecret);

      const finalizeAuthentication = async () => {
        if (peer) {
          return;
        }

        const room = await getOrCreateRoom(claims.liveId);

        if (claims.role === "viewer" && getViewerCount(room) >= LIVE_MAX_VIEWERS) {
          log("viewer_capacity_reached", {
            liveId: claims.liveId,
            userId: claims.userId,
            maxViewers: LIVE_MAX_VIEWERS,
          });
          ws.close(1013, "Viewer capacity reached.");
          return;
        }

        const peerId = randomUUID();
        peer = {
          id: peerId,
          userId: claims.userId,
          role: claims.role,
          ws,
          roomId: claims.liveId,
          lastSeenAt: Date.now(),
          joinedAt: Date.now(),
          closing: false,
          transports: new Map(),
          producers: new Map(),
          consumers: new Map(),
          consumerProfiles: new Map(),
          consumerMonitors: new Map(),
          rateLimit: {
            windowStartedAt: Date.now(),
            count: 0,
            violations: 0,
          },
          lastBackpressureAt: 0,
        };

        if (claims.role === "broadcaster" && room.broadcasterPeerId) {
          const existingBroadcaster = room.peers.get(room.broadcasterPeerId);

          if (existingBroadcaster) {
            await closePeer(existingBroadcaster, "broadcaster replaced");
          }
        }

        room.peers.set(peer.id, peer);
        room.lastActiveAt = Date.now();
        scheduleRoomState(room, true);

        log("client authenticated", {
          liveId: room.id,
          peerId: peer.id,
          role: peer.role,
          viewers: getViewerCount(room),
        });
      };

      ws.on("pong", () => {
        if (peer) {
          peer.lastSeenAt = Date.now();
        }
      });

      ws.on("message", (raw: RawData) => {
        let message: LiveWsMessage | LiveWsClientControlMessage;

        try {
          message = JSON.parse(raw.toString()) as LiveWsMessage | LiveWsClientControlMessage;
        } catch {
          if (peer) {
            sendPeerMessage(
              peer,
              {
                type: "event",
                event: "error",
                data: { message: "Invalid live signaling payload." },
              },
              true
            );
          } else {
            rejectClient("Invalid live signaling payload.");
          }
          return;
        }

        if (!peer) {
          if (message.type === "auth" && isValidLiveServerSecret(message.secret)) {
            authenticated = true;
            clearAuthTimeout();
            void finalizeAuthentication();
            return;
          }

          log("client rejected: invalid secret", {
            remoteAddress,
            liveId: claims.liveId,
          });
          rejectClient("Invalid live server secret.");
          return;
        }

        if (peer.closing) {
          return;
        }

        if (message.type === "pong") {
          peer.lastSeenAt = Date.now();
          return;
        }

        if (message.type === "auth") {
          if (!isValidLiveServerSecret(message.secret)) {
            log("client rejected: invalid secret", {
              liveId: peer.roomId,
              peerId: peer.id,
            });
            void closePeer(peer, "invalid secret");
          }
          return;
        }

        if (message.type !== "request") {
          return;
        }

        if (!withinRateLimit(peer, rooms.get(peer.roomId)!, message)) {
          return;
        }

        void handleRequest(peer, message);
      });

      ws.on("close", () => {
        clearAuthTimeout();

        if (peer) {
          void closePeer(peer, "socket closed");
          return;
        }

        log("client disconnected", {
          remoteAddress,
          reason: "socket closed before authentication",
        });
      });

      ws.on("error", (error: Error) => {
        clearAuthTimeout();

        if (peer) {
          log("socket_error", {
            liveId: peer.roomId,
            peerId: peer.id,
            message: error instanceof Error ? error.message : "socket error",
          });
          void closePeer(peer, "socket error");
          return;
        }

        log("client disconnected", {
          remoteAddress,
          reason: error instanceof Error ? error.message : "socket error before authentication",
        });
      });

      if (authenticated) {
        await finalizeAuthentication();
        return;
      }

      if (requireSecret) {
        authTimeout = setTimeout(() => {
          log("client rejected: invalid secret", {
            remoteAddress,
            liveId: claims.liveId,
          });
          rejectClient("Invalid live server secret.");
        }, 5000);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unauthorized live connection.";
      log("connection_rejected", { message, remoteAddress });
      rejectClient(message);
    }
  });

  setInterval(() => {
    const now = Date.now();

    for (const room of rooms.values()) {
      for (const peer of [...room.peers.values()]) {
        if (!isOpen(peer.ws) || now - peer.lastSeenAt > LIVE_PEER_TIMEOUT_MS) {
          void closePeer(peer, "heartbeat timeout");
          continue;
        }

        if (peer.ws.bufferedAmount > LIVE_WS_BACKPRESSURE_BYTES) {
          degradePeerConsumers(peer, "socket-backpressure");
        }

        try {
          sendPeerMessage(
            peer,
            {
              type: "event",
              event: "ping",
              data: { ts: now },
            },
            true
          );
          peer.ws.ping();
        } catch {
          void closePeer(peer, "ping failed");
        }
      }

      if (!room.peers.size && now - room.lastActiveAt > LIVE_ROOM_IDLE_TIMEOUT_MS) {
        rooms.delete(room.id);

        if (room.roomStateTimer) {
          clearTimeout(room.roomStateTimer);
          room.roomStateTimer = null;
        }

        room.router.close();
        log("room_cleaned", { liveId: room.id });
      }
    }
  }, LIVE_WS_HEARTBEAT_INTERVAL_MS);

  await new Promise<void>((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(LIVE_WS_PORT, LIVE_LISTEN_IP, () => {
      httpServer.off("error", reject);
      resolve();
    });
  });

  log("server_listening", {
    port: LIVE_WS_PORT,
    listenIp: LIVE_LISTEN_IP,
    path: LIVE_WS_PATH,
    healthPath: "/healthz",
    rtcMinPort: LIVE_RTC_MIN_PORT,
    rtcMaxPort: LIVE_RTC_MAX_PORT,
    maxViewers: LIVE_MAX_VIEWERS,
    joinStaggerMs: LIVE_JOIN_STAGGER_MS,
  });
}

void bootstrap().catch((error) => {
  log("bootstrap_failed", {
    message: error instanceof Error ? error.message : "bootstrap failed",
  });
  process.exit(1);
});
