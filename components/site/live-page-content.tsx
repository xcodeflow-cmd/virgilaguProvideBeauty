"use client";

import { useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track, type RemoteTrack } from "livekit-client";
import { Camera, Lock, Maximize2, Minimize2, Radio } from "lucide-react";

import { PastLiveList } from "@/components/past-live-list";
import { Button } from "@/components/ui/button";
import { formatLei } from "@/lib/utils";
import type {
  LiveBootstrapResponse,
  LiveConsumerProfile,
  LiveRole,
  LiveWsClientControlMessage,
  LiveWsEvent,
  LiveWsMessage,
  LiveWsRequestMap,
  LiveWsResponseMap
} from "@/types/live-media";

type LiveSessionSummary = {
  id: string;
  title: string;
  description: string;
  scheduledFor: string;
  isLive: boolean;
  price?: number | null;
  compareAtPrice?: number | null;
  visibility?: string;
  maxParticipants?: number | null;
  purchasedCount?: number;
};

type PastLiveSession = {
  id: string;
  title: string;
  description: string;
  scheduledFor: string;
  recordingUrl: string;
  price?: number | null;
  compareAtPrice?: number | null;
  visibility?: string;
  maxParticipants?: number | null;
  purchasedCount?: number;
};

type ChatMessage = {
  id: string;
  user: string;
  text: string;
  timestamp: string;
};

type LiveRecording = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  videoUrl: string;
  price?: number | null;
  compareAtPrice?: number | null;
  visibility?: string;
  maxParticipants?: number | null;
  purchasedCount?: number;
};

type StreamStatus = "offline" | "connecting" | "joining" | "live" | "reconnecting";

type LiveDebugState = {
  role: LiveRole;
  lastEvent: string;
  connectionState: string;
  viewers: number;
  reconnectAttempts: number;
  remoteTracks: number;
  consumerProfile: LiveConsumerProfile;
};

type SignalResolve = (value: unknown) => void;

type RoomProducer = {
  producerId: string;
  kind: "audio" | "video";
};

type MediasoupDeviceLike = {
  loaded: boolean;
  rtpCapabilities: unknown;
  load(options: { routerRtpCapabilities: unknown }): Promise<void>;
  createRecvTransport(options: Record<string, unknown>): MediasoupTransportLike;
  createSendTransport(options: Record<string, unknown>): MediasoupTransportLike;
};

type MediasoupProducerLike = {
  id: string;
  close(): void;
};

type MediasoupCodecLike = {
  mimeType?: string;
};

type MediasoupConsumerLike = {
  id: string;
  track: MediaStreamTrack;
  close(): void;
};

type MediasoupTransportLike = {
  id: string;
  close(): void;
  restartIce(options: { iceParameters: unknown }): Promise<void>;
  on(
    event: "connect",
    listener: (
      parameters: { dtlsParameters: unknown },
      callback: () => void,
      errback: (error: Error) => void
    ) => void | Promise<void>
  ): void;
  on(
    event: "produce",
    listener: (
      parameters: { kind: "audio" | "video"; rtpParameters: unknown },
      callback: ({ id }: { id: string }) => void,
      errback: (error: Error) => void
    ) => void | Promise<void>
  ): void;
  on(event: "connectionstatechange", listener: (state: string) => void): void;
  on(event: string, listener: (...args: unknown[]) => void): void;
  produce(options: {
    track: MediaStreamTrack;
    stopTracks: boolean;
    encodings?: Array<{ maxBitrate: number; scaleResolutionDownBy: number }>;
    codecOptions?: Record<string, number>;
    codec?: MediasoupCodecLike;
  }): Promise<MediasoupProducerLike>;
  consume(options: {
    id: string;
    producerId: string;
    kind: "audio" | "video";
    rtpParameters: unknown;
  }): Promise<MediasoupConsumerLike>;
};

const LIVE_POLL_INTERVAL = 1000;
const CHAT_POLL_INTERVAL = 2000;
const LIVEKIT_ROOM_NAME = "main";
const LIVEKIT_IDENTITY = "streamer";
const LIVEKIT_RECONNECT_DELAY_MS = 3000;
const LIVEKIT_VIDEO_ENCODING = {
  maxBitrate: 8_000_000,
  maxFramerate: 30
};
const MEDIA_RECORDER_MIME_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/mp4;codecs=h264,aac",
  "video/mp4"
];

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function detectAppleWebKit() {
  if (typeof navigator === "undefined") {
    return { isIOS: false, isSafari: false };
  }

  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && "ontouchend" in document);
  const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|Edg|OPR|Firefox|FxiOS/.test(userAgent);

  return { isIOS, isSafari };
}

function getMediaRecorderMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  const supported = MEDIA_RECORDER_MIME_CANDIDATES.find((candidate) => MediaRecorder.isTypeSupported(candidate));
  return supported || "";
}

function normalizeLiveKitUrl(rawUrl: string) {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed);

    if (typeof window !== "undefined" && window.location.protocol === "https:" && parsed.protocol === "ws:") {
      parsed.protocol = "wss:";
    }

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return trimmed.replace(/\/$/, "");
  }
}

