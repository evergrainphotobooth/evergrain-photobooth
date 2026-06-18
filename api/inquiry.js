/* =========================================================
   Evergrain Photobooth — Inquiry endpoint
   POST /api/inquiry
   1. Validates required fields
   2. Inserts row into Supabase `inquiries` table (via REST)
   3. Emails the team via Resend
   Uses pure fetch — no SDK installs needed.
   ========================================================= */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let payload = req.body || {};
  if (typeof payload === "string") {
    try { payload = JSON.parse(payload); } catch { return res.status(400).json({ error: "Invalid JSON" }); }
  }

  // Honeypot — bots tend to fill every field; a hidden one tells us it's a bot.
  if (payload.website) return res.status(200).json({ ok: true });

  const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY,
    INQUIRY_FROM_EMAIL,
    INQUIRY_TO_EMAIL,
  } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase env vars");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  // ---- Mode detection ----------------------------------------------------
  // The 4-step stepper drives three flows against ONE row:
  //   1. Partial create  — { partial:true, step:1, ...step1 fields }  → INSERT (completed=false), returns id, no email
  //   2. Progressive PATCH — { id, partial:true, step:N, ...fields }  → UPDATE that row (only while completed=false), no email
  //   3. Completion       — { id, partial:false, ...all fields }      → UPDATE → completed=true + email
  // Legacy full submit (no id, no partial flag) still works: INSERT completed=true + email.
  const isPartial = payload.partial === true;
  const existingId = typeof payload.id === "string" && payload.id ? payload.id : null;
  const step = Number(payload.step) || (isPartial ? 1 : 4);

  // Step-1 fields are the minimum to create/keep a lead.
  const STEP1 = ["name", "email", "phone", "eventType"];

  // Required-field rules per flow:
  //   - partial create (no id): the step-1 contact fields
  //   - progressive patch (partial + id): nothing (fields already persisted)
  //   - completion OF an existing partial row (id present): just packageInterest —
  //     the contact fields were validated + saved at step 1 and live in the row,
  //     so we don't force the client to re-send them
  //   - legacy one-shot full submit (no id, not partial): the full set
  let required;
  if (isPartial && !existingId) required = STEP1;
  else if (isPartial) required = [];
  else if (existingId) required = ["packageInterest"];
  else required = [...STEP1, "packageInterest"];
  const missing = required.filter(k => !payload[k]);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(", ")}` });

  // Build the column set from whatever fields are present. Undefined keys are
  // omitted so a partial PATCH never clobbers a previously-saved field with null.
  const cols = {};
  const set = (col, val) => { if (val !== undefined) cols[col] = val; };
  set("name", payload.name);
  set("email", payload.email);
  set("phone", payload.phone);
  set("event_date", payload.eventDate || null);
  set("event_start_time", payload.eventStartTime || null);
  set("event_type", payload.eventType);
  set("venue_city", payload.venueCity || null);
  set("venue_address", payload.venueAddress || null);
  set("guests", payload.guests || null);
  set("package_interest", payload.packageInterest || null);
  set("aesthetic", payload.aesthetic || null);
  if (Array.isArray(payload.interestedAddons)) set("interested_addons", payload.interestedAddons);
  set("selected_package", payload.selectedPackage || null);
  set("selected_addons", payload.selectedAddons || null);
  set("estimated_total", payload.estimatedTotal || null);
  set("referral", payload.referral || null);
  set("message", payload.message || null);
  cols.last_step = step;
  cols.completed = !isPartial;           // true only on the final completion call
  cols.raw_payload = payload;

  const sbHeaders = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };

  let rowId = existingId;

  if (existingId) {
    // ---- UPDATE the in-progress row. Guard: only rows still completed=false,
    // so a finished inquiry can never be overwritten by a replayed/forged id. ----
    const upd = await fetch(
      `${SUPABASE_URL}/rest/v1/inquiries?id=eq.${encodeURIComponent(existingId)}&completed=eq.false`,
      { method: "PATCH", headers: { ...sbHeaders, Prefer: "return=representation" }, body: JSON.stringify(cols) }
    );
    if (!upd.ok) {
      console.error("Supabase update failed:", await upd.text());
      return res.status(500).json({ error: "Could not save inquiry" });
    }
    const rows = await upd.json().catch(() => []);
    if (!Array.isArray(rows) || rows.length === 0) {
      // 0 rows matched → the id is unknown or already completed (e.g. a stale
      // session id from a prior finished inquiry). Treat this as a brand-new
      // lead and fall through to INSERT, so a lead is never silently dropped.
      rowId = null;
    } else {
      rowId = rows[0].id;
    }
  }

  if (!rowId) {
    // ---- INSERT a new row (partial step-1 OR legacy/fallback full submit) ----
    const ins = await fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
      method: "POST",
      headers: { ...sbHeaders, Prefer: "return=representation" },
      body: JSON.stringify(cols),
    });
    if (!ins.ok) {
      console.error("Supabase insert failed:", await ins.text());
      return res.status(500).json({ error: "Could not save inquiry" });
    }
    const rows = await ins.json().catch(() => []);
    rowId = Array.isArray(rows) && rows[0] ? rows[0].id : null;
  }

  // ---- Email the team via Resend — ONLY on completion (never on partial saves) ----
  if (!isPartial && RESEND_API_KEY && INQUIRY_FROM_EMAIL && INQUIRY_TO_EMAIL) {
    try {
      const mailResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: INQUIRY_FROM_EMAIL,
          to: [INQUIRY_TO_EMAIL],
          reply_to: payload.email,
          subject: `New Inquiry — ${payload.name} for ${formatDate(payload.eventDate)}`,
          html: renderEmail(payload),
        }),
      });
      if (!mailResp.ok) console.error("Resend send failed:", await mailResp.text());
    } catch (err) {
      console.error("Resend error:", err);
    }
  }

  return res.status(200).json({ ok: true, id: rowId });
}

/* ---------- Date + time formatting ---------- */
function formatDate(iso) {
  if (!iso) return "";
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${m[2]}/${m[3]}/${m[1]}`; // MM/DD/YYYY
}
function formatTime(hhmm) {
  if (!hhmm) return "";
  const m = String(hhmm).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return hhmm;
  const h = parseInt(m[1], 10);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m[2]} ${period} PST`;
}

/* ---------- Email template ---------- */
function renderEmail(p) {
  const row = (label, val) => val
    ? `<tr><td style="padding:6px 12px 6px 0;color:#5C4A35;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:6px 0;color:#1A1410;font-size:14px;">${escapeHtml(val)}</td></tr>`
    : "";
  const addons = Array.isArray(p.interestedAddons) ? p.interestedAddons.join(", ") : "";
  return `<!doctype html><html><body style="font-family:Manrope,-apple-system,BlinkMacSystemFont,sans-serif;background:#F4EDE0;margin:0;padding:32px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:36px;">
    <div style="border-bottom:2px solid #A47A2A;padding-bottom:18px;margin-bottom:24px;">
      <p style="font-family:Inter,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#A47A2A;margin:0 0 6px;">New Inquiry</p>
      <h1 style="font-family:Georgia,serif;font-weight:300;color:#1F4332;margin:0;font-size:26px;letter-spacing:-0.01em;">${escapeHtml(p.name)}</h1>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      ${row("Email", p.email)}
      ${row("Phone", p.phone)}
      ${row("Event Date", formatDate(p.eventDate))}
      ${row("Event Start", formatTime(p.eventStartTime))}
      ${row("Event Type", p.eventType)}
      ${row("Venue City", p.venueCity)}
      ${row("Venue Address", p.venueAddress)}
      ${row("Guests", p.guests)}
      ${row("Aesthetic", p.aesthetic)}
      ${row("Heard About Us", p.referral)}
    </table>
    <hr style="border:0;border-top:1px solid #eee;margin:24px 0;">
    <h3 style="font-family:Georgia,serif;font-weight:400;color:#1F4332;font-size:18px;margin:0 0 12px;">Package List</h3>
    <table style="width:100%;border-collapse:collapse;">
      ${row("Package", p.selectedPackage || p.packageInterest)}
      ${row("Add-Ons", p.selectedAddons || addons)}
      ${row("Estimated Total", p.estimatedTotal)}
    </table>
    ${p.message ? `<hr style="border:0;border-top:1px solid #eee;margin:24px 0;"><h3 style="font-family:Georgia,serif;font-weight:400;color:#1F4332;font-size:18px;margin:0 0 12px;">Message</h3><p style="white-space:pre-wrap;color:#1A1410;line-height:1.6;margin:0;">${escapeHtml(p.message)}</p>` : ""}
  </div>
</body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
