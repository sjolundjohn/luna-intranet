/**
 * First-party signed session for nightluna.com.
 *
 * Why this exists: Cloudflare Access sets the `CF_Authorization` token as a
 * cookie on the *team* domain (lunadiabetes.cloudflareaccess.com) but, in
 * modern browsers, fails to mirror it onto the *app* domain (nightluna.com).
 * A same-origin XHR to a gated `/api` path therefore carries no Access token
 * and gets 302'd to the login page — which is why posting a comment silently
 * fails even when the user is fully signed in.
 *
 * The fix routes around that: the root middleware (functions/_middleware.ts)
 * runs on every Access-authenticated page load — where Access DOES forward the
 * verified identity to the origin via headers — and mints a first-party
 * HMAC-signed cookie (`nl_session`) scoped to nightluna.com. API routes that
 * are set to **Bypass** at the Access layer then verify this cookie instead of
 * relying on Access's broken cookie mirror.
 *
 * Secret: `SESSION_SECRET` (Pages project secret). Without it, minting and
 * verification are no-ops and the code falls back to the Access-header path,
 * so the change is safe to ship before the secret is set.
 */
import { getCallerEmail } from "./_lib";

export const SESSION_COOKIE = "nl_session";
export const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12h sliding window

export interface SessionEnv {
  SESSION_SECRET?: string;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64urlFromBytes(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlFromString(str: string): string {
  return b64urlFromBytes(enc.encode(str));
}
function stringFromB64url(s: string): string {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  b64 += "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return dec.decode(bytes);
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64urlFromBytes(new Uint8Array(sig));
}

/** Constant-time string compare (both inputs are base64url, same alphabet). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Mint a signed `payload.signature` token for `email`. null if no secret. */
export async function mintSession(env: SessionEnv, email: string): Promise<string | null> {
  if (!env.SESSION_SECRET || !email) return null;
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = b64urlFromString(JSON.stringify({ e: email, x: exp }));
  const sig = await hmac(env.SESSION_SECRET, payload);
  return `${payload}.${sig}`;
}

/** Set-Cookie value for a freshly minted token (first-party, Lax). */
export function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

export interface SessionData {
  email: string;
  /** Expiry, unix seconds. */
  exp: number;
}

/** Verify + decode a token. null if invalid / expired / no secret. */
export async function readSession(env: SessionEnv, token: string): Promise<SessionData | null> {
  if (!env.SESSION_SECRET || !token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmac(env.SESSION_SECRET, payload);
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    const { e, x } = JSON.parse(stringFromB64url(payload)) as { e?: string; x?: number };
    if (!e || typeof x !== "number" || x < Math.floor(Date.now() / 1000)) return null;
    return { email: e.toLowerCase(), exp: x };
  } catch {
    return null;
  }
}

/** Verify a token; returns the email, or "" if invalid / expired / no secret. */
export async function verifySession(env: SessionEnv, token: string): Promise<string> {
  return (await readSession(env, token))?.email ?? "";
}

export function readCookie(request: Request, name: string): string {
  const raw = request.headers.get("cookie");
  if (!raw) return "";
  for (const part of raw.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === name) return part.slice(eq + 1).trim();
  }
  return "";
}

/**
 * Verified caller email for API routes. Prefers the first-party signed
 * session cookie (works on Access-Bypassed paths, where no Access headers are
 * forwarded); falls back to the Access-header identity so routes still gated
 * by Access — and local dev — keep working unchanged.
 */
export async function getVerifiedEmail(request: Request, env: SessionEnv): Promise<string> {
  const fromSession = await verifySession(env, readCookie(request, SESSION_COOKIE));
  if (fromSession) return fromSession;
  return getCallerEmail(request);
}
