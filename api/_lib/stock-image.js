/* =========================================================
   Stock image recommender (module — NOT a route)
   Reached via POST /api/admin/upload-image { action:"stock", ... } so it
   doesn't consume a Vercel Serverless Function slot. Auth is enforced by the
   calling route.

   Searches Openverse (https://openverse.org) — an aggregator of royalty-free /
   openly-licensed images across many libraries — filtered to commercially
   usable licenses. When GEMINI_API_KEY is set, the AI distills the blog title
   + keywords into a strong visual search query first; otherwise it falls back
   to the title/keywords directly. Returns candidates; the one the user picks
   is uploaded to Supabase via the normal URL path.
   ========================================================= */

const OPENVERSE = "https://api.openverse.org/v1/images/";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Ask Gemini for a concise stock-photo search query (best effort).
async function aiQuery({ title, primaryKeyword, keywords }) {
  const key = process.env.GEMINI_API_KEY;
  const fallback = [title, primaryKeyword].filter(Boolean).join(" ").trim()
    || (keywords && keywords[0]) || "photo booth event party";
  if (!key) return fallback;
  try {
    const prompt =
      `Give a short (3–6 word) stock-photo search query to find a great, relevant royalty-free photo for a blog.\n` +
      `Blog title: "${title || ""}".\n` +
      (primaryKeyword ? `Primary keyword: ${primaryKeyword}.\n` : "") +
      (keywords && keywords.length ? `Related keywords: ${keywords.slice(0, 8).join(", ")}.\n` : "") +
      `Favor concrete, photographable subjects (people, events, the product in use). Return ONLY the query text, no quotes.`;
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "x-goog-api-key": key, "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 300 },
        }),
      }
    );
    if (!r.ok) return fallback;
    const data = await r.json();
    const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
    const q = text.replace(/^["'`]+|["'`]+$/g, "").split("\n")[0].trim();
    return q || fallback;
  } catch {
    return fallback;
  }
}

export async function recommendStock(req, res, body) {
  const title = (body.title || "").trim();
  const primaryKeyword = (body.primaryKeyword || "").trim();
  const keywords = Array.isArray(body.keywords) ? body.keywords.filter(Boolean) : [];
  if (!title && !primaryKeyword && keywords.length === 0) {
    return res.status(400).json({ error: "Set a blog title first so we can find a relevant image." });
  }

  const query = await aiQuery({ title, primaryKeyword, keywords });

  let data;
  try {
    const url = `${OPENVERSE}?q=${encodeURIComponent(query)}&license_type=commercial&page_size=20&mature=false`;
    const r = await fetch(url, { headers: { "User-Agent": "EvergrainPhotobooth/1.0 (blog CMS)", Accept: "application/json" } });
    if (!r.ok) {
      console.error("openverse error:", r.status, (await r.text()).slice(0, 300));
      return res.status(502).json({ error: "Stock image search is unavailable right now. Please try again, or upload your own image." });
    }
    data = await r.json();
  } catch (err) {
    console.error("openverse fetch failed:", err);
    return res.status(502).json({ error: "Couldn't reach the stock image library." });
  }

  const results = Array.isArray(data.results) ? data.results : [];
  const images = results
    .filter(x => x && x.url)
    .map(x => ({
      url: x.url,
      thumbnail: x.thumbnail || x.url,
      title: x.title || "",
      creator: x.creator || "",
      license: [x.license, x.license_version].filter(Boolean).join(" ").toUpperCase(),
      source: x.source || x.provider || "openverse",
      attribution: x.attribution || "",
      landing: x.foreign_landing_url || "",
      width: x.width || null,
      height: x.height || null,
    }))
    // Prefer reasonably large, landscape-ish images for a header.
    .sort((a, b) => {
      const la = a.width && a.height ? (a.width >= a.height ? 1 : 0) : 0;
      const lb = b.width && b.height ? (b.width >= b.height ? 1 : 0) : 0;
      if (lb !== la) return lb - la;
      return (b.width || 0) - (a.width || 0);
    })
    .slice(0, 9);

  if (images.length === 0) {
    return res.status(200).json({ ok: true, query, images: [], message: `No royalty-free images found for “${query}”. Try a different title, or upload your own image.` });
  }
  return res.status(200).json({ ok: true, query, images });
}
