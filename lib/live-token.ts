import { createHmac, timingSafeEqual } from "crypto";

import type { LiveRole } from "@/types/live-media";

type LiveTokenClaims = {
  userId: string;
  liveId: string;
  role: LiveRole;
  exp: number;
  iat: number;
};

const LIVE_TOKEN_VERSION = 1;
const DEFAULT_TOKEN_TTL_MS = 5 * 60 * 1000;

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSecret() {
  const secret = process.env.LIVE_SERVER_SECRET || process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("LIVE_SERVER_SECRET is not configured.");
  }

  return secret;
}

function signPayload(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createLiveToken(input: { userId: string; liveId: string; role: LiveRole; ttlMs?: number }) {
  const now = Date.now();
  const claims: LiveTokenClaims = {
    userId: input.userId,
    liveId: input.liveId,
    role: input.role,
    iat: now,
    exp: now + (input.ttlMs || DEFAULT_TOKEN_TTL_MS)
  };

  const payload = base64UrlEncode(JSON.stringify({ v: LIVE_TOKEN_VERSION, ...claims }));
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function verifyLiveToken(token: string) {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    throw new Error("Invalid live token.");
  }

  const expectedSignature = signPayload(payload);

  if (
    expectedSignature.length !== signature.length ||
    !timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
  ) {
    throw new Error("Live token signature mismatch.");
  }

  const parsed = JSON.parse(base64UrlDecode(payload)) as LiveTokenClaims & { v?: number };

  if (parsed.v !== LIVE_TOKEN_VERSION) {
    throw new Error("Unsupported live token version.");
  }

  if (!parsed.userId || !parsed.liveId || !parsed.role) {
    throw new Error("Live token payload is incomplete.");
  }

  if (parsed.exp <= Date.now()) {
    throw new Error("Live token expired.");
  }

  return {
    userId: parsed.userId,
    liveId: parsed.liveId,
    role: parsed.role
  };
}
