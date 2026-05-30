/* =========================================================
   Evergrain CMS — shared auth helpers
   Uses Node's built-in crypto. No external deps.
   ========================================================= */

import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "evergrain_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

/* ---------- Password ---------- */

// Verify a plaintext password against a stored "salt:hash" string.
export function verifyPassword(plaintext, storedHash) {
  if (!storedHash || !plaintext) return false;
  const [salt, hashHex] = storedHash.split(":");
  if (!salt || !hashHex) return false;
  try {
    const calc = scryptSync(plaintext, salt, 64);
    const stored = Buffer.from(hashHex, "hex");
    if (calc.length !== stored.length) return false;
    return timingSafeEqual(calc, stored);
  } catch {
    return false;
  }
}

/* ---------- Sessions (HMAC-signed cookie) ---------- */

function sign(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

// Build a session token: base64url(payload).signature
export function createSessionToken(username, secret) {
  const payload = {
    u: username,
    e: Date.now() + SESSION_TTL_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

// Verify + decode a session token. Returns the username or null.
export function verifySessionToken(token, secret) {
  if (!token || typeof token !== "string") return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64, secret);
  // Constant-time compare
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!payload?.u || !payload?.e) return null;
  if (Date.now() > payload.e) return null;
  return payload.u;
}

/* ---------- Cookie helpers ---------- */

export function sessionCookie(token, opts = {}) {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "SameSite=Strict",
    opts.secure !== false ? "Secure" : "",
  ].filter(Boolean);
  return parts.join("; ");
}

export function clearCookie() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict; Secure`;
}

export function parseCookies(cookieHeader = "") {
  const out = {};
  cookieHeader.split(";").forEach(p => {
    const i = p.indexOf("=");
    if (i === -1) return;
    out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

export function readSession(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifySessionToken(token, process.env.SESSION_SECRET || "");
}

// Wrap a Vercel function handler to require a valid session.
export function requireAuth(handler) {
  return async (req, res) => {
    const user = readSession(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = user;
    return handler(req, res);
  };
}

export { COOKIE_NAME };
