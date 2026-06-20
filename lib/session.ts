import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * Cookie-based session for the access gate.
 * Payload is HMAC-signed so it can't be tampered with client-side.
 * Lifetime: 30 minutes.
 */

const COOKIE_NAME = "ag_session";
const MAX_AGE_SECONDS = 30 * 60; // 30 minutes

type SessionPayload = {
  is_validated: true;
  code_id: string;
  exp: number; // unix seconds
};

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function sign(data: string): string {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
}

function encode(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  // Constant-time signature check.
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (!payload.is_validated || !payload.code_id) return null;
    if (Date.now() / 1000 > payload.exp) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

/** Create a validated session for a given code. */
export async function createSession(code_id: string): Promise<void> {
  const payload: SessionPayload = {
    is_validated: true,
    code_id,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const store = await cookies();
  store.set(COOKIE_NAME, encode(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Returns the active session, or null if missing/expired/tampered. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return decode(store.get(COOKIE_NAME)?.value);
}

/** Clear the access session (called after a successful entry). */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}
