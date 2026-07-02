/* =========================================================
   Blog keywords API (admin)
   GET    /api/admin/blog-keywords        → list (keyword asc)
   POST   /api/admin/blog-keywords        → { keyword } or { keywords:[...] }
                                            (also accepts comma/newline-separated
                                             text in `keyword`); dedupes case-insensitively
   DELETE /api/admin/blog-keywords?id=UUID
   A global list of SEO keywords the blog generator weaves in naturally.
   ========================================================= */

import { requireAuth } from "../_lib/auth.js";

// Split a raw string on commas / newlines, trim, drop empties.
function splitKeywords(raw) {
  return String(raw || "")
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

async function handler(req, res) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Server misconfigured" });
  }
  const H = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };
  const SB = `${SUPABASE_URL}/rest/v1/blog_keywords`;

  const readBody = () => {
    let p = req.body || {};
    if (typeof p === "string") { try { p = JSON.parse(p); } catch { p = {}; } }
    return p;
  };

  const listAll = async () => {
    const r = await fetch(`${SB}?select=id,keyword&order=keyword.asc`, { headers: H });
    return r.ok ? await r.json() : [];
  };

  // ---------- GET ----------
  if (req.method === "GET") {
    const r = await fetch(`${SB}?select=id,keyword&order=keyword.asc`, { headers: H });
    if (!r.ok) return res.status(500).json({ error: "Failed to load keywords" });
    return res.status(200).json({ ok: true, keywords: await r.json() });
  }

  // ---------- POST: add one or many (dedupe case-insensitively) ----------
  if (req.method === "POST") {
    const b = readBody();
    let candidates = [];
    if (Array.isArray(b.keywords)) candidates = b.keywords.flatMap(splitKeywords);
    else candidates = splitKeywords(b.keyword);
    // De-dupe within the incoming batch (case-insensitive, keep first spelling).
    const seen = new Set();
    candidates = candidates.filter(k => {
      const lc = k.toLowerCase();
      if (seen.has(lc)) return false;
      seen.add(lc); return true;
    });
    if (candidates.length === 0) return res.status(400).json({ error: "No keyword provided" });

    // Drop any that already exist (case-insensitive).
    const existing = await listAll();
    const have = new Set(existing.map(r => r.keyword.toLowerCase()));
    const toInsert = candidates.filter(k => !have.has(k.toLowerCase()));

    if (toInsert.length > 0) {
      const r = await fetch(SB, {
        method: "POST",
        headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(toInsert.map(keyword => ({ keyword }))),
      });
      if (!r.ok && r.status !== 409) {
        console.error("keyword insert:", await r.text());
        return res.status(500).json({ error: "Add failed" });
      }
    }
    return res.status(200).json({ ok: true, keywords: await listAll(), added: toInsert.length });
  }

  // ---------- DELETE ----------
  if (req.method === "DELETE") {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const id = url.searchParams.get("id");
    if (!id) return res.status(400).json({ error: "id required" });
    const r = await fetch(`${SB}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: H });
    if (!r.ok) { console.error("keyword delete:", await r.text()); return res.status(500).json({ error: "Delete failed" }); }
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

export default requireAuth(handler);
