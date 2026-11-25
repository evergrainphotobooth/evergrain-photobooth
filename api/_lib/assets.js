/* =========================================================
   CMS Assets dispatcher (module, not a route)

   Handles the R2-backed Assets manager actions, delegated from
   upload-image.js (action starts with "assets-") so we stay under Vercel
   Hobby's 12-function cap. Auth is enforced by the calling route.
   ========================================================= */

import { list, head, del, copy, presignPut, publicUrl, r2cfg, r2Configured } from "./r2.js";

const TYPE_BY_EXT = {
  jpg: "image", jpeg: "image", png: "image", webp: "image", gif: "image", avif: "image", svg: "image",
  mp4: "video", webm: "video", mov: "video", ogg: "video", ogv: "video", m4v: "video",
};
const extOf = (k) => (k.split(".").pop() || "").toLowerCase();

export async function handleAssets(req, res, b) {
  if (!r2Configured()) {
    return res.status(500).json({ error: "R2 not configured — add the R2_* env vars in Vercel, then redeploy." });
  }
  const cfg = r2cfg();
  try {
    switch (b.action) {
      case "assets-list": {
        const items = (await list(b.prefix || "", cfg)).map((o) => ({
          key: o.key,
          name: o.key.split("/").pop(),
          folder: o.key.includes("/") ? o.key.slice(0, o.key.lastIndexOf("/")) : "",
          size: o.size,
          lastModified: o.lastModified,
          type: TYPE_BY_EXT[extOf(o.key)] || "file",
          url: publicUrl(o.key, cfg),
        }));
        return res.status(200).json({ ok: true, items, publicBase: cfg.publicBase });
      }
      case "assets-head": {
        if (!b.key) return res.status(400).json({ error: "key required" });
        const h = await head(b.key, cfg);
        return res.status(200).json({ ok: true, key: b.key, url: publicUrl(b.key, cfg), ...h });
      }
      case "assets-presign": {
        if (!b.key) return res.status(400).json({ error: "key required" });
        const uploadUrl = presignPut(b.key, b.contentType || "application/octet-stream", 900, cfg);
        return res.status(200).json({ ok: true, uploadUrl, url: publicUrl(b.key, cfg), key: b.key });
      }
      case "assets-meta": {
        if (!b.key) return res.status(400).json({ error: "key required" });
        const cur = await head(b.key, cfg).catch(() => ({ contentType: "application/octet-stream" }));
        await copy(b.key, b.key, { replace: true, contentType: b.contentType || cur.contentType, metadata: b.metadata || {} }, cfg);
        return res.status(200).json({ ok: true });
      }
      case "assets-rename": {
        if (!b.key || !b.newKey) return res.status(400).json({ error: "key and newKey required" });
        if (b.key === b.newKey) return res.status(200).json({ ok: true, key: b.key, url: publicUrl(b.key, cfg) });
        await copy(b.key, b.newKey, {}, cfg);
        await del(b.key, cfg);
        return res.status(200).json({ ok: true, key: b.newKey, url: publicUrl(b.newKey, cfg) });
      }
      case "assets-delete": {
        if (!b.key) return res.status(400).json({ error: "key required" });
        await del(b.key, cfg);
        return res.status(200).json({ ok: true });
      }
      default:
        return res.status(400).json({ error: `Unknown assets action: ${b.action}` });
    }
  } catch (e) {
    console.error("assets action:", b.action, e);
    return res.status(502).json({ error: String(e.message || e) });
  }
}
