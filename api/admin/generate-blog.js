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
  "Is there exactly one image included in the blog?",
  "Does the image have descriptive alt text?",
  "Does the image have a clear image title?",
  "Is there a clear next step for the reader?",
];

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

CONTENT QUALITY
- Answer the reader's main question clearly with useful examples, tips, or steps.
- Practical, not vague. Include original insight / expert commentary (you're the photo booth expert).
- Cover the topic thoroughly, no filler. Every section must earn its place.

READABILITY
- Simple, direct language. Concise sentences. Active voice. Transition phrases. Easy to skim. Most important info near the top.

~1,000-WORD LAYOUT (aim 950–1,150 words of body copy)
- Intro 100–150 · Background 150–200 · Key tips/steps/sections 500–600 · Common mistakes/extra advice 100–150 · Conclusion + CTA ~100.

IMAGE
- Include EXACTLY ONE <img> in the body, placed where it best supports the topic. Use the provided image URL. Give it descriptive alt text that naturally includes the primary keyword when appropriate, and a short descriptive title. Never use generic alt like "image".

ON-PAGE SEO EXTRAS
- Add a Table of Contents (anchor links to the H2 sections) near the top.
- Add at least one internal link to a relevant Evergrain page. Valid internal paths: /packages, /add-ons, /the-booth, /our-story, /faq, /get-started, /areas-we-serve, and category/landing pages under /candid-moments. Use root-relative hrefs.
- Add at least one external link to a genuinely trustworthy, relevant source (real, well-known domains only).
- Include a short FAQ section (2–4 Q&As) near the end using <h2>Frequently Asked Questions</h2> and <h3> for each question.

HTML RULES
- Output the body as clean semantic HTML: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <a>, <img>, <blockquote>. Do NOT include <h1> (the title is rendered separately), and do NOT include <html>, <head>, <body>, or inline styles/scripts.
- Give each <h2> section an id (kebab-case) so the Table of Contents can link to it.

OUTPUT FORMAT
Respond with ONLY a single JSON object — no prose, no markdown code fences. Shape:
{
  "primaryKeyword": string,
  "metaTitle": string,        // 50–60 chars
  "metaDescription": string,  // 140–160 chars
  "slug": string,             // kebab-case
  "imageAlt": string,         // descriptive, keyword-aware
  "imageTitle": string,       // short descriptive
  "contentHtml": string,      // the full body HTML per the rules above
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

  const imageUrl = (b.imageUrl || "").trim();
  const userMsg = [
    `Write the blog article. Working title: "${title}".`,
    b.categoryName ? `Category context: ${b.categoryName}.` : "",
    imageUrl
      ? `Use this exact image URL for the single required <img>: ${imageUrl}${b.imageAlt ? ` (preferred alt: "${b.imageAlt}")` : ""}${b.imageTitle ? ` (preferred title: "${b.imageTitle}")` : ""}.`
      : `No image URL was provided — still include one <img>, but leave src="" and set the checklist image items to pass:false with a note to add an image URL.`,
    `Return ONLY the JSON object.`,
  ].filter(Boolean).join("\n");

  let aiText;
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": GEMINI_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userMsg }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 16384,
            // Force raw JSON output (no code fences / prose to strip).
            responseMimeType: "application/json",
          },
        }),
      }
    );
    if (!r.ok) {
      const detail = await r.text();
      console.error("Gemini error:", r.status, detail);
      return res.status(502).json({ error: "The blog generator is unavailable right now. Please try again." });
    }
    const data = await r.json();
    const cand = (data.candidates && data.candidates[0]) || null;
    // Safety block or empty candidate → no usable content.
    if (!cand || cand.finishReason === "SAFETY" || cand.finishReason === "PROHIBITED_CONTENT") {
      console.error("Gemini blocked/empty:", JSON.stringify(data).slice(0, 500));
      return res.status(502).json({ error: "The generator declined this title. Try rephrasing it." });
    }
    aiText = (cand.content?.parts || []).map(p => p.text || "").join("");
  } catch (err) {
    console.error("Gemini fetch failed:", err);
    return res.status(502).json({ error: "Could not reach the blog generator." });
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

  return res.status(200).json({
    ok: true,
    primaryKeyword: out.primaryKeyword || "",
    metaTitle: out.metaTitle || title,
    metaDescription: out.metaDescription || "",
    slug,
    imageUrl,
    imageAlt: out.imageAlt || "",
    imageTitle: out.imageTitle || "",
    contentHtml,
    wordCount,
    checklist,
  });
}

export default requireAuth(handler);
