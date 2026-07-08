/* =========================================================
   Generate Blog API (admin)
   POST /api/admin/generate-blog
     body: { title, categoryName?, imageUrl?, imageAlt?, imageTitle? }
   Calls the Google Gemini API (free tier) with the Evergrain blog spec
   baked into the system prompt and returns a structured, SEO-optimized draft:
     { metaTitle, metaDescription, slug, primaryKeyword,
       contentHtml, wordCount, checklist:[{item,pass,note}] }
   Requires GEMINI_API_KEY (free from https://aistudio.google.com/apikey).
   Override the model with GEMINI_MODEL if desired.  requireAuth-gated.
   ========================================================= */

import { requireAuth } from "../_lib/auth.js";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function slugify(s) {
  return String(s || "").toLowerCase().trim()
    .replace(/&/g, " and ").replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function wordCountFromHtml(html) {
  if (!html) return 0;
  const t = String(html)
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ").trim();
  return t ? t.split(" ").length : 0;
}

// The 12-point final checklist the model must self-evaluate.
const CHECKLIST = [
  "Does the title include the main keyword?",
  "Is the article easy to skim?",
  "Does the introduction hook the reader?",
  "Are headings clear and useful?",
  "Is the keyword used naturally?",
  "Are there internal and external links?",
  "Is the blog close to 1,000 words without feeling padded?",
  "Does the article solve the reader's problem?",
  "Is every provided image/video included in the blog?",
  "Does each image/video have descriptive alt text?",
  "Does each image/video have a clear title?",
  "Is there a clear next step for the reader?",
];

// Blog-format directives — chosen by the user in the editor to steer generation.
const FORMATS = {
  standard: "STANDARD / INFORMATIONAL post — a deep, authoritative dive into ONE topic. Thoroughly answer the core \"what is…\" / \"why…\" questions with expert insight and useful detail; build foundational knowledge.",
  listicle: "LISTICLE — structure the body as a clear numbered/ordered list (e.g. \"Top N…\"). Give each list item its own numbered <h2> or <h3>, keep items scannable and roughly parallel in length, and add a short intro + conclusion around the list.",
  "how-to": "HOW-TO GUIDE — a step-by-step tutorial that solves ONE specific problem. Use sequential, numbered steps (<h2> per step and/or an <ol>), each step concrete and actionable; include what's needed up front and a clear finished outcome at the end.",
  "review-roundup": "PRODUCT REVIEW & ROUNDUP — a comparison / \"best of\" / gift-guide. Present several options with who each is best for, pros and cons, and a clear recommendation. Frame it around Evergrain's packages, add-ons, and event-planning choices (link to /packages and /add-ons). Do NOT invent competitor claims.",
  "ultimate-guide": "ULTIMATE / BEGINNER'S GUIDE — a comprehensive pillar post that is the \"final word\" on a broad subject. Cover the topic end-to-end across many well-organized sections; make it a permanent, bookmarkable resource (aim toward the top of the word range).",
  "case-study": "CASE STUDY / DATA STUDY — real-world proof or research framing: a challenge → approach → results arc with concrete, specific details. Do NOT fabricate statistics, client names, or quotes; if real data isn't provided, write it explicitly as an illustrative/representative example.",
  qa: "QUESTIONS & ANSWERS post — directly solve reader problems. Structure the body as common AND niche questions about the topic/our services, each as an <h3> (or <h2>) question with the best, complete answer beneath it; lean into a strong FAQ/Q&A structure throughout.",
};

const SYSTEM_PROMPT = `You are the content writer for Evergrain Photobooth, a luxury open-air DSLR photo booth rental serving Los Angeles and Orange County. You write SEO-optimized blog articles that read like a knowledgeable, warm human wrote them — never robotic, never keyword-stuffed.

Follow this spec exactly.

STRUCTURE
- Start with a clear, keyword-focused topic; one main topic only.
- Compelling introduction that states the problem/question fast (100–150 words).
- Break the post into clear sections with <h2> and <h3> headings.
- Short paragraphs, 2–4 sentences each.
- Use <ul>/<ol> lists to improve readability.
- Strong conclusion summarizing the key takeaway (~100 words).
- End with a clear call to action (e.g. request a quote, read another post, contact us).

SEO
- Choose ONE primary keyword. Include it in the title, the intro, at least one heading, and the conclusion. Use related keywords naturally.
- Meta title 50–60 characters. Meta description 140–160 characters.
- Clean URL slug (kebab-case, no stop-word bloat).
- Write for people first; never keyword-stuff.

TARGETED KEYWORDS
- You may be given a list of targeted keywords. Work in AS MANY of them as you naturally can, and use each AS OFTEN as reads naturally — spread them across the title, headings, intro, body, FAQ, image alt, and conclusion.
- Non-negotiable: the copy must sound like an experienced human wrote it, never like AI-generated or keyword-stuffed text. Organic, natural phrasing ALWAYS wins over keyword count. If a keyword cannot be used without sounding forced, robotic, or repetitive, leave it out.
- Vary phrasing and use natural variations/synonyms of the keywords so density feels effortless. Prefer weaving a keyword into a sentence that carries real meaning over dropping it in mechanically.

CONTENT QUALITY
- Answer the reader's main question clearly with useful examples, tips, or steps.
- Practical, not vague. Include original insight / expert commentary (you're the photo booth expert).
- Cover the topic thoroughly, no filler. Every section must earn its place.

READABILITY
- Simple, direct language. Concise sentences. Active voice. Transition phrases. Easy to skim. Most important info near the top.

~1,000-WORD LAYOUT (aim 950–1,150 words of body copy)
- Intro 100–150 · Background 150–200 · Key tips/steps/sections 500–600 · Common mistakes/extra advice 100–150 · Conclusion + CTA ~100.

MEDIA (images & videos)
- You are given an ordered MEDIA list. Item 1 is the FEATURED item and is ALSO shown as the page's header/hero background, so do NOT open the article with it. Weave in EVERY media item at the point in the body where it best supports the flow — the featured item mid-article, the rest at natural, relevant spots (never bunched together, never as the opening element). Use each item's EXACT provided url/embed.
- Generate SEO/AEO-optimized attributes for every item: descriptive, keyword-aware (never stuffed) alt text, a short human-readable title, and a one-line <figcaption>. Never use generic alt like "image" or "video".
- Embed by type:
  · image → <figure class="blog-media"><img src="URL" alt="..." title="..." loading="lazy" /><figcaption>...</figcaption></figure>
  · direct video (provider "file") → <figure class="blog-media"><video controls preload="metadata" playsinline><source src="URL" /></video><figcaption>...</figcaption></figure>
  · embedded video (provider "youtube"/"vimeo") → <figure class="blog-media blog-media--embed"><iframe src="EMBED" title="..." loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><figcaption>...</figcaption></figure>
- Do not invent media that isn't in the list, and do not omit any that is.

ON-PAGE SEO EXTRAS
- Add a Table of Contents (anchor links to the H2 sections) near the top.
- Add SEVERAL contextual internal links (with descriptive anchor text) to relevant Evergrain pages. Valid internal paths: /packages, /add-ons, /the-booth, /our-story, /faq, /get-started, /areas-we-serve, and category/landing pages under /a-thousand-words. Use root-relative hrefs.
- Add one or two links to genuinely authoritative, relevant external sources (real, well-known domains only) — link-worthy citations that help earn backlinks. Never fabricate URLs.
- Include a short FAQ section (2–4 Q&As) near the end using <h2>Frequently Asked Questions</h2> and <h3> for each question.

HTML RULES
- Output the body as clean semantic HTML: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <a>, <blockquote>, and the media tags <figure>, <figcaption>, <img>, <video>, <source>, <iframe>. Do NOT include <h1> (the title is rendered separately), and do NOT include <html>, <head>, <body>, or inline styles/scripts.
- Give each <h2> section an id (kebab-case) so the Table of Contents can link to it.

OUTPUT FORMAT
Respond with ONLY a single JSON object — no prose, no markdown code fences. Shape:
{
  "primaryKeyword": string,
  "metaTitle": string,        // 50–60 chars
  "metaDescription": string,  // 140–160 chars
  "slug": string,             // kebab-case
  "imageAlt": string,         // descriptive, keyword-aware (featured image)
  "imageTitle": string,       // short descriptive (featured image)
  "contentHtml": string,      // the full body HTML per the rules above
  "chosenFormat": string,     // the format key you wrote in — one of: standard, listicle, how-to, review-roundup, ultimate-guide, case-study, qa
  "media": [ { "url": string, "type": "image"|"video", "alt": string, "title": string } ],  // SAME order as the MEDIA list you were given, with the alt/title you generated for each
  "checklist": [ { "item": string, "pass": boolean, "note": string } ]  // evaluate EACH of the 12 checklist items honestly
}
The 12 checklist items to evaluate, in order:
${CHECKLIST.map((c, i) => `${i + 1}. ${c}`).join("\n")}`;

async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }

  const { GEMINI_API_KEY } = process.env;
  if (!GEMINI_API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

  let b = req.body || {};
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { return res.status(400).json({ error: "Invalid JSON" }); } }
  const title = (b.title || "").trim();
  if (!title) return res.status(400).json({ error: "title required" });

  // Pull the global targeted-keyword list (best effort — generation still works without it).
  let keywords = [];
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const kr = await fetch(`${SUPABASE_URL}/rest/v1/blog_keywords?select=keyword&order=keyword.asc`, {
        headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      });
      if (kr.ok) keywords = (await kr.json()).map(r => r.keyword).filter(Boolean);
    } catch (e) { console.error("keyword fetch failed:", e); }
  }

  const imageUrl = (b.imageUrl || "").trim();
  // Full media manifest — fall back to the single featured image for old callers.
  const media = (Array.isArray(b.media) && b.media.length)
    ? b.media
    : (imageUrl ? [{ type: "image", url: imageUrl, alt: b.imageAlt || "", title: b.imageTitle || "", provider: "file" }] : []);

  const mediaMsg = media.length
    ? "MEDIA to weave in (use EVERY item, in this order; item 1 is featured/header):\n" +
      media.map((m, i) => {
        const kind = m.type === "video"
          ? (m.provider === "file" ? "video (direct file)" : `video (${m.provider || "embed"} embed)`)
          : "image";
        const ref = (m.type === "video" && m.provider !== "file" && m.embed) ? `embed: ${m.embed}` : `url: ${m.url || ""}`;
        const pref = [m.alt ? `preferred alt: "${m.alt}"` : "", m.title ? `preferred title: "${m.title}"` : ""].filter(Boolean).join(", ");
        return `${i + 1}. ${i === 0 ? "FEATURED " : ""}${kind} — ${ref}${pref ? ` (${pref})` : ""}`;
      }).join("\n")
    : `No media was provided — include one <img> with src="" and set the image checklist items to pass:false with a note to add media.`;

  // Blog format — "auto" lets the model pick, balanced by how much each format
  // has been used so far; otherwise use the format the user selected.
  const autoMode = b.format === "auto";
  let formatLine;
  if (autoMode) {
    const counts = {};
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const fr = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?select=blog_format`, {
          headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
        });
        if (fr.ok) for (const row of await fr.json()) { const f = row.blog_format; if (f && FORMATS[f]) counts[f] = (counts[f] || 0) + 1; }
      } catch (e) { console.error("format counts:", e); }
    }
    const menu = Object.entries(FORMATS).map(([k, d]) => `- ${k} (used ${counts[k] || 0}× so far): ${d}`).join("\n");
    formatLine = `BLOG FORMAT — CHOOSE the single best format for this title from the list below and write the whole post in it. Pick the format that genuinely fits the title best; when two fit similarly well, favor the one we've used LESS (lower count) to keep our blog mix balanced. Put the chosen format key in the "chosenFormat" output field.\n${menu}`;
  } else {
    formatLine = `BLOG FORMAT — write it as a ${FORMATS[b.format] || FORMATS.standard}`;
  }

  const userMsg = [
    `Write the blog article. Working title: "${title}".`,
    formatLine,
    b.categoryName ? `Category context: ${b.categoryName}.` : "",
    keywords.length
      ? `Targeted keywords — weave in as many as you naturally can, as often as reads organically (never forced, never keyword-stuffed, always human-sounding): ${keywords.join(", ")}.`
      : "",
    mediaMsg,
    `LINKS & ON-PAGE SEO — regardless of format, maximize on-page SEO: include SEVERAL contextual internal links to relevant Evergrain pages with descriptive anchor text, plus one or two links to genuinely authoritative external sources (link-worthy citations that help earn backlinks). Also apply every other on-page best practice you can: a table of contents, semantic H2/H3 structure, descriptive alt text on all media, a concise meta title/description, an FAQ section, and clear keyword-aware headings.`,
    `Return ONLY the JSON object.`,
  ].filter(Boolean).join("\n");

  const reqBody = JSON.stringify({
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: userMsg }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 16384,
      // Force raw JSON output (no code fences / prose to strip).
      responseMimeType: "application/json",
    },
  });

  // Try the primary model, then a fallback model. Each Gemini model has its OWN
  // free-tier quota, so if the primary is rate-limited/overloaded the fallback
  // usually still works.
  const modelChain = [MODEL];
  for (const fb of ["gemini-2.0-flash", "gemini-flash-latest"]) if (!modelChain.includes(fb)) modelChain.push(fb);

  let aiText = "", lastStatus = 0, lastDetail = "", refused = false;
  for (const model of modelChain) {
    let r;
    try {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "x-goog-api-key": GEMINI_API_KEY, "content-type": "application/json" },
        body: reqBody,
      });
    } catch (err) { console.error(`Gemini fetch failed (${model}):`, err); lastStatus = 0; lastDetail = String(err.message || err); continue; }

    if (!r.ok) {
      lastStatus = r.status; lastDetail = (await r.text()).slice(0, 400);
      console.error(`Gemini error (${model}):`, r.status, lastDetail);
      continue; // try the next model
    }
    const data = await r.json().catch(() => null);
    const cand = data && data.candidates && data.candidates[0];
    if (cand && (cand.finishReason === "SAFETY" || cand.finishReason === "PROHIBITED_CONTENT")) { refused = true; break; }
    const text = ((cand && cand.content && cand.content.parts) || []).map(p => p.text || "").join("");
    if (text) { aiText = text; break; }
    lastStatus = lastStatus || 200; lastDetail = "empty response";
    console.error(`Gemini empty (${model}):`, JSON.stringify(data).slice(0, 300));
  }

  if (refused) return res.status(502).json({ error: "The generator declined this title. Try rephrasing it." });
  if (!aiText) {
    // Surface the real reason so it's actually diagnosable.
    let msg;
    if (lastStatus === 429) msg = "Google Gemini's free-tier limit was hit (too many requests, or the daily cap). Wait a minute and try again — if it keeps failing, the daily quota resets at midnight Pacific.";
    else if (lastStatus === 503 || lastStatus === 500) msg = "Google Gemini is overloaded right now. Please try again in a moment.";
    else if (lastStatus === 400) msg = `Gemini rejected the request (400): ${lastDetail.slice(0, 160)}`;
    else if (lastStatus === 403) msg = "Gemini rejected the API key (403) — check GEMINI_API_KEY in Vercel.";
    else if (lastStatus === 404) msg = `Gemini model not found (404): ${MODEL}. Set GEMINI_MODEL to a valid model.`;
    else if (lastStatus) msg = `The blog generator failed (HTTP ${lastStatus}). Please try again.`;
    else msg = "Could not reach the blog generator. Please try again.";
    return res.status(502).json({ error: msg });
  }

  // Parse the JSON the model returned (tolerate stray fences / prose).
  let out;
  try {
    const start = aiText.indexOf("{");
    const end = aiText.lastIndexOf("}");
    out = JSON.parse(aiText.slice(start, end + 1));
  } catch (err) {
    console.error("Blog JSON parse failed. Raw:", aiText?.slice(0, 500));
    return res.status(502).json({ error: "The generator returned an unexpected format. Try again." });
  }

  // Server-side normalization / safety.
  const contentHtml = String(out.contentHtml || "");
  const slug = slugify(out.slug || title);
  const wordCount = wordCountFromHtml(contentHtml);
  const checklist = Array.isArray(out.checklist) ? out.checklist : [];

  // Merge the AI-generated alt/title back onto the input media (by order).
  const outMedia = Array.isArray(out.media) ? out.media : [];
  const mergedMedia = media.map((m, i) => ({
    ...m,
    alt: (outMedia[i] && outMedia[i].alt) || m.alt || "",
    title: (outMedia[i] && outMedia[i].title) || m.title || "",
  }));
  const featured = mergedMedia.find(m => m.type === "image"); // header bg / og:image mirror

  // The effective format written (for "auto", what the model chose).
  const resolvedFormat = autoMode
    ? (FORMATS[out.chosenFormat] ? out.chosenFormat : "standard")
    : (FORMATS[b.format] ? b.format : "standard");

  return res.status(200).json({
    ok: true,
    format: resolvedFormat,
    primaryKeyword: out.primaryKeyword || "",
    metaTitle: out.metaTitle || title,
    metaDescription: out.metaDescription || "",
    slug,
    imageUrl: featured ? featured.url : imageUrl,
    imageAlt: featured ? featured.alt : (out.imageAlt || ""),
    imageTitle: featured ? featured.title : (out.imageTitle || ""),
    contentHtml,
    media: mergedMedia,
    wordCount,
    checklist,
  });
}

export default requireAuth(handler);
