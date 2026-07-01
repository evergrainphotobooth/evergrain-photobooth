/* =========================================================
   Blog posts API (admin)
   GET    /api/admin/blog-posts             → list (summary + category name)
   GET    /api/admin/blog-posts?id=UUID     → single (full row)
   POST   /api/admin/blog-posts             → { title, category_id? } create draft
   PATCH  /api/admin/blog-posts             → { id, ...fields } update
   DELETE /api/admin/blog-posts?id=UUID     → delete
   ========================================================= */

import { requireAuth } from "../_lib/auth.js";

function slugify(s) {
  return String(s || "")
    .toLowerCase().trim()
    .replace(/&/g, " and ")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Word count from an HTML body (strip tags + scripts/styles).
function wordCountFromHtml(html) {
  if (!html) return 0;
  const text = String(html)
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(" ").length : 0;
}

// Columns the CMS is allowed to write, mapped from incoming payload keys.
const FIELD_MAP = {
  title: "title",
  slug: "slug",
  category_id: "category_id",
  primaryKeyword: "primary_keyword",
  metaTitle: "meta_title",
  metaDescription: "meta_description",
  imageUrl: "image_url",
  imageAlt: "image_alt",
  imageTitle: "image_title",
  contentHtml: "content_html",
  checklist: "checklist",
  status: "status",
};

async function handler(req, res) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Server misconfigured" });
  }
  const H = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };
  const SB = `${SUPABASE_URL}/rest/v1/blog_posts`;

  const readBody = () => {
    let p = req.body || {};
    if (typeof p === "string") { try { p = JSON.parse(p); } catch { p = {}; } }
    return p;
  };

  // ---------- GET ----------
  if (req.method === "GET") {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const id = url.searchParams.get("id");

    if (id) {
      // Full single row + its category name/slug (PostgREST embed).
      const resp = await fetch(
        `${SB}?id=eq.${encodeURIComponent(id)}&select=*,blog_categories(name,slug)`,
        { headers: H }
      );
      const rows = await resp.json();
      if (!Array.isArray(rows) || rows.length === 0) return res.status(404).json({ error: "Not found" });
      return res.status(200).json({ ok: true, post: rows[0] });
    }

    // Summary list for the table view.
    const resp = await fetch(
      `${SB}?select=id,title,slug,word_count,status,created_at,published_at,category_id,blog_categories(name,slug)&order=created_at.desc`,
      { headers: H }
    );
    if (!resp.ok) { console.error("posts list:", await resp.text()); return res.status(500).json({ error: "Failed to load posts" }); }
    const posts = await resp.json();
    return res.status(200).json({ ok: true, posts });
  }

  // ---------- POST: create a draft from a title ----------
  if (req.method === "POST") {
    const b = readBody();
    if (!b.title || !b.title.trim()) return res.status(400).json({ error: "title required" });
    const row = {
      title: b.title.trim(),
      slug: b.slug ? slugify(b.slug) : slugify(b.title),
      category_id: b.category_id || null,
      status: "draft",
    };
    const resp = await fetch(SB, {
      method: "POST",
      headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(row),
    });
    if (resp.status === 409) return res.status(409).json({ error: "A post with that slug already exists" });
    if (!resp.ok) { console.error("post create:", await resp.text()); return res.status(500).json({ error: "Create failed" }); }
    const rows = await resp.json();
    return res.status(200).json({ ok: true, post: rows[0] });
  }

  // ---------- PATCH: update ----------
  if (req.method === "PATCH") {
    const b = readBody();
    if (!b.id) return res.status(400).json({ error: "id required" });

    const patch = { updated_at: new Date().toISOString() };
    for (const [inKey, col] of Object.entries(FIELD_MAP)) {
      if (b[inKey] !== undefined) patch[col] = b[inKey];
    }
    if (patch.slug !== undefined) patch.slug = slugify(patch.slug);
    if (patch.content_html !== undefined) patch.word_count = wordCountFromHtml(patch.content_html);
    if (b.status === "published" && !patch.published_at) patch.published_at = new Date().toISOString();

    const resp = await fetch(`${SB}?id=eq.${encodeURIComponent(b.id)}`, {
      method: "PATCH",
      headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(patch),
    });
    if (resp.status === 409) return res.status(409).json({ error: "That slug is already in use" });
    if (!resp.ok) { console.error("post update:", await resp.text()); return res.status(500).json({ error: "Update failed" }); }
    const rows = await resp.json();
    return res.status(200).json({ ok: true, post: Array.isArray(rows) ? rows[0] : rows });
  }

  // ---------- DELETE ----------
  if (req.method === "DELETE") {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const id = url.searchParams.get("id");
    if (!id) return res.status(400).json({ error: "id required" });
    const resp = await fetch(`${SB}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: H });
    if (!resp.ok) { console.error("post delete:", await resp.text()); return res.status(500).json({ error: "Delete failed" }); }
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST, PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

export default requireAuth(handler);
