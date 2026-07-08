/* =========================================================
   GET /api/admin/stats — dashboard data points.
   - Inquiries: total / new / this week (Supabase count headers)
   - Blog: live (published) + scheduled counts, category ranking,
     top-20 targeted keywords by usage across published posts
   - Analytics (optional): GA4 traffic (yesterday / 7d / 30d) + top pages,
     via a Google service account. Degrades gracefully if not configured.
   ========================================================= */

import { requireAuth } from "../_lib/auth.js";
import crypto from "node:crypto";

/* ---------- GA4 (Google Analytics Data API) ---------- */
const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

async function gaAccessToken(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
  }));
  const input = `${header}.${claim}`;
  const signature = crypto.createSign("RSA-SHA256").update(input).sign(privateKey);
  const jwt = `${input}.${b64url(signature)}`;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!r.ok) throw new Error(`token ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return (await r.json()).access_token;
}

// Robustly recover a PEM private key from an env var (handles escaped newlines,
// stray surrounding quotes, CRLF, and a base64-encoded PEM).
function normalizePrivateKey(raw) {
  let key = String(raw || "").trim();
  if (key.length > 1 && ((key[0] === '"' && key.endsWith('"')) || (key[0] === "'" && key.endsWith("'")))) {
    key = key.slice(1, -1);
  }
  // If there's no PEM header, assume it's base64-encoded and decode.
  if (!key.includes("BEGIN")) {
    try { const dec = Buffer.from(key, "base64").toString("utf8"); if (dec.includes("BEGIN")) key = dec; } catch { /* keep as-is */ }
  }
  return key
    .replace(/\\\\n/g, "\n")  // double-escaped \\n
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")    // single-escaped \n
    .replace(/\r\n/g, "\n")   // CRLF → LF
    .trim() + "\n";
}

async function fetchAnalytics() {
  const propId = process.env.GA4_PROPERTY_ID;
  const clientEmail = process.env.GA_SA_CLIENT_EMAIL;
  if (!propId || !clientEmail || !process.env.GA_SA_PRIVATE_KEY) return { connected: false };
  const privateKey = normalizePrivateKey(process.env.GA_SA_PRIVATE_KEY);

  try {
    const token = await gaAccessToken(clientEmail, privateKey);
    const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propId}:batchRunReports`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            metrics: [{ name: "sessions" }],
            dateRanges: [
              { startDate: "yesterday", endDate: "yesterday" },
              { startDate: "7daysAgo", endDate: "yesterday" },
              { startDate: "30daysAgo", endDate: "yesterday" },
            ],
          },
          {
            dimensions: [{ name: "pagePath" }],
            metrics: [{ name: "screenPageViews" }],
            dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }],
            orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
            limit: 10,
          },
        ],
      }),
    });
    if (!r.ok) return { connected: false, error: `GA ${r.status}: ${(await r.text()).slice(0, 160)}` };
    const data = await r.json();

    // Report 0: one row per date range (GA adds an auto "dateRange" dimension).
    const traffic = { yesterday: 0, last7: 0, last30: 0 };
    const order = ["yesterday", "last7", "last30"];
    for (const row of (data.reports?.[0]?.rows || [])) {
      const drv = (row.dimensionValues || []).map(d => d.value).find(v => /^date_range_\d+$/.test(v || ""));
      const idx = drv ? Number(drv.split("_").pop()) : 0;
      traffic[order[idx] || "yesterday"] = Number(row.metricValues?.[0]?.value || 0);
    }
    // Report 1: top pages by views (last 7 days).
    const topPages = (data.reports?.[1]?.rows || []).map(row => ({
      path: row.dimensionValues?.[0]?.value || "",
      views: Number(row.metricValues?.[0]?.value || 0),
    }));
    return { connected: true, traffic, topPages };
  } catch (err) {
    console.error("GA4 error:", err);
    return { connected: false, error: String(err.message || err) };
  }
}

/* ---------- keyword occurrence counting ---------- */
function textFromHtml(html) {
  return String(html || "")
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

async function handler(req, res) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    Prefer: "count=exact",
  };
  const sbGet = (path) => fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
  });
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const parseCount = r => {
    const m = (r.headers.get("content-range") || "").match(/\/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  };

  try {
    const [
      totalResp, newResp, weekResp,
      postsResp, catsResp, kwResp,
      analytics,
    ] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/inquiries?select=id`, { headers: { ...headers, Range: "0-0" } }),
      fetch(`${SUPABASE_URL}/rest/v1/inquiries?select=id&status=eq.new`, { headers: { ...headers, Range: "0-0" } }),
      fetch(`${SUPABASE_URL}/rest/v1/inquiries?select=id&created_at=gte.${weekAgo}`, { headers: { ...headers, Range: "0-0" } }),
      sbGet(`blog_posts?select=status,category_id,category_ids,content_html`),
      sbGet(`blog_categories?select=id,name,slug`),
      sbGet(`blog_keywords?select=keyword`),
      fetchAnalytics(),
    ]);

    const posts = postsResp.ok ? await postsResp.json() : [];
    const cats = catsResp.ok ? await catsResp.json() : [];
    const kws = kwResp.ok ? await kwResp.json() : [];

    // Blog status counts
    let published = 0, scheduled = 0, draft = 0;
    for (const p of posts) {
      if (p.status === "published") published++;
      else if (p.status === "scheduled") scheduled++;
      else draft++;
    }

    // Category ranking over PUBLISHED posts (what's live on the site)
    const livePosts = posts.filter(p => p.status === "published");
    const catCount = {};
    for (const p of livePosts) {
      const ids = new Set([...(Array.isArray(p.category_ids) ? p.category_ids : []), p.category_id].filter(Boolean));
      for (const id of ids) catCount[id] = (catCount[id] || 0) + 1;
    }
    const categoryRanking = cats
      .map(c => ({ name: c.name, slug: c.slug, count: catCount[c.id] || 0 }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    // Top-20 targeted keywords by occurrences across published content
    const bodies = livePosts.map(p => textFromHtml(p.content_html));
    const keywordRanking = kws
      .map(({ keyword }) => {
        const needle = String(keyword || "").toLowerCase().trim();
        let count = 0;
        if (needle) for (const t of bodies) count += t.split(needle).length - 1;
        return { keyword, count };
      })
      .sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword))
      .slice(0, 20);

    return res.status(200).json({
      ok: true,
      inquiries: {
        total: parseCount(totalResp),
        new: parseCount(newResp),
        thisWeek: parseCount(weekResp),
      },
      blog: { published, scheduled, draft, total: posts.length },
      categoryRanking,
      keywordRanking,
      analytics,
    });
  } catch (err) {
    console.error("stats error:", err);
    return res.status(500).json({ error: "Failed to load stats" });
  }
}

export default requireAuth(handler);
