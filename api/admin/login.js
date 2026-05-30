/* =========================================================
   POST /api/admin/login
   Body: { username, password }
   Sets HttpOnly session cookie on success.
   ========================================================= */

import { verifyPassword, createSessionToken, sessionCookie } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let payload = req.body || {};
  if (typeof payload === "string") {
    try { payload = JSON.parse(payload); } catch { return res.status(400).json({ error: "Invalid JSON" }); }
  }

  const { username, password } = payload;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const { ADMIN_USERNAME, ADMIN_PASSWORD_HASH, SESSION_SECRET } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH || !SESSION_SECRET) {
    console.error("Missing admin env vars");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  // Constant-time-ish username check + scrypt password check
  const usernameMatch = username === ADMIN_USERNAME;
  const passwordMatch = verifyPassword(password, ADMIN_PASSWORD_HASH);

  if (!usernameMatch || !passwordMatch) {
    // Same response either way — no username enumeration
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = createSessionToken(username, SESSION_SECRET);
  res.setHeader("Set-Cookie", sessionCookie(token));
  return res.status(200).json({ ok: true, user: username });
}
