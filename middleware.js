/* =========================================================
   Vercel Edge Middleware — gates /admin/* pages.
   Login page (/admin or /admin/index) stays public. Everything
   deeper requires a valid signed session cookie.
   Uses Web Crypto API (Edge-compatible).
   ========================================================= */

export const config = {
  matcher: ["/admin/:path+"],
};

const COOKIE_NAME = "evergrain_admin";

function parseCookies(header = "") {
  const out = {};
  header.split(";").forEach(p => {
    const i = p.indexOf("=");
    if (i === -1) return;
    out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

function base64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function verifyToken(token, secret) {
  if (!token || typeof token !== "string" || !secret) return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const encoder = new TextEncoder();
  let key;
  try {
    key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
  } catch {
    return null;
  }

  let isValid = false;
  try {
    const sigBytes = base64urlToBytes(signature);
    isValid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(payloadB64));
  } catch {
    return null;
  }
  if (!isValid) return null;

  let payload;
  try {
    const json = new TextDecoder().decode(base64urlToBytes(payloadB64));
    payload = JSON.parse(json);
  } catch {
    return null;
  }
  if (!payload?.u || !payload?.e) return null;
  if (Date.now() > payload.e) return null;
  return payload.u;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Login page is public
  if (path === "/admin" || path === "/admin/" || path === "/admin/index" || path === "/admin/index.html") {
    return;
  }

  const cookies = parseCookies(request.headers.get("cookie") || "");
  const token = cookies[COOKIE_NAME];
  const user = await verifyToken(token, process.env.SESSION_SECRET || "");

  if (!user) {
    const loginUrl = new URL("/admin", request.url);
    loginUrl.searchParams.set("next", path);
    return Response.redirect(loginUrl.toString(), 307);
  }
  // Authenticated — let through.
}
