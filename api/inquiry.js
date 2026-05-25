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
  // Add <input name="website" tabindex="-1" autocomplete="off" hidden> if you want it client-side.
  if (payload.website) return res.status(200).json({ ok: true });

  const required = ["name", "email", "phone", "eventDate", "eventType", "venueCity"];
  const missing = required.filter(k => !payload[k]);
  if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(", ")}` });

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

  // ---- 1. Save to Supabase ----
  const dbResp = await fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      event_date: payload.eventDate,
      event_start_time: payload.eventStartTime || null,
      event_type: payload.eventType,
      venue_city: payload.venueCity,
      venue_address: payload.venueAddress || null,
      guests: payload.guests ? Number(payload.guests) : null,
      package_interest: payload.packageInterest || null,
      aesthetic: payload.aesthetic || null,
      interested_addons: Array.isArray(payload.interestedAddons) ? payload.interestedAddons : [],
      selected_package: payload.selectedPackage || null,
      selected_addons: payload.selectedAddons || null,
      estimated_total: payload.estimatedTotal || null,
      referral: payload.referral || null,
      message: payload.message || null,
      raw_payload: payload,
    }),
  });

  if (!dbResp.ok) {
    console.error("Supabase save failed:", await dbResp.text());
    return res.status(500).json({ error: "Could not save inquiry" });
  }

  // ---- 2. Email the team via Resend (non-blocking — DB save is already done) ----
  if (RESEND_API_KEY && INQUIRY_FROM_EMAIL && INQUIRY_TO_EMAIL) {
    try {
      const mailResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: INQUIRY_FROM_EMAIL,
          to: [INQUIRY_TO_EMAIL],
          reply_to: payload.email,
          subject: `New Inquiry — ${payload.name} for ${payload.eventDate}`,
          html: renderEmail(payload),
        }),
      });
      if (!mailResp.ok) console.error("Resend send failed:", await mailResp.text());
    } catch (err) {
      console.error("Resend error:", err);
    }
  }

  return res.status(200).json({ ok: true });
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
      ${row("Event Date", p.eventDate)}
      ${row("Event Start", p.eventStartTime)}
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
