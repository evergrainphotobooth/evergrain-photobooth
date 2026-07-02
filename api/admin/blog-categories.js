/* =========================================================
   Blog categories API (admin)
   GET    /api/admin/blog-categories        → list (with post counts)
   POST   /api/admin/blog-categories        → { name, blurb? }        create
   PATCH  /api/admin/blog-categories        → { id, name?, blurb?, slug? } update
   DELETE /api/admin/blog-categories?id=UUID                          delete
   Categories map to /a-thousand-words/[slug].

   Also hosts the targeted-keywords resource at ?resource=keywords, which
   delegates to _lib/blog-keywords.js — kept here (rather than its own
   route file) to stay under Vercel Hobby's 12-function limit.
   ========================================================= */

import { requireAuth } from "../_lib/auth.js";
import { handleKeywords } from "../_lib/blog-keywords.js";
import { syncIndexOnly } from "../_lib/blog-render.js";

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function handler(req, res) {
  // Sub-resource: targeted keywords (?resource=keywords) — auth already done.
  const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
  if (searchParams.get("resource") === "keywords") {
    return handleKeywords(req, res);
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Server misconfigured" });
  }
  const H = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };
  const SB = `${SUPABASE_URL}/rest/v1/blog_categories`;
  const env = { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY };

  // Refresh the public blog index (tabs + category names/blurbs). Best-effort.
  const refreshIndex = async () => {
    if (!process.env.GITHUB_TOKEN) return { ok: false, skipped: "GITHUB_TOKEN not set" };
    try { return await syncIndexOnly(env, "Blog: category change"); }
    catch (e) { console.error("category index sync:", e); return { ok: false, error: String(e.message || e) }; }
  };

  const readBody = () => {
    let p = req.body || {};
    if (typeof p === "string") { try { p = JSON.parse(p); } catch { p = {}; } }
    return p;
  };

  // ---------- GET: list categories + post counts ----------
  if (req.method === "GET") {
    const resp = await fetch(`${SB}?select=*&order=name.asc`, { headers: H });
    if (!resp.ok) return res.status(500).json({ error: "Failed to load categories" });
    const categories = await resp.json();

    // Post counts per category (one lightweight query).
    const countsResp = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=category_id`,
      { headers: H }
    );
    const rows = countsResp.ok ? await countsResp.json() : [];
    const counts = {};
    for (const r of rows) counts[r.category_id] = (counts[r.category_id] || 0) + 1;
    for (const c of categories) c.post_count = counts[c.id] || 0;

    return res.status(200).json({ ok: true, categories });
  }

  // ---------- POST: create ----------
  if (req.method === "POST") {
    const { name, blurb } = readBody();
    if (!name || !name.trim()) return res.status(400).json({ error: "name required" });
    const slug = slugify(name);
    if (!slug) return res.status(400).json({ error: "Could not derive a slug from that name" });

    const resp = await fetch(SB, {
      method: "POST",
      headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ name: name.trim(), slug, blurb: blurb || null }),
    });
    if (resp.status === 409) return res.status(409).json({ error: "A category with that name/slug already exists" });
    if (!resp.ok) { console.error("cat create:", await resp.text()); return res.status(500).json({ error: "Create failed" }); }
    const rows = await resp.json();
    const siteSync = await refreshIndex();
    return res.status(200).json({ ok: true, category: rows[0], siteSync });
  }

  // ---------- PATCH: update ----------
  if (req.method === "PATCH") {
    const { id, name, blurb, slug } = readBody();
    if (!id) return res.status(400).json({ error: "id required" });
    const patch = { updated_at: new Date().toISOString() };
    if (name !== undefined)  { patch.name = String(name).trim(); if (slug === undefined) patch.slug = slugify(name); }
    if (blurb !== undefined) patch.blurb = blurb || null;
    if (slug !== undefined)  patch.slug = slugify(slug);

    const resp = await fetch(`${SB}?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(patch),
    });
    if (resp.status === 409) return res.status(409).json({ error: "That slug is already in use" });
    if (!resp.ok) { console.error("cat update:", await resp.text()); return res.status(500).json({ error: "Update failed" }); }
    const rows = await resp.json();
    const siteSync = await refreshIndex();
    return res.status(200).json({ ok: true, category: Array.isArray(rows) ? rows[0] : rows, siteSync });
  }

  // ---------- DELETE ----------
  if (req.method === "DELETE") {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const id = url.searchParams.get("id");
    if (!id) return res.status(400).json({ error: "id required" });
    // Posts referencing this category have category_id set NULL via FK (on delete set null).
    const resp = await fetch(`${SB}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: H });
    if (!resp.ok) { console.error("cat delete:", await resp.text()); return res.status(500).json({ error: "Delete failed" }); }
    const siteSync = await refreshIndex();
    return res.status(200).json({ ok: true, siteSync });
  }

  res.setHeader("Allow", "GET, POST, PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

export default requireAuth(handler);
