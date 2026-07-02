/* =========================================================
   Upload image API (admin)
   POST /api/admin/upload-image
     body: { url, filename? }                 → upload from a URL
     body: { action: "stock", title, ... }    → recommend royalty-free stock
   Fetches an image from a URL server-side and stores it in the Supabase
   Storage "media" bucket under images/blogs/, returning the public URL.
   The "stock" action delegates to _lib/stock-image.js (kept off a separate
   route to stay under Vercel Hobby's 12-function limit).  requireAuth-gated.
   ========================================================= */

import { requireAuth } from "../_lib/auth.js";
import { recommendStock } from "../_lib/stock-image.js";

const BUCKET = "media";
const PREFIX = "images/blogs";
const MAX_BYTES = 12 * 1024 * 1024; // 12 MB safety cap

const EXT_BY_MIME = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

function slugify(s) {
  return String(s || "")
    .toLowerCase().trim()
    .replace(/&/g, " and ")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }

  let b = req.body || {};
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { return res.status(400).json({ error: "Invalid JSON" }); } }

  // Stock-image recommendation (no Supabase needed) — AI-assisted search of a
  // royalty-free library. The chosen result is then uploaded via the URL path.
  if (b.action === "stock") return recommendStock(req, res, b);

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: "Server misconfigured" });

  const src = (b.url || "").trim();
  if (!src) return res.status(400).json({ error: "url required" });
  let parsed;
  try { parsed = new URL(src); } catch { return res.status(400).json({ error: "That doesn't look like a valid URL" }); }
  if (!/^https?:$/.test(parsed.protocol)) return res.status(400).json({ error: "Only http(s) image URLs are supported" });

  // Fetch the source image server-side.
  let bytes, mime;
  try {
    const r = await fetch(src, { redirect: "follow" });
    if (!r.ok) return res.status(400).json({ error: `Couldn't fetch that image (HTTP ${r.status})` });
    mime = (r.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!mime.startsWith("image/")) return res.status(400).json({ error: "That URL isn't an image" });
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length === 0) return res.status(400).json({ error: "The image was empty" });
    if (buf.length > MAX_BYTES) return res.status(413).json({ error: "Image is larger than 12 MB" });
    bytes = buf;
  } catch (err) {
    console.error("upload-image fetch:", err);
    return res.status(502).json({ error: "Could not download that image URL" });
  }

  // Descriptive, unique object path.
  const ext = EXT_BY_MIME[mime] || (parsed.pathname.match(/\.([a-z0-9]{2,5})$/i)?.[1] || "jpg").toLowerCase();
  const base = slugify(b.filename) || "blog-image";
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  const objectPath = `${PREFIX}/${base}-${stamp}${rand}.${ext}`;

  // Upload to Supabase Storage.
  const upResp = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectPath}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
        "x-upsert": "true",
      },
      body: bytes,
    }
  );
  if (!upResp.ok) {
    console.error("upload-image storage:", upResp.status, await upResp.text());
    return res.status(502).json({ error: "Upload to storage failed" });
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}`;
  return res.status(200).json({ ok: true, url: publicUrl, path: objectPath, mime, bytes: bytes.length });
}

export default requireAuth(handler);
