/* =========================================================
   /api/admin/settings — General Information CMS endpoint.

   GET  → returns current data/settings.json from GitHub (canonical / latest)
   PUT  → validates, then commits updated data/settings.json to GitHub
          → Vercel detects the commit and rebuilds (~30 s)
          → static site, /data/settings.json, and runtime patcher all update
   ========================================================= */

import { verifySession } from "../_lib/auth.js";
import { getJson, putJson } from "../_lib/github.js";

const DATA_PATH = "data/settings.json";

export default async function handler(req, res) {
  // Require admin session
  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  try {
    if (req.method === "GET") {
      const file = await getJson(DATA_PATH);
      if (!file) return res.status(404).json({ error: "Settings file not found in repo" });
      return res.status(200).json({ settings: file.data, sha: file.sha });
    }

    if (req.method === "PUT") {
      let body = req.body;
      if (typeof body === "string") body = JSON.parse(body);
      const incoming = body?.settings;
      if (!incoming || typeof incoming !== "object") {
        return res.status(400).json({ error: "Missing settings object in body" });
      }
      const validated = validateSettings(incoming);
      if (validated.error) return res.status(400).json({ error: validated.error });

      // Read current to get SHA
      const file = await getJson(DATA_PATH);
      if (!file) return res.status(500).json({ error: "Could not read current settings from repo" });

      // Merge: incoming overrides existing
      const merged = { ...file.data, ...validated.data };

      const result = await putJson(
        DATA_PATH,
        merged,
        file.sha,
        `CMS: update general information\n\nBy admin: ${session.user || "admin"}`
      );

      return res.status(200).json({
        ok: true,
        commitSha: result.commitSha,
        settings: merged,
        message: "Saved. Republishing — live in ~30 seconds.",
      });
    }

    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("/api/admin/settings error:", err);
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}

/* ---------- Validation ---------- */
function validateSettings(s) {
  const errors = [];
  const data = { ...s };

  // contact
  if (data.contact) {
    if (data.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact.email)) {
      errors.push("Invalid email format");
    }
    if (data.contact.phone && typeof data.contact.phone !== "string") {
      errors.push("Phone must be a string");
    }
    if (data.contact.phoneE164 && !/^\+\d{7,15}$/.test(data.contact.phoneE164)) {
      errors.push("phoneE164 must be E.164 format (e.g. +16265608330)");
    }
  }

  // social — all URLs
  if (data.social) {
    for (const [k, v] of Object.entries(data.social)) {
      if (v && !/^https?:\/\//.test(v)) errors.push(`${k} URL must start with http:// or https://`);
    }
  }

  if (errors.length) return { error: errors.join("; ") };
  return { data };
}
