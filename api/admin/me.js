/* =========================================================
   GET /api/admin/me — returns the logged-in username or 401.
   Used by client pages to check session before rendering UI.
   ========================================================= */

import { readSession } from "../_lib/auth.js";

export default async function handler(req, res) {
  const user = readSession(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  return res.status(200).json({ ok: true, user });
}
