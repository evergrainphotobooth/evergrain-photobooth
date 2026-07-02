/* =========================================================
   Blog keywords handler (module — NOT a route)
   Reached via /api/admin/blog-categories?resource=keywords so it doesn't
   consume a separate Vercel Serverless Function slot (Hobby caps at 12).
   Auth is already enforced by the calling route (blog-categories.js).

     GET    ?resource=keywords              → list (keyword asc)
     POST   ?resource=keywords              → { keyword } or { keywords:[...] }
                                              (also accepts comma/newline text)
     DELETE ?resource=keywords&id=UUID
   A global list of SEO keywords the blog generator weaves in naturally.
   ========================================================= */

// Split a raw string on commas / newlines, trim, drop empties.
function splitKeywords(raw) {
  return String(raw || "")
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

// Detect PostgREST's "table not created yet" response so we can guide setup.
const NEED_SQL = "The keywords table isn't set up yet. Run scripts/sql/blog-keywords.sql in your Supabase SQL Editor, then reload this page.";
function missingTable(status, text) {
  return status === 404 || /PGRST205|schema cache|does not exist/i.test(String(text || ""));
}

export async function handleKeywords(req, res) {
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
    if (!r.ok) {
      const t = await r.text();
      if (missingTable(r.status, t)) return res.status(200).json({ ok: true, keywords: [], setup_needed: true, message: NEED_SQL });
      console.error("keyword list:", r.status, t);
      return res.status(500).json({ error: "Failed to load keywords" });
    }
    return res.status(200).json({ ok: true, keywords: await r.json() });
  }

  // ---------- POST: add one or many (dedupe case-insensitively) ----------
  if (req.method === "POST") {
    const b = readBody();
    let candidates = Array.isArray(b.keywords) ? b.keywords.flatMap(splitKeywords) : splitKeywords(b.keyword);
    const seen = new Set();
    candidates = candidates.filter(k => {
      const lc = k.toLowerCase();
      if (seen.has(lc)) return false;
      seen.add(lc); return true;
    });
    if (candidates.length === 0) return res.status(400).json({ error: "No keyword provided" });

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
        const t = await r.text();
        if (missingTable(r.status, t)) return res.status(400).json({ error: NEED_SQL });
        console.error("keyword insert:", r.status, t);
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