function getLiveKitUrl() {
  const configuredUrl = normalizeLiveKitUrl(process.env.NEXT_PUBLIC_LIVEKIT_URL || "");

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== "undefined") {
    if (window.location.hostname === "provibe.ro" || window.location.hostname.endsWith(".provibe.ro")) {
      return "wss://live.provibe.ro";
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.hostname}:7880`;
  }

  return "";
}

function ensureMediaDevicesAvailable() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    throw new Error("Camera este disponibila doar in browser.");
  }

  if (!window.isSecureContext) {
    throw new Error("Camera si microfonul functioneaza doar pe HTTPS sau localhost.");
  }

  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
    throw new Error("Browserul nu expune mediaDevices.getUserMedia in acest context.");
  }
}

function areMessagesEqual(current: ChatMessage[], next: ChatMessage[]) {
  if (current.length !== next.length) {
    return false;
  }

  return current.every(
    (message, index) =>
      message.id === next[index]?.id &&
      message.timestamp === next[index]?.timestamp &&
      message.text === next[index]?.text &&
      message.user === next[index]?.user
  );
}

function areRecordingsEqual(current: LiveRecording[], next: LiveRecording[]) {
  if (current.length !== next.length) {
    return false;
  }

  return current.every(
    (recording, index) =>
      recording.id === next[index]?.id &&
      recording.createdAt === next[index]?.createdAt &&
      recording.videoUrl === next[index]?.videoUrl &&
      recording.price === next[index]?.price &&
      recording.compareAtPrice === next[index]?.compareAtPrice &&
      recording.visibility === next[index]?.visibility &&
      recording.maxParticipants === next[index]?.maxParticipants &&
      recording.purchasedCount === next[index]?.purchasedCount
  );
}

function markSessionOffline(current: LiveSessionSummary | null) {
  if (!current || !current.isLive) {
    return current;
  }

  return {
    ...current,
    isLive: false
  };
}

function clearMessages(current: ChatMessage[]) {
  return current.length ? [] : current;
}

async function getToken(liveId: string, role: LiveRole): Promise<string> {
  const response = await fetch("/api/live/token", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ liveId, role })
  });
  const data = (await response.json().catch(() => null)) as { token?: string; error?: string } | null;

  if (!response.ok || !data?.token) {
    throw new Error(data?.error || "Failed to get LiveKit token.");
  }

  return data.token;
}

function getCountdownParts(targetDate: string | null, now: number) {
  if (!targetDate) {
    return null;
  }

  const target = new Date(targetDate).getTime();

  if (Number.isNaN(target) || target <= now) {
    return null;
  }

  const totalSeconds = Math.max(0, Math.floor((target - now) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    { label: "Zile", value: String(days).padStart(2, "0") },
    { label: "Ore", value: String(hours).padStart(2, "0") },
    { label: "Minute", value: String(minutes).padStart(2, "0") },
    { label: "Secunde", value: String(seconds).padStart(2, "0") }
  ];
}

export function LivePageContent({
  accessibleLiveIds,
  canAccessCurrentSession,
  isAdmin,
  initialSession,
  pastSessions
}: {
  accessibleLiveIds: string[];
  canAccessCurrentSession: boolean;
  isAdmin: boolean;
  initialSession: LiveSessionSummary | null;
  pastSessions: PastLiveSession[];
}) {
  const [currentSession, setCurrentSession] = useState<LiveSessionSummary | null>(initialSession);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [recordings, setRecordings] = useState<LiveRecording[]>(
    pastSessions.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      createdAt: item.scheduledFor,
      videoUrl: item.recordingUrl,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      visibility: item.visibility,
      maxParticipants: item.maxParticipants,
      purchasedCount: item.purchasedCount
    }))
  );
  const [error, setError] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>(initialSession?.isLive ? "connecting" : "offline");
  const [countdownNow, setCountdownNow] = useState(() => Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("user");
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [debug, setDebug] = useState<LiveDebugState>({
    role: isAdmin ? "broadcaster" : "viewer",
    lastEvent: "idle",
    connectionState: "idle",
    viewers: 0,
    reconnectAttempts: 0,
    remoteTracks: 0,
    consumerProfile: "medium"
  });

  const currentSessionRef = useRef<LiveSessionSummary | null>(initialSession);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoStageRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const liveKitRoomRef = useRef<Room | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const deviceRef = useRef<MediasoupDeviceLike | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const sendTransportRef = useRef<MediasoupTransportLike | null>(null);
  const recvTransportRef = useRef<MediasoupTransportLike | null>(null);
  const producersRef = useRef<Map<string, MediasoupProducerLike>>(new Map());
  const consumersRef = useRef<Map<string, { consumer: MediasoupConsumerLike; producerId: string }>>(new Map());
  const pendingRequestsRef = useRef<Map<string, { resolve: SignalResolve; reject: (reason?: unknown) => void }>>(new Map());
  const roomStateRef = useRef<{ producers: RoomProducer[]; viewerCount: number; broadcasterOnline: boolean }>({
    producers: [],
    viewerCount: 0,
    broadcasterOnline: false
  });
  const connectionVersionRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const signalHeartbeatRef = useRef<number | null>(null);
  const adminHeartbeatRef = useRef<number | null>(null);
  const activeRoleRef = useRef<LiveRole | null>(null);
  const connectInFlightRef = useRef<Promise<void> | null>(null);
  const consumeChainRef = useRef<Promise<void>>(Promise.resolve());
  const consumePendingRef = useRef<Set<string>>(new Set());
  const restartInFlightRef = useRef<Set<string>>(new Set());
  const lastBootstrapRef = useRef<LiveBootstrapResponse | null>(null);
  const recordingMimeTypeRef = useRef("video/webm");

  function hasSessionAccess(session: LiveSessionSummary | null | undefined) {
    if (!session) {
      return false;
    }

    if (isAdmin || session.visibility === "PUBLIC" || accessibleLiveIds.includes(session.id)) {
      return true;
    }

    return Boolean(initialSession?.id === session.id && canAccessCurrentSession);
  }

  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCountdownNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    localStreamRef.current = localStream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    if (!chatScrollRef.current) {
      return;
    }

    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [messages]);

  function updateDebug(patch: Partial<LiveDebugState>) {
    setDebug((current) => {
      let changed = false;

      for (const [key, value] of Object.entries(patch) as Array<[keyof LiveDebugState, LiveDebugState[keyof LiveDebugState]]>) {
        if (current[key] !== value) {
          changed = true;
          break;
        }
      }

      if (!changed) {
        return current;
      }

      return {
        ...current,
        ...patch
      };
    });
  }

  async function disconnectLiveKitRoom() {
    const room = liveKitRoomRef.current;

    if (!room) {
      return;
    }

    liveKitRoomRef.current = null;

    try {
      await room.disconnect();
    } catch {}
  }

  function addRemoteTrack(track: RemoteTrack) {
    const mediaTrack = track.mediaStreamTrack;

    if (!remoteStreamRef.current.getTracks().some((item) => item.id === mediaTrack.id)) {
      remoteStreamRef.current.addTrack(mediaTrack);
      setRemoteVideoStream();
    }

    updateDebug({
      remoteTracks: remoteStreamRef.current.getTracks().length,
      lastEvent: `${track.kind} track subscribed`
    });
  }

  function removeRemoteTrack(track: RemoteTrack) {
    const mediaTrack = track.mediaStreamTrack;

    for (const item of remoteStreamRef.current.getTracks()) {
      if (item.id === mediaTrack.id) {
        remoteStreamRef.current.removeTrack(item);
      }
    }

    setRemoteVideoStream();
    updateDebug({
      remoteTracks: remoteStreamRef.current.getTracks().length,
      lastEvent: `${track.kind} track unsubscribed`
    });
  }

  function syncExistingRemoteTracks(room: Room) {
    for (const participant of room.remoteParticipants.values()) {
      for (const publication of participant.trackPublications.values()) {
        const track = publication.track;

        if (track && (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio)) {
          addRemoteTrack(track as RemoteTrack);
        }
      }
    }
  }

  async function api<T>(input: RequestInfo, init?: RequestInit) {
    const response = await fetch(input, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers: {
        ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(init?.headers || {})
      }
    });

    const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null;

    if (!response.ok) {
      throw new Error(data?.error || "Request failed.");
    }

    return data as T;
  }

  function setRemoteVideoStream() {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }

  function clearIntervals() {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (signalHeartbeatRef.current) {
      window.clearInterval(signalHeartbeatRef.current);
      signalHeartbeatRef.current = null;
    }

    if (adminHeartbeatRef.current) {
      window.clearInterval(adminHeartbeatRef.current);
      adminHeartbeatRef.current = null;
    }

    restartInFlightRef.current.clear();
  }

  function clearPendingRequests() {
    for (const pending of pendingRequestsRef.current.values()) {
      pending.reject(new Error("Live signaling connection closed."));
    }

    pendingRequestsRef.current.clear();
  }

  function removeConsumer(producerId: string) {
    for (const [consumerId, entry] of consumersRef.current.entries()) {
      if (entry.producerId !== producerId) {
        continue;
      }

      const track = entry.consumer.track as MediaStreamTrack | undefined;

      if (track) {
        remoteStreamRef.current.removeTrack(track);
      }

      entry.consumer.close();
      consumersRef.current.delete(consumerId);
    }

    updateDebug({ remoteTracks: remoteStreamRef.current.getTracks().length });
    setRemoteVideoStream();
  }

  function syncRoomProducers(nextProducers: RoomProducer[], joinStaggerMs: number) {
    const currentProducers = roomStateRef.current.producers;
    const currentProducerIds = new Set(currentProducers.map((producer) => producer.producerId));
    const nextProducerIds = new Set(nextProducers.map((producer) => producer.producerId));

    for (const producer of currentProducers) {
      if (!nextProducerIds.has(producer.producerId)) {
        removeConsumer(producer.producerId);
      }
    }

    roomStateRef.current = {
      ...roomStateRef.current,
      producers: nextProducers
    };

    if (activeRoleRef.current !== "viewer") {
      return;
    }

    if (!nextProducers.length) {
      setStreamStatus(roomStateRef.current.broadcasterOnline ? "joining" : "offline");
      return;
    }

    for (const producer of nextProducers) {
      if (!currentProducerIds.has(producer.producerId)) {
        void queueConsumeProducer(producer.producerId, joinStaggerMs);
      }
    }
  }

  function teardownConnection(incrementVersion = true) {
    if (incrementVersion) {
      connectionVersionRef.current += 1;
    }

    clearIntervals();
    clearPendingRequests();
    consumePendingRef.current.clear();
    consumeChainRef.current = Promise.resolve();
    lastBootstrapRef.current = null;

    activeRoleRef.current = null;
    roomStateRef.current = {
      producers: [],
      viewerCount: 0,
      broadcasterOnline: false
    };

    for (const producer of producersRef.current.values()) {
      producer.close();
    }

    for (const { consumer } of consumersRef.current.values()) {
      consumer.close();
    }

    producersRef.current.clear();
    consumersRef.current.clear();

    sendTransportRef.current?.close?.();
    recvTransportRef.current?.close?.();
    sendTransportRef.current = null;
    recvTransportRef.current = null;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    void disconnectLiveKitRoom();

    remoteStreamRef.current = new MediaStream();

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    updateDebug({
      connectionState: "disconnected",
      remoteTracks: 0,
      consumerProfile: "medium"
    });
  }

  async function sendSignalRequest<K extends keyof LiveWsRequestMap>(
    action: K,
    data: LiveWsRequestMap[K]
  ): Promise<LiveWsResponseMap[K]> {
    const socket = wsRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error("Live signaling is not connected.");
    }

    const requestId = crypto.randomUUID();

    return new Promise<LiveWsResponseMap[K]>((resolve, reject) => {
      pendingRequestsRef.current.set(requestId, { resolve: resolve as SignalResolve, reject });

      try {
        socket.send(
          JSON.stringify({
            type: "request",
            requestId,
            action,
            data
          } satisfies LiveWsMessage)
        );
      } catch (error) {
        pendingRequestsRef.current.delete(requestId);
        reject(error instanceof Error ? error : new Error("Live signaling request failed."));
      }
    });
  }

  function scheduleReconnect(role: LiveRole, liveId: string, reconnectDelayMs: number) {
    if (reconnectTimeoutRef.current) {
      return;
    }

    setStreamStatus("reconnecting");
    setDebug((current) => ({
      ...current,
      reconnectAttempts: current.reconnectAttempts + 1,
      lastEvent: `${role} reconnect scheduled`
    }));

    reconnectTimeoutRef.current = window.setTimeout(() => {
      reconnectTimeoutRef.current = null;
      void connectToLive(role, liveId);
    }, reconnectDelayMs);
  }

  async function ensureDevice(routerRtpCapabilities: unknown) {
    if (!deviceRef.current) {
      const mediasoupClient = await import("mediasoup-client");
      deviceRef.current = new mediasoupClient.Device() as unknown as MediasoupDeviceLike;
    }

    const device = deviceRef.current as MediasoupDeviceLike;

    if (!device.loaded) {
      await device.load({ routerRtpCapabilities });
    }

    return device;
  }

  function getPreferredVideoCodec(device: MediasoupDeviceLike) {
    const { isIOS, isSafari } = detectAppleWebKit();

    if (!isIOS && !isSafari) {
      return undefined;
    }

    const codecs = ((device?.rtpCapabilities as { codecs?: MediasoupCodecLike[] })?.codecs || []) as MediasoupCodecLike[];
    return codecs.find((codec) => codec.mimeType?.toLowerCase() === "video/h264");
  }

  async function restartTransportIce(kind: "send" | "recv", liveId: string) {
    const transport = kind === "send" ? sendTransportRef.current : recvTransportRef.current;

    if (!transport || restartInFlightRef.current.has(kind)) {
      return;
    }

    restartInFlightRef.current.add(kind);
    updateDebug({ lastEvent: `${kind} transport ICE restart` });

    try {
      const { iceParameters } = await sendSignalRequest("restartIce", { transportId: transport.id });
      await transport.restartIce({ iceParameters });

      if (kind === "recv") {
        setStreamStatus("joining");
      }
    } catch (error) {
      const bootstrap = lastBootstrapRef.current;

      updateDebug({
        lastEvent: `${kind} ICE restart failed`,
        connectionState: "failed"
      });

      if (bootstrap) {
        scheduleReconnect(activeRoleRef.current || "viewer", liveId, bootstrap.reconnectDelayMs);
      }

      throw error;
    } finally {
      restartInFlightRef.current.delete(kind);
    }
  }

  async function consumeProducer(producerId: string) {
    const recvTransport = recvTransportRef.current;
    const device = deviceRef.current;

    if (!recvTransport || !device) {
      return;
    }

    const alreadyConsumed = [...consumersRef.current.values()].some((entry) => entry.producerId === producerId);

    if (alreadyConsumed || consumePendingRef.current.has(producerId)) {
      return;
    }

    consumePendingRef.current.add(producerId);

    try {
      const payload = await sendSignalRequest("consume", {
        transportId: recvTransport.id,
        producerId,
        rtpCapabilities: device.rtpCapabilities
      });

      const consumer = await recvTransport.consume({
        id: payload.id,
        producerId: payload.producerId,
        kind: payload.kind,
        rtpParameters: payload.rtpParameters
      });

      consumersRef.current.set(consumer.id, { consumer, producerId });
      remoteStreamRef.current.addTrack(consumer.track);
      setRemoteVideoStream();

      await sendSignalRequest("resumeConsumer", { consumerId: consumer.id });

      if (payload.kind === "video") {
        setStreamStatus("live");
      }

      updateDebug({
        lastEvent: `consuming ${payload.kind}`,
        remoteTracks: remoteStreamRef.current.getTracks().length
      });
    } finally {
      consumePendingRef.current.delete(producerId);
    }
  }

  function queueConsumeProducer(producerId: string, joinStaggerMs: number) {
    consumeChainRef.current = consumeChainRef.current
      .catch(() => undefined)
      .then(async () => {
        await consumeProducer(producerId);
        if (joinStaggerMs > 0) {
          await wait(joinStaggerMs);
        }
      });

    return consumeChainRef.current;
  }

  async function consumeExistingProducers(joinStaggerMs: number) {
    setStreamStatus(roomStateRef.current.producers.length ? "joining" : "connecting");

    for (const producer of roomStateRef.current.producers) {
      await queueConsumeProducer(producer.producerId, joinStaggerMs);
    }
  }

  function handleLiveEvent(event: LiveWsEvent) {
    switch (event.event) {
      case "roomState": {
        roomStateRef.current = {
          ...roomStateRef.current,
          viewerCount: event.data.viewerCount,
          broadcasterOnline: event.data.broadcasterOnline
        };

        updateDebug({
          viewers: event.data.viewerCount,
          lastEvent: "room state updated"
        });

        syncRoomProducers(event.data.producers, lastBootstrapRef.current?.joinStaggerMs || 0);

        break;
      }

      case "producerAdded": {
        roomStateRef.current = {
          ...roomStateRef.current,
          producers: [...roomStateRef.current.producers.filter((item) => item.producerId !== event.data.producerId), event.data]
        };

        updateDebug({ lastEvent: `${event.data.kind} producer available` });

        if (activeRoleRef.current === "viewer") {
          void queueConsumeProducer(event.data.producerId, lastBootstrapRef.current?.joinStaggerMs || 0);
        }

        break;
      }

      case "producerRemoved": {
        roomStateRef.current = {
          ...roomStateRef.current,
          producers: roomStateRef.current.producers.filter((item) => item.producerId !== event.data.producerId)
        };

        removeConsumer(event.data.producerId);
        updateDebug({ lastEvent: `${event.data.kind} producer removed` });

        if (!roomStateRef.current.producers.some((item) => item.kind === "video")) {
          setStreamStatus("offline");
        }

        break;
      }

      case "streamOffline": {
        setStreamStatus("offline");

        for (const producer of roomStateRef.current.producers) {
          removeConsumer(producer.producerId);
        }

        roomStateRef.current = {
          ...roomStateRef.current,
          producers: [],
          broadcasterOnline: false
        };

        updateDebug({ lastEvent: "stream offline" });
        break;
      }

      case "consumerProfileChanged": {
        updateDebug({
          consumerProfile: event.data.profile,
          lastEvent: `quality ${event.data.profile} (${event.data.reason})`
        });
        break;
      }

      case "error": {
        setError(event.data.message);
        updateDebug({ lastEvent: event.data.message });
        break;
      }

      case "ping": {
        const socket = wsRef.current;

        if (socket?.readyState === WebSocket.OPEN) {
          const pongMessage: LiveWsClientControlMessage = {
            type: "pong",
            ts: event.data.ts
          };

          socket.send(JSON.stringify(pongMessage));
          updateDebug({ lastEvent: "signaling pong sent" });
        }

        break;
      }
    }
  }

  async function attachViewerTransport(bootstrap: LiveBootstrapResponse, version: number) {
    setStreamStatus("joining");
    const { routerRtpCapabilities } = await sendSignalRequest("getRouterRtpCapabilities", undefined);
    const device = await ensureDevice(routerRtpCapabilities);
    const transportOptions = await sendSignalRequest("createTransport", { direction: "recv" });

    if (version !== connectionVersionRef.current) {
      return;
    }

    const transport = device.createRecvTransport({
      ...transportOptions,
      iceServers: bootstrap.iceServers
    });

    transport.on("connect", async ({ dtlsParameters }: { dtlsParameters: unknown }, callback: () => void, errback: (error: Error) => void) => {
      try {
        await sendSignalRequest("connectTransport", {
          transportId: transport.id,
          dtlsParameters
        });
        callback();
      } catch (error) {
        errback(error instanceof Error ? error : new Error("Transport connect failed."));
      }
    });

    transport.on("connectionstatechange", (state: string) => {
      updateDebug({
        connectionState: state,
        lastEvent: `viewer transport ${state}`
      });

      if (state === "connected" && roomStateRef.current.producers.length) {
        setStreamStatus("live");
        updateDebug({ reconnectAttempts: 0 });
      } else if (state === "disconnected" || state === "failed") {
        void restartTransportIce("recv", bootstrap.liveId).catch(() => undefined);
        setStreamStatus("reconnecting");
      }
    });

    recvTransportRef.current = transport;
    await consumeExistingProducers(bootstrap.joinStaggerMs);
  }

  async function publishBroadcasterStream(bootstrap: LiveBootstrapResponse, version: number) {
    setStreamStatus("joining");
    const { routerRtpCapabilities } = await sendSignalRequest("getRouterRtpCapabilities", undefined);
    const device = await ensureDevice(routerRtpCapabilities);
    const transportOptions = await sendSignalRequest("createTransport", { direction: "send" });

    if (version !== connectionVersionRef.current || !localStreamRef.current) {
      return;
    }

    const transport = device.createSendTransport({
      ...transportOptions,
      iceServers: bootstrap.iceServers
    });

    transport.on("connect", async ({ dtlsParameters }: { dtlsParameters: unknown }, callback: () => void, errback: (error: Error) => void) => {
      try {
        await sendSignalRequest("connectTransport", {
          transportId: transport.id,
          dtlsParameters
        });
        callback();
      } catch (error) {
        errback(error instanceof Error ? error : new Error("Transport connect failed."));
      }
    });

    transport.on(
      "produce",
      async (
        {
          kind,
          rtpParameters
        }: {
          kind: "audio" | "video";
          rtpParameters: unknown;
        },
        callback: ({ id }: { id: string }) => void,
        errback: (error: Error) => void
      ) => {
        try {
          const result = await sendSignalRequest("produce", {
            transportId: transport.id,
            kind,
            rtpParameters
          });
          callback({ id: result.id });
        } catch (error) {
          errback(error instanceof Error ? error : new Error("Produce failed."));
        }
      }
    );

    transport.on("connectionstatechange", (state: string) => {
      updateDebug({
        connectionState: state,
        lastEvent: `broadcaster transport ${state}`
      });

      if (state === "connected") {
        setStreamStatus("live");
        updateDebug({ reconnectAttempts: 0 });
      } else if (state === "disconnected" || state === "failed") {
        void restartTransportIce("send", bootstrap.liveId).catch(() => undefined);
        setStreamStatus("reconnecting");
      }
    });

    sendTransportRef.current = transport;
    const preferredVideoCodec = getPreferredVideoCodec(device);

    for (const track of localStreamRef.current.getTracks()) {
      const producer = await transport.produce({
        track,
        stopTracks: false,
        encodings:
          track.kind === "video"
            ? [
                { maxBitrate: 350000, scaleResolutionDownBy: 2.25 },
                { maxBitrate: 900000, scaleResolutionDownBy: 1.5 },
                { maxBitrate: 1600000, scaleResolutionDownBy: 1 }
              ]
            : undefined,
        codecOptions:
          track.kind === "video"
            ? {
                videoGoogleStartBitrate: 700,
                videoGoogleMaxBitrate: 1600
              }
            : undefined,
        codec: track.kind === "video" ? preferredVideoCodec : undefined
      });

      producersRef.current.set(producer.id, producer);
    }
  }

  async function connectToLive(role: LiveRole, liveId: string) {
    if (connectInFlightRef.current) {
      return connectInFlightRef.current;
    }

    const run = (async () => {
      try {
        teardownConnection(true);
        setError(null);
        setStreamStatus(debug.reconnectAttempts > 0 ? "reconnecting" : "connecting");
        updateDebug({
          role,
          lastEvent: `${role} token requested`,
          connectionState: "connecting"
        });
        const liveKitUrl = getLiveKitUrl();

        if (!liveKitUrl) {
          throw new Error("Lipseste NEXT_PUBLIC_LIVEKIT_URL pentru conexiunea live.");
        }

        const token = await getToken(liveId, role);
        const room = new Room({
          adaptiveStream: false,
          dynacast: false
        });

        liveKitRoomRef.current = room;
        activeRoleRef.current = role;
        remoteStreamRef.current = new MediaStream();
        setRemoteVideoStream();

        room.on(RoomEvent.TrackSubscribed, (track: any) => {
          if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
            addRemoteTrack(track as RemoteTrack);
            setStreamStatus("live");
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track: any) => {
          if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
            removeRemoteTrack(track as RemoteTrack);

            if (role === "viewer" && !remoteStreamRef.current.getTracks().length) {
              setStreamStatus("joining");
            }
          }
        });

        room.on(RoomEvent.ParticipantConnected, () => {
          updateDebug({
            viewers: room.remoteParticipants.size,
            lastEvent: "participant connected"
          });
        });

        room.on(RoomEvent.ParticipantDisconnected, () => {
          updateDebug({
            viewers: room.remoteParticipants.size,
            lastEvent: "participant disconnected"
          });
        });

        room.on(RoomEvent.Disconnected, () => {
          if (liveKitRoomRef.current === room) {
            liveKitRoomRef.current = null;
          }

          updateDebug({
            connectionState: "closed",
            lastEvent: `${role} room disconnected`,
            viewers: room.remoteParticipants.size
          });

          if (currentSessionRef.current?.isLive) {
            scheduleReconnect(role, liveId, LIVEKIT_RECONNECT_DELAY_MS);
          } else {
            setStreamStatus("offline");
          }
        });

        await room.connect(liveKitUrl, token);
        syncExistingRemoteTracks(room);

        updateDebug({
          connectionState: "connected",
          viewers: room.remoteParticipants.size,
          lastEvent: `${role} connected to ${LIVEKIT_ROOM_NAME} via ${liveKitUrl}`
        });

        if (role === "viewer") {
          setStreamStatus(remoteStreamRef.current.getTracks().length ? "live" : "joining");
          return;
        }

        const stream = localStreamRef.current ?? await getSafeBroadcastStream();

        if (!localStreamRef.current) {
          setLocalStream(stream);
        }

        for (const track of stream.getTracks()) {
          await room.localParticipant.publishTrack(
            track,
            track.kind === "video"
              ? {
                  source: Track.Source.Camera,
                  videoCodec: "h264",
                  videoEncoding: LIVEKIT_VIDEO_ENCODING
                }
              : {
                  source: Track.Source.Microphone
                }
          );
        }

        adminHeartbeatRef.current = window.setInterval(() => {
          if (!currentSessionRef.current?.id) {
            return;
          }

          void api("/api/live/heartbeat", {
            method: "POST",
            body: JSON.stringify({ liveId: currentSessionRef.current.id })
          }).catch(() => {
            updateDebug({ lastEvent: "admin heartbeat failed" });
          });
        }, 10000);

        setStreamStatus("live");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Live connection failed.";
        await disconnectLiveKitRoom();
        setError(message);
        updateDebug({
          connectionState: "failed",
          lastEvent: message
        });

        if (currentSessionRef.current?.isLive) {
          scheduleReconnect(role, liveId, LIVEKIT_RECONNECT_DELAY_MS);
        } else {
          setStreamStatus("offline");
        }
      }
    })();

    connectInFlightRef.current = run.finally(() => {
      connectInFlightRef.current = null;
    });

    return connectInFlightRef.current;
  }

  async function loadCurrentLive() {
    try {
      const data = await api<{
        live: {
          id: string;
          title: string;
          description: string;
          scheduledFor: string;
          price?: number | null;
          compareAtPrice?: number | null;
          visibility?: string;
          maxParticipants?: number | null;
          purchasedCount?: number;
        } | null;
      }>("/api/live/current");

      if (!data.live) {
        setCurrentSession(markSessionOffline);
        setStreamStatus("offline");
        teardownConnection(true);
        return;
      }

      const live = data.live;

      setCurrentSession((current) => {
        if (
          current &&
          current.id === live.id &&
          current.title === live.title &&
          current.description === live.description &&
          current.scheduledFor === live.scheduledFor &&
          current.isLive &&
          current.price === live.price &&
          current.compareAtPrice === live.compareAtPrice &&
          current.visibility === live.visibility &&
          current.maxParticipants === live.maxParticipants &&
          current.purchasedCount === live.purchasedCount
        ) {
          return current;
        }

        return {
          id: live.id,
          title: live.title,
          description: live.description,
          scheduledFor: live.scheduledFor,
          isLive: true,
          price: live.price,
          compareAtPrice: live.compareAtPrice,
          visibility: live.visibility,
          maxParticipants: live.maxParticipants,
          purchasedCount: live.purchasedCount
        };
      });
    } catch {
      setCurrentSession(markSessionOffline);
      setStreamStatus("offline");
    }
  }

  async function loadMessages() {
    if (!currentSession?.isLive || !hasSessionAccess(currentSession)) {
      return;
    }

    const data = await api<{ messages: ChatMessage[] }>(`/api/chat/${currentSession.id}`);
    setMessages((current) => (areMessagesEqual(current, data.messages) ? current : data.messages));
  }

  async function loadRecordings() {
    const data = await api<{ recordings: LiveRecording[] }>("/api/live/recordings");
    setRecordings((current) => (areRecordingsEqual(current, data.recordings) ? current : data.recordings));
  }

  function buildCaptureProfiles(facingMode?: "user" | "environment", includeAudio = true) {
    const { isIOS, isSafari } = detectAppleWebKit();
    const audioConstraints = includeAudio
      ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      : false;

    if (isIOS || isSafari) {
      return [
        {
          video: {
            facingMode: facingMode ? { ideal: facingMode } : undefined,
            aspectRatio: { ideal: 16 / 9 },
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 30, max: 30 }
          },
          audio: audioConstraints
        },
        {
          video: {
            facingMode: facingMode ? { ideal: facingMode } : undefined,
            aspectRatio: { ideal: 16 / 9 },
            width: { ideal: 1280, max: 1280 },
            height: { ideal: 720, max: 720 },
            frameRate: { ideal: 30, max: 30 }
          },
          audio: audioConstraints
        }
      ] satisfies MediaStreamConstraints[];
    }

    return [
      {
        video: {
          facingMode: facingMode ? { ideal: facingMode } : undefined,
          aspectRatio: { ideal: 16 / 9 },
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 60, max: 60 }
        },
        audio: audioConstraints
      },
      {
        video: {
          facingMode: facingMode ? { ideal: facingMode } : undefined,
          aspectRatio: { ideal: 16 / 9 },
          width: { ideal: 1280, max: 1280 },
          height: { ideal: 720, max: 720 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: audioConstraints
      },
      {
        video: {
          facingMode: facingMode ? { ideal: facingMode } : undefined,
          aspectRatio: { ideal: 16 / 9 },
          width: { ideal: 854, max: 854 },
          height: { ideal: 480, max: 480 },
          frameRate: { ideal: 24, max: 24 }
        },
        audio: audioConstraints
      }
    ] satisfies MediaStreamConstraints[];
  }

  async function getSafeBroadcastStream(facingMode = cameraFacingMode, includeAudio = true) {
    ensureMediaDevicesAvailable();

    const profiles = buildCaptureProfiles(facingMode, includeAudio);
    let lastError: unknown;

    for (const constraints of profiles) {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Could not access camera or microphone.");
  }

  async function switchCamera() {
    if (!isAdmin || isSwitchingCamera || !localStreamRef.current) {
      return;
    }

    const nextFacingMode = cameraFacingMode === "user" ? "environment" : "user";

    try {
      setIsSwitchingCamera(true);
      setError(null);
      const currentDeviceId = localStreamRef.current.getVideoTracks()[0]?.getSettings().deviceId || "";
      const videoInputs = typeof navigator.mediaDevices.enumerateDevices === "function"
        ? (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "videoinput")
        : [];
      const currentIndex = videoInputs.findIndex((device) => device.deviceId === currentDeviceId);
      const nextDeviceId = videoInputs.length > 1 ? videoInputs[(currentIndex + 1 + videoInputs.length) % videoInputs.length]?.deviceId || "" : "";
      let nextStream: MediaStream | null = null;

      try {
        if (nextDeviceId) {
          nextStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: nextDeviceId },
              width: { ideal: 1920, max: 1920 },
              height: { ideal: 1080, max: 1080 },
              frameRate: { ideal: 30, max: 30 },
              aspectRatio: { ideal: 16 / 9 }
            },
            audio: false
          });
        } else {
          throw new Error("No alternate device id");
        }
      } catch {
        try {
          nextStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { exact: nextFacingMode },
              width: { ideal: 1920, max: 1920 },
              height: { ideal: 1080, max: 1080 },
              frameRate: { ideal: 30, max: 30 },
              aspectRatio: { ideal: 16 / 9 }
            },
            audio: false
          });
        } catch {
          nextStream = await getSafeBroadcastStream(nextFacingMode, false);
        }
      }

      const nextVideoTrack = nextStream.getVideoTracks()[0];

      if (!nextVideoTrack) {
        throw new Error("Camera noua nu este disponibila.");
      }

      const currentStream = localStreamRef.current;
      const currentVideoTrack = currentStream.getVideoTracks()[0] || null;
      const audioTracks = currentStream.getAudioTracks();
      const replacementStream = new MediaStream([...audioTracks, nextVideoTrack]);

      const room = liveKitRoomRef.current;

      if (room) {
          const publishedVideoTrack = (Array.from(room.localParticipant.videoTrackPublications.values()) as any[]).find(
            (publication: any) => publication?.track
          )?.track as { mediaStreamTrack: MediaStreamTrack } | undefined;

        if (publishedVideoTrack) {
          await room.localParticipant.unpublishTrack(publishedVideoTrack.mediaStreamTrack, false);
        }

        await room.localParticipant.publishTrack(nextVideoTrack, {
          source: Track.Source.Camera,
          videoCodec: "h264",
          videoEncoding: LIVEKIT_VIDEO_ENCODING
        });
      }

      currentVideoTrack?.stop();
      setLocalStream(replacementStream);
      setCameraFacingMode(nextFacingMode);
      updateDebug({ lastEvent: `camera switched to ${nextFacingMode}` });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Camera nu a putut fi schimbata.");
    } finally {
      setIsSwitchingCamera(false);
    }
  }

  async function startLive() {
    if (!currentSession) {
      setError("Creeaza mai intai o sesiune LIVE din admin.");
      return;
    }

    let liveStarted = false;

    try {
      setError(null);
      setStreamStatus("connecting");

      teardownConnection(true);
      const stream = await getSafeBroadcastStream();
      setLocalStream(stream);

      recordedChunksRef.current = [];
      const recordingMimeType = getMediaRecorderMimeType();
      recordingMimeTypeRef.current = recordingMimeType || "video/webm";
      const mediaRecorder = recordingMimeType
        ? new MediaRecorder(stream, { mimeType: recordingMimeType })
        : new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.start(2000);
      mediaRecorderRef.current = mediaRecorder;

      await api("/api/live/start", {
        method: "POST",
        body: JSON.stringify({ liveId: currentSession.id })
      });
      liveStarted = true;

      const nextSession = { ...currentSession, isLive: true };
      setCurrentSession(nextSession);
      currentSessionRef.current = nextSession;
      updateDebug({
        role: "broadcaster",
        lastEvent: `live started as ${LIVEKIT_IDENTITY}`
      });
      await connectToLive("broadcaster", currentSession.id);
    } catch (error) {
      await disconnectLiveKitRoom();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      mediaRecorderRef.current = null;
      recordedChunksRef.current = [];
      if (liveStarted) {
        await api("/api/live/stop", {
          method: "POST",
          body: JSON.stringify({ liveId: currentSession.id })
        }).catch(() => undefined);
      }
      setStreamStatus("offline");
      setError(error instanceof Error ? error.message : "Nu s-a putut porni sesiunea live.");
    }
  }

  async function stopLive() {
    if (!currentSession) {
      return;
    }

    await disconnectLiveKitRoom();
    teardownConnection(true);

    await api("/api/live/stop", {
      method: "POST",
      body: JSON.stringify({ liveId: currentSession.id })
    });

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      await new Promise<void>((resolve) => {
        mediaRecorderRef.current?.addEventListener("stop", () => resolve(), { once: true });
        mediaRecorderRef.current?.stop();
      });
    }

    if (recordedChunksRef.current.length) {
      const formData = new FormData();
      formData.append("liveId", currentSession.id);
      const recordingMimeType = recordingMimeTypeRef.current || "video/webm";
      const recordingExtension = recordingMimeType.includes("mp4") ? "mp4" : "webm";
      formData.append(
        "video",
        new File(recordedChunksRef.current, `${currentSession.id}.${recordingExtension}`, { type: recordingMimeType })
      );

      const uploadResponse = await fetch("/api/live/upload", {
        method: "POST",
        credentials: "include",
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error("Recording upload failed.");
      }
    }

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    recordingMimeTypeRef.current = "video/webm";
    setCurrentSession(markSessionOffline);
    setMessages(clearMessages);
    setStreamStatus("offline");
    await loadRecordings();
  }

  useEffect(() => {
    void loadRecordings();
    void loadCurrentLive();

    const interval = window.setInterval(() => {
      void loadCurrentLive();
    }, LIVE_POLL_INTERVAL);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    if (!currentSession?.isLive || !hasSessionAccess(currentSession)) {
      return;
    }

    void loadMessages();

    const interval = window.setInterval(() => {
      void loadMessages();
    }, CHAT_POLL_INTERVAL);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession?.id, currentSession?.isLive, accessibleLiveIds, isAdmin, canAccessCurrentSession]);

  useEffect(() => {
    if (!currentSession?.isLive) {
      teardownConnection(true);
      return;
    }

    if (isAdmin) {
      if (localStreamRef.current && activeRoleRef.current !== "broadcaster" && !liveKitRoomRef.current) {
        void connectToLive("broadcaster", currentSession.id);
      }

      return;
    }

    if (!hasSessionAccess(currentSession)) {
      return;
    }

    if (activeRoleRef.current !== "viewer") {
      void connectToLive("viewer", currentSession.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession?.id, currentSession?.isLive, accessibleLiveIds, isAdmin, canAccessCurrentSession]);

  useEffect(() => {
    return () => {
      teardownConnection(true);
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleOnline() {
      const session = currentSessionRef.current;
      const role = activeRoleRef.current;

      if (session?.isLive && role) {
        scheduleReconnect(role, session.id, LIVEKIT_RECONNECT_DELAY_MS);
      }
    }

    function handleOffline() {
      updateDebug({
        connectionState: "offline",
        lastEvent: "network offline"
      });
      setStreamStatus("reconnecting");
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMessage() {
    if (!chatText.trim() || !currentSession?.isLive || !hasSessionAccess(currentSession)) {
      return;
    }

    await api(`/api/chat/${currentSession.id}`, {
      method: "POST",
      body: JSON.stringify({ text: chatText.trim() })
    });

    setChatText("");
    await loadMessages();
  }

  async function toggleFullscreen() {
    setIsFullscreen((current) => !current);
  }

  const canViewCurrentSession = hasSessionAccess(currentSession);
  const countdownParts = !currentSession?.isLive ? getCountdownParts(currentSession?.scheduledFor || null, countdownNow) : null;
  const sessionScheduleLabel = currentSession?.scheduledFor
    ? new Date(currentSession.scheduledFor).toLocaleString("ro-RO", {
        timeZone: "Europe/Bucharest",
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      })
    : null;
  const statusLabel =
    streamStatus === "live"
      ? "LIVE"
      : streamStatus === "joining"
        ? "Joining"
        : streamStatus === "connecting" || streamStatus === "reconnecting"
          ? "Connecting"
          : "Offline";
  const canUseChat = canViewCurrentSession && Boolean(currentSession?.isLive);
  const currentSessionHasDiscount = Boolean(
    currentSession?.compareAtPrice &&
    currentSession?.price &&
    currentSession.compareAtPrice > currentSession.price
  );
  const currentSessionDiscountPercent = currentSessionHasDiscount
    ? Math.round(
        (((currentSession?.compareAtPrice || 0) - (currentSession?.price || 0)) / (currentSession?.compareAtPrice || 1)) * 100
      )
    : 0;
  const currentSessionLocked = Boolean(currentSession && !canViewCurrentSession && !isAdmin);
  const currentSessionSoldOut = Boolean(
    !canViewCurrentSession &&
    currentSession?.maxParticipants &&
    (currentSession?.purchasedCount || 0) >= currentSession.maxParticipants
  );
  const chatPanel = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#d6b98c]">Live Chat</p>
          </div>
          <div className="rounded-full bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-white/[0.45]">
            {messages.length} mesaje
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 py-3 sm:px-4">
        {canUseChat ? (
          <div className="flex h-full flex-col">
            <div ref={chatScrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.length ? (
                messages.map((item, index) => {
                  const isRight = index % 2 === 1;

                  return (
                    <div key={item.id} className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[88%] rounded-[1.5rem] px-4 py-3 ${
                          isRight
                            ? "rounded-br-md bg-[linear-gradient(180deg,#ecd4ac,#cfab72)] text-black shadow-[0_20px_36px_rgba(214,185,140,0.18)]"
                            : "rounded-bl-md bg-white/[0.05] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                        }`}
                      >
                        <p className={`text-xs font-medium ${isRight ? "text-black/70" : "text-white/[0.55]"}`}>
                          {item.user}
                        </p>
                        <p className="mt-1 text-sm leading-6">{item.text}</p>
                        <p className={`mt-2 text-[11px] ${isRight ? "text-black/[0.55]" : "text-white/[0.35]"}`}>
                          {new Date(item.timestamp).toLocaleTimeString("ro-RO", {
                            timeZone: "Europe/Bucharest",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-full min-h-[14rem] items-center justify-center rounded-[1.4rem] bg-white/[0.03] px-5 text-center text-sm text-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  Chatul este activ. Primul mesaj poate fi trimis acum.
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={chatText}
                onChange={(event) => setChatText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                maxLength={500}
                placeholder="Scrie un mesaj"
                className="premium-input h-12 flex-1"
              />
              <Button type="button" className="min-h-12 shrink-0" onClick={() => void sendMessage()}>
                Trimite
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[18rem] items-center justify-center rounded-[1.4rem] bg-white/[0.03] px-5 text-center text-sm text-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            {currentSession?.isLive
              ? "Chatul devine activ imediat dupa achizitia live-ului curent."
              : "Chatul devine activ cand sesiunea achizitionata intra LIVE."}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-24 sm:space-y-6 xl:pb-0">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.68fr)_22rem] xl:items-start">
        <div className="space-y-5">
          <div className="panel-edge overflow-hidden rounded-[1.65rem] sm:rounded-[2.2rem]">
            <div className="grid gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.32em] text-white/[0.64]">
                    <span className="live-dot" />
                    {statusLabel}
                  </div>
                  {currentSessionLocked ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d6b98c]/20 bg-[#d6b98c]/10 px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-[#f3dfbf]">
                      <Lock className="h-3.5 w-3.5" />
                      Live blocat
                    </div>
                  ) : null}
                  {sessionScheduleLabel ? (
                    <div className="rounded-full bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-white/[0.45]">
                      {sessionScheduleLabel}
                    </div>
                  ) : null}
                  {isAdmin && currentSession?.maxParticipants ? (
                    <div className="rounded-full bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-white/[0.45]">
                      Locuri {currentSession.purchasedCount || 0}/{currentSession.maxParticipants}
                    </div>
                  ) : null}
                </div>
                <h2 className="mt-3 max-w-4xl text-[2rem] leading-[0.94] text-white sm:text-4xl lg:text-[4.2rem]">
                  {currentSession?.title || "LIVE Barber Experience"}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/[0.58] sm:text-base sm:leading-7">
                  {currentSession?.isLive
                    ? "Video-ul si chatul raman vizibile impreuna, inclusiv pe telefon."
                    : countdownParts
                      ? "Urmatoarea sesiune este programata."
                      : currentSessionSoldOut
                        ? "Locurile pentru sesiunea live au fost ocupate."
                        : canViewCurrentSession
                        ? "Momentan nu este nici un live activ."
                        : "Live-ul se deblocheaza individual, doar pentru sesiunea pe care o cumperi."}
                </p>
                {currentSession?.price ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {currentSessionHasDiscount ? (
                      <span className="text-sm text-white/35 line-through">{formatLei(currentSession.compareAtPrice || 0)}</span>
                    ) : null}
                    <span className="rounded-full border border-red-500/30 bg-red-500/15 px-5 py-3 text-base font-semibold text-red-100 shadow-[0_18px_40px_rgba(185,28,28,0.28)]">
                      {formatLei(currentSession.price)}
                    </span>
                    {currentSessionHasDiscount ? (
                      <span className="rounded-full border border-red-500/30 bg-red-500/12 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-red-100">
                        Reducere {currentSessionDiscountPercent}%
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button type="button" variant="secondary" className="min-h-11" onClick={() => void toggleFullscreen()}>
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  {isFullscreen ? "Iesi fullscreen" : "Fullscreen"}
                </Button>
                {isAdmin ? (
                  <>
                    <Button type="button" className="min-h-11" onClick={() => void startLive()} disabled={!currentSession || currentSession.isLive}>
                      Go Live
                    </Button>
                    <Button type="button" variant="secondary" className="min-h-11" onClick={() => void switchCamera()} disabled={!localStream || isSwitchingCamera}>
                      <Camera className="h-4 w-4" />
                      {isSwitchingCamera ? "Schimba..." : "Intoarce camera"}
                    </Button>
                    <Button type="button" variant="secondary" className="min-h-11" onClick={() => void stopLive()} disabled={!currentSession?.isLive}>
                      Stop Live
                    </Button>
                  </>
                ) : null}
              </div>
            </div>

            {countdownParts ? (
              <div className="grid grid-cols-4 gap-2 border-t border-white/10 px-3 py-4 sm:gap-3 sm:px-6">
                {countdownParts.map((item) => (
                  <div
                    key={item.label}
                    className="countdown-tile"
                    style={{ animation: "countdownPulse 2.8s ease-in-out infinite" }}
                  >
                    <div className="text-[1.85rem] leading-none text-white sm:text-[2.4rem]">{item.value}</div>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.28em] text-white/[0.42]">{item.label}</div>
                  </div>
                ))}
              </div>
            ) : null}

              <div
                ref={videoStageRef}
                className={`relative overflow-hidden bg-black ${isFullscreen ? "fixed inset-0 z-[90] flex items-center justify-center" : "max-h-[calc(100svh-18rem)] sm:max-h-none"}`}
                onDoubleClick={() => void toggleFullscreen()}
              >
                <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(214,185,140,0.12),transparent_28%)]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-[linear-gradient(180deg,rgba(0,0,0,0.45),transparent)]" />
              {isAdmin && localStream ? (
                <video ref={localVideoRef} autoPlay muted playsInline className={`${isFullscreen ? "h-full w-full object-contain" : "aspect-video max-h-[calc(100svh-18rem)] min-h-0 w-full bg-black object-contain sm:max-h-none sm:min-h-[18rem] xl:min-h-[20rem]"}`} />
              ) : currentSession?.isLive ? (
                <video ref={remoteVideoRef} autoPlay playsInline controls className={`${isFullscreen ? "h-full w-full object-contain" : "aspect-video max-h-[calc(100svh-18rem)] min-h-0 w-full bg-black object-contain sm:max-h-none sm:min-h-[18rem] xl:min-h-[20rem]"}`} />
              ) : (
                <div className={`flex items-center justify-center bg-black px-6 text-center text-white/60 ${isFullscreen ? "h-full w-full" : "aspect-video max-h-[calc(100svh-18rem)] min-h-0 sm:max-h-none sm:min-h-[18rem] xl:min-h-[20rem]"}`}>
                  {currentSessionSoldOut ? "Sesiunea live este sold out." : canViewCurrentSession ? "Niciun LIVE activ momentan" : "Cumpara live-ul curent pentru acces instant la video si chat."}
                </div>
              )}

                <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-2 sm:left-4 sm:top-4">
                  <div className="rounded-full bg-black/[0.55] px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-white backdrop-blur-md">
                    <Radio className="mr-1 inline h-3.5 w-3.5 text-red-300" />
                    {statusLabel}
                  </div>
                  {currentSessionLocked ? (
                    <div className="rounded-full border border-[#d6b98c]/20 bg-black/[0.62] px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-[#f3dfbf] backdrop-blur-md">
                      <Lock className="mr-1 inline h-3.5 w-3.5" />
                      Acces blocat
                    </div>
                  ) : null}
                  {isAdmin && currentSession?.isLive ? (
                    <div className="rounded-full bg-black/[0.62] px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-white backdrop-blur-md">
                      Spectatori {debug.viewers}
                    </div>
                  ) : null}
                </div>

              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className="absolute right-3 top-3 z-20 inline-flex items-center gap-2 rounded-full bg-black/[0.55] px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-white backdrop-blur-md transition hover:bg-black/70 sm:right-4 sm:top-4"
              >
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                {isFullscreen ? "Iesi" : "Fullscreen"}
              </button>

              {currentSession?.isLive && !isAdmin && streamStatus !== "live" ? (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/[0.55] px-6 text-center text-sm text-white/75 backdrop-blur-sm">
                  {streamStatus === "reconnecting"
                    ? "Conexiunea la live se reface automat."
                    : streamStatus === "joining"
                      ? "Se intra treptat in sesiunea live pentru o conexiune stabila."
                      : streamStatus === "connecting"
                        ? "Se conecteaza la fluxul live."
                        : "Fluxul este offline momentan."}
                </div>
              ) : null}
            </div>

            {currentSession?.isLive ? (
              <div className="border-t border-white/10 xl:hidden">
                <div className="flex h-[17.5rem] flex-col">
                  {chatPanel}
                </div>
              </div>
            ) : null}

              <div className="grid gap-3 border-t border-white/10 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="space-y-2">
                  <p className="text-sm leading-6 text-white/[0.58] sm:leading-7">
                    {currentSession?.isLive
                      ? currentSession.description
                      : countdownParts
                        ? "Timerul de mai sus afiseaza timpul ramas pana la urmatorul LIVE."
                        : "Cand adminul programeaza o sesiune, countdown-ul apare automat in aceasta zona."}
                  </p>
                  {currentSession?.description && !currentSession?.isLive ? (
                    <p className="hidden text-sm leading-7 text-white/[0.44] sm:block">{currentSession.description}</p>
                  ) : null}
                </div>
                {!canViewCurrentSession && !isAdmin && currentSession?.price && !currentSessionSoldOut ? (
                  <div className="flex flex-col items-start gap-2">
                    <Button asChild className="min-h-11">
                      <a href={`/checkout?mode=payment&liveSessionId=${currentSession.id}`}>
                        Cumpara live-ul {formatLei(currentSession.price)}
                      </a>
                    </Button>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-white/60">
                      {currentSessionHasDiscount ? (
                        <>
                          <span className="line-through text-white/35">{formatLei(currentSession.compareAtPrice || 0)}</span>
                          <span className="text-white">{formatLei(currentSession.price)}</span>
                          <span className="rounded-full border border-red-500/30 bg-red-500/12 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-red-100">
                            -{currentSessionDiscountPercent}%
                          </span>
                        </>
                      ) : (
                        <span>{formatLei(currentSession.price)}</span>
                      )}
                    </div>
                  </div>
                ) : currentSessionSoldOut ? (
                  <div className="rounded-full border border-red-500/30 bg-red-500/12 px-4 py-3 text-sm text-red-100">
                    Locurile live sunt ocupate. Replay-ul poate fi cumparat dupa salvare.
                  </div>
                ) : null}
              </div>

            {error ? <p className="px-4 pb-4 text-sm text-red-300 sm:px-6">{error}</p> : null}
          </div>

          <div className="hidden xl:block">
            <PastLiveList
              accessibleLiveIds={accessibleLiveIds}
              isAdmin={isAdmin}
              sessions={recordings.map((item) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                scheduledFor: item.createdAt,
                recordingUrl: item.videoUrl,
                price: item.price,
                compareAtPrice: item.compareAtPrice,
                visibility: item.visibility,
                maxParticipants: item.maxParticipants,
                purchasedCount: item.purchasedCount
              }))}
            />
          </div>
        </div>

        <div className="hidden xl:block xl:sticky xl:top-24">
          <div className="panel-edge flex min-h-[38rem] flex-col overflow-hidden rounded-[2rem]">
            {chatPanel}
          </div>
        </div>
      </div>

      <div className="xl:hidden">
        <PastLiveList
          accessibleLiveIds={accessibleLiveIds}
          isAdmin={isAdmin}
          sessions={recordings.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            scheduledFor: item.createdAt,
            recordingUrl: item.videoUrl,
            price: item.price,
            compareAtPrice: item.compareAtPrice,
            visibility: item.visibility,
            maxParticipants: item.maxParticipants,
            purchasedCount: item.purchasedCount
          }))}
        />
      </div>
    </div>
  );
}


