import type { LiveIceServer } from "@/types/live-media";

const DEFAULT_STALE_AFTER_MS = 30000;
const DEFAULT_HEARTBEAT_INTERVAL_MS = 10000;
const DEFAULT_RECONNECT_DELAY_MS = 3000;
const DEFAULT_MAX_VIEWERS = 100;
const DEFAULT_JOIN_STAGGER_MS = 120;
const DEFAULT_SIGNAL_RATE_LIMIT_WINDOW_MS = 5000;
const DEFAULT_SIGNAL_RATE_LIMIT_MAX = 60;
const DEFAULT_ROOM_SIGNAL_RATE_LIMIT_MAX = 300;
const DEFAULT_WS_BACKPRESSURE_BYTES = 262144;
const DEFAULT_CONSUMER_MONITOR_INTERVAL_MS = 5000;

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getLiveSessionStaleAfterMs() {
  return parseNumber(process.env.LIVE_SESSION_STALE_AFTER_MS, DEFAULT_STALE_AFTER_MS);
}

export function getLiveHeartbeatIntervalMs() {
  return parseNumber(process.env.LIVE_HEARTBEAT_INTERVAL_MS, DEFAULT_HEARTBEAT_INTERVAL_MS);
}

export function getLiveReconnectDelayMs() {
  return parseNumber(process.env.LIVE_RECONNECT_DELAY_MS, DEFAULT_RECONNECT_DELAY_MS);
}

export function getLiveMaxViewers() {
  return parseNumber(process.env.LIVE_MAX_VIEWERS, DEFAULT_MAX_VIEWERS);
}

export function getLiveJoinStaggerMs() {
  return parseNumber(process.env.LIVE_JOIN_STAGGER_MS, DEFAULT_JOIN_STAGGER_MS);
}

export function getLiveSignalRateLimitWindowMs() {
  return parseNumber(process.env.LIVE_SIGNAL_RATE_LIMIT_WINDOW_MS, DEFAULT_SIGNAL_RATE_LIMIT_WINDOW_MS);
}

export function getLiveSignalRateLimitMax() {
  return parseNumber(process.env.LIVE_SIGNAL_RATE_LIMIT_MAX, DEFAULT_SIGNAL_RATE_LIMIT_MAX);
}

export function getLiveRoomSignalRateLimitMax() {
  return parseNumber(process.env.LIVE_ROOM_SIGNAL_RATE_LIMIT_MAX, DEFAULT_ROOM_SIGNAL_RATE_LIMIT_MAX);
}

export function getLiveWsBackpressureBytes() {
  return parseNumber(process.env.LIVE_WS_BACKPRESSURE_BYTES, DEFAULT_WS_BACKPRESSURE_BYTES);
}

export function getLiveConsumerMonitorIntervalMs() {
  return parseNumber(process.env.LIVE_CONSUMER_MONITOR_INTERVAL_MS, DEFAULT_CONSUMER_MONITOR_INTERVAL_MS);
}

export function getLiveWebSocketUrl() {
  return process.env.LIVE_WS_URL || "ws://localhost:3001/live";
}

export function getLiveIceServers(): LiveIceServer[] {
  const rawValue = process.env.LIVE_ICE_SERVERS?.trim();

  if (!rawValue) {
    return [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ];
  }

  try {
    const parsed = JSON.parse(rawValue) as LiveIceServer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
