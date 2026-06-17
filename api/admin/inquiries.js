/* =========================================================
   Inquiries API for the admin
   GET  /api/admin/inquiries          → list (paginated, filtered)
   GET  /api/admin/inquiries?id=UUID  → single inquiry
   PATCH /api/admin/inquiries         → body: { id, status?, admin_notes? }
   ========================================================= */

import { requireAuth } from "../_lib/auth.js";

async function handler(req, res) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const baseHeaders = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };

  if (req.method === "GET") {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const id = url.searchParams.get("id");

    if (id) {
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/inquiries?id=eq.${encodeURIComponent(id)}&select=*`, {
        headers: baseHeaders,
      });
      const rows = await resp.json();
      if (!Array.isArray(rows) || rows.length === 0) return res.status(404).json({ error: "Not found" });
      return res.status(200).json({ ok: true, inquiry: rows[0] });
    }

    const status = url.searchParams.get("status"); // lead stage, or null (all)
    const completed = url.searchParams.get("completed"); // 'true' | 'false' | null
    const limit  = Math.min(Number(url.searchParams.get("limit")) || 100, 500);
    let filter = status ? `&status=eq.${status}` : "";
    if (completed === "true" || completed === "false") filter += `&completed=eq.${completed}`;

    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/inquiries?select=id,created_at,name,email,phone,event_date,event_type,venue_city,status,selected_package,estimated_total,completed,last_step${filter}&order=created_at.desc&limit=${limit}`,
      { headers: baseHeaders }
    );
    if (!resp.ok) {
      console.error("inquiries list failed:", await resp.text());
      return res.status(500).json({ error: "Failed to load inquiries" });
    }
    const rows = await resp.json();
    return res.status(200).json({ ok: true, inquiries: rows });
  }

  if (req.method === "PATCH") {
    let payload = req.body || {};
    if (typeof payload === "string") {
      try { payload = JSON.parse(payload); } catch { return res.status(400).json({ error: "Invalid JSON" }); }
    }
    const { id, status, admin_notes } = payload;
    if (!id) return res.status(400).json({ error: "id required" });
    // Lead-stage vocabulary + legacy values (contacted/archived) kept for
    // backward compatibility with any rows created before the stage system.
    const VALID_STATUSES = [
      "new", "initiated", "cold", "warm", "hot", "closed", "bad",
      "contacted", "archived",
    ];
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const patch = {};
    if (status !== undefined)      patch.status = status;
    if (admin_notes !== undefined) patch.admin_notes = admin_notes;
    if (Object.keys(patch).length === 0) return res.status(400).json({ error: "Nothing to update" });

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/inquiries?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        ...baseHeaders,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(patch),
    });
    if (!resp.ok) {
      console.error("inquiries patch failed:", await resp.text());
      return res.status(500).json({ error: "Update failed" });
    }
    const rows = await resp.json();
    return res.status(200).json({ ok: true, inquiry: Array.isArray(rows) ? rows[0] : rows });
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}

export default requireAuth(handler);
