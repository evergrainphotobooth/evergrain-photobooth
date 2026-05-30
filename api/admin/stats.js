/* =========================================================
   GET /api/admin/stats — dashboard data points.
   Counts inquiries (total, new, this week) + blog posts.
   ========================================================= */

import { requireAuth } from "../_lib/auth.js";

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

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [totalResp, newResp, weekResp] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/inquiries?select=id`, { headers: { ...headers, Range: "0-0" } }),
      fetch(`${SUPABASE_URL}/rest/v1/inquiries?select=id&status=eq.new`, { headers: { ...headers, Range: "0-0" } }),
      fetch(`${SUPABASE_URL}/rest/v1/inquiries?select=id&created_at=gte.${weekAgo}`, { headers: { ...headers, Range: "0-0" } }),
    ]);

    const parseCount = r => {
      const range = r.headers.get("content-range") || "";
      const m = range.match(/\/(\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    };

    return res.status(200).json({
      ok: true,
      inquiries: {
        total: parseCount(totalResp),
        new: parseCount(newResp),
        thisWeek: parseCount(weekResp),
      },
      blogPosts: 0, // Phase 2: pull from posts table once it exists
    });
  } catch (err) {
    console.error("stats error:", err);
    return res.status(500).json({ error: "Failed to load stats" });
  }
}

export default requireAuth(handler);
