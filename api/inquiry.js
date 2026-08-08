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
  // sourcePage is captured inside raw_payload below (no dedicated column, so the
  // live form never depends on a migration). The CMS reads raw_payload.sourcePage.
  cols.last_step = step;
  cols.completed = !isPartial;           // true only on the final completion call
  cols.raw_payload = payload;

  const sbHeaders = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };

  let rowId = existingId;
  let didInsert = false; // true when a brand-new row is created this request

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
    didInsert = true;
  }

  // ---- Email the team via Resend ----
  // Two triggers so no lead is ever missed:
  //   (1) a brand-new lead's FIRST save (partial create) → "lead started" heads-up
  //   (2) completion → full details
  // Progressive partial UPDATES (same row, still incomplete) never email.
  const justStarted = isPartial && didInsert;
  let email = "not_attempted";
  if (!isPartial || justStarted) {
    const missingEnv = ["RESEND_API_KEY", "INQUIRY_FROM_EMAIL", "INQUIRY_TO_EMAIL"].filter(k => !process.env[k]);
    if (missingEnv.length) {
      email = `skipped: missing env ${missingEnv.join(", ")}`;
      console.error("Inquiry email skipped —", email);
    } else {
      const subject = justStarted
        ? `New lead started — ${payload.name || "someone"}`
        : `New Inquiry — ${payload.name} for ${formatDate(payload.eventDate)}`;
      try {
        const mailResp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: INQUIRY_FROM_EMAIL,
            to: [INQUIRY_TO_EMAIL],
            reply_to: payload.email,
            subject,
            html: renderEmail(payload, { partial: justStarted }),
          }),
        });
        if (mailResp.ok) {
          email = "sent";
        } else {
          const detail = await mailResp.text();
          email = `failed: ${mailResp.status} ${detail.slice(0, 200)}`;
          console.error("Resend send failed:", mailResp.status, detail);
        }
      } catch (err) {
        email = `failed: ${String(err.message || err)}`;
        console.error("Resend error:", err);
      }
    }
  }

  // ---- Auto-reply confirmation to the applicant (completion only) ----
  // Sent from the verified Resend sender with the display name "Evergrain
  // Photobooth" and Reply-To set to the Gmail inbox, so replies land there.
  // Never fires on the partial "lead started" event, and a failure here never
  // affects the saved inquiry or the team notification.
  let autoReply = "not_attempted";
  if (!isPartial && payload.email) {
    const missA = ["RESEND_API_KEY", "INQUIRY_FROM_EMAIL"].filter(k => !process.env[k]);
    if (missA.length) {
      autoReply = `skipped: missing env ${missA.join(", ")}`;
      console.error("Auto-reply skipped —", autoReply);
    } else {
      const fromAddr = (String(INQUIRY_FROM_EMAIL).match(/<([^>]+)>/) || [null, INQUIRY_FROM_EMAIL])[1].trim();
      try {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: `Evergrain Photobooth <${fromAddr}>`,
            to: [payload.email],
            reply_to: "evergrainphotobooth@gmail.com",
            subject: "We got your inquiry! ✨ — Evergrain Photobooth",
            html: renderAutoReply(payload),
          }),
        });
        autoReply = r.ok ? "sent" : `failed: ${r.status} ${(await r.text()).slice(0, 150)}`;
        if (!r.ok) console.error("Auto-reply send failed:", autoReply);
      } catch (err) {
        autoReply = `failed: ${String(err.message || err)}`;
        console.error("Auto-reply error:", err);
      }
    }
  }

  // Record that the confirmation went out (stored in raw_payload so no schema
  // migration is needed) — the admin reads this to show a "Confirmation sent"
  // badge. Non-fatal: if it fails, only the badge is missing.
  if (rowId && autoReply === "sent") {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/inquiries?id=eq.${encodeURIComponent(rowId)}`, {
        method: "PATCH",
        headers: sbHeaders,
        body: JSON.stringify({ raw_payload: { ...payload, confirmation_sent: true } }),
      });
    } catch (_) { /* badge just won't show */ }
  }

  return res.status(200).json({ ok: true, id: rowId, email, autoReply });
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
function renderEmail(p, opts = {}) {
  const partial = !!opts.partial;
  const row = (label, val) => val
    ? `<tr><td style="padding:6px 12px 6px 0;color:#5C4A35;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:6px 0;color:#1A1410;font-size:14px;">${escapeHtml(val)}</td></tr>`
    : "";
  const addons = Array.isArray(p.interestedAddons) ? p.interestedAddons.join(", ") : "";
  const banner = partial
    ? `<div style="background:#FBF3E4;border:1px solid #E4CF9E;border-radius:6px;padding:12px 14px;margin:0 0 22px;color:#5C4A35;font-size:13px;line-height:1.5;">⚠ This lead just <strong>started</strong> the inquiry form and hasn't finished submitting yet. Here's what they've entered so far — a quick reply now helps keep them warm.</div>`
    : "";
  return `<!doctype html><html><body style="font-family:Manrope,-apple-system,BlinkMacSystemFont,sans-serif;background:#F4EDE0;margin:0;padding:32px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:36px;">
    <div style="border-bottom:2px solid #A47A2A;padding-bottom:18px;margin-bottom:24px;">
      <p style="font-family:Inter,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#A47A2A;margin:0 0 6px;">${partial ? "New Lead — Started" : "New Inquiry"}</p>
      <h1 style="font-family:Georgia,serif;font-weight:300;color:#1F4332;margin:0;font-size:26px;letter-spacing:-0.01em;">${escapeHtml(p.name)}</h1>
    </div>
    ${banner}
    <table style="width:100%;border-collapse:collapse;">
      ${row("Email", p.email)}
      ${row("Phone", p.phone)}
      ${row("Event Date", formatDate(p.eventDate))}
      ${row("Event Start", formatTime(p.eventStartTime))}
      ${row("Event Type", p.eventType)}
      ${row("Venue Name", p.venueCity)}
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

/* ---------- Applicant auto-reply email ---------- */
function renderAutoReply(p) {
  const A = "https://evergrainphotobooth.com/assets";
  const cell = "padding:7px 12px 7px 0;color:#8A7358;font-size:11px;letter-spacing:0.09em;text-transform:uppercase;vertical-align:top;white-space:nowrap;";
  const val = "padding:7px 0;color:#1A1410;font-size:14.5px;";
  const row = (label, value) => value
    ? `<tr><td style="${cell}">${escapeHtml(label)}</td><td style="${val}">${escapeHtml(value)}</td></tr>`
    : "";
  const addons = p.selectedAddons || (Array.isArray(p.interestedAddons) ? p.interestedAddons.join(", ") : "");
  const totalRow = p.estimatedTotal
    ? `<tr><td style="${cell}">Estimated Total</td><td style="padding:7px 0;color:#1F4332;font-size:15px;font-weight:700;">${escapeHtml(p.estimatedTotal)}</td></tr>`
    : "";
  const recap = [
    row("Name", p.name),
    row("Email", p.email),
    row("Phone", p.phone),
    row("Event Date", formatDate(p.eventDate)),
    row("Start Time", formatTime(p.eventStartTime)),
    row("Event Type", p.eventType),
    row("Venue Name", p.venueCity),
    row("Venue Address", p.venueAddress),
    row("Guest Count", p.guests),
    row("Package", p.selectedPackage || p.packageInterest),
    row("Add-ons", addons),
    totalRow,
  ].join("");

  return `<!doctype html><html><body style="margin:0;padding:24px;background:#DCD6CB;font-family:Manrope,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#DCD6CB;"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden;">
      <tr><td background="${A}/img/email-header-bg.png" style="background:#1F4332 url('${A}/img/email-header-bg.png') center center / cover no-repeat;padding:36px 40px 30px;text-align:center;border-bottom:3px solid #A47A2A;">
        <img src="${A}/logos/FullLogo_White.png" width="200" alt="Evergrain Photobooth" style="display:inline-block;width:200px;max-width:70%;height:auto;" />
      </td></tr>
      <tr><td style="padding:40px 40px 8px;text-align:center;">
        <div style="font-size:34px;line-height:1.1;margin:0 0 6px;">🎉</div>
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;color:#1F4332;font-size:28px;line-height:1.15;margin:0 0 6px;letter-spacing:-0.01em;">You're on our radar!</h1>
        <p style="font-family:Inter,sans-serif;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#A47A2A;margin:0;font-weight:600;">We received your inquiry</p>
      </td></tr>
      <tr><td style="padding:22px 44px 6px;">
        <p style="color:#3D3226;font-size:15px;line-height:1.65;margin:0 0 16px;">Thank you for reaching out to Evergrain Photobooth—we're so excited to learn more about your event! Your inquiry has been received and we'll be in touch with a custom proposal within <strong style="color:#1F4332;">24 hours</strong>.</p>
        <div style="background:#FBF3E4;border:1px solid #E4CF9E;border-radius:8px;padding:14px 16px;margin:0 0 18px;">
          <p style="color:#5C4A35;font-size:13.5px;line-height:1.6;margin:0;">In the meantime, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder if you don't hear from us — we'd hate for our response to get lost!</p>
        </div>
        <p style="color:#3D3226;font-size:15px;line-height:1.6;margin:0 0 8px;text-align:center;">Can't wait? Reach us directly at:</p>
        <p style="color:#3D3226;font-size:15px;line-height:1.9;margin:0 0 4px;text-align:center;">📧 <a href="mailto:evergrainphotobooth@gmail.com" style="color:#A47A2A;text-decoration:none;font-weight:600;">evergrainphotobooth@gmail.com</a><br />📞 <a href="tel:+16265608330" style="color:#A47A2A;text-decoration:none;font-weight:600;">(626) 560-8330</a></p>
      </td></tr>
      <tr><td style="padding:24px 44px 8px;">
        <hr style="border:0;border-top:1px solid #ECE2D0;margin:0 0 22px;" />
        <p style="font-family:Georgia,serif;color:#1F4332;font-size:17px;font-weight:400;margin:0 0 14px;">Here's a copy of what we received:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#FAF6EE;border-radius:8px;"><tr><td style="padding:16px 18px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${recap}</table>
        </td></tr></table>
      </td></tr>
      <tr><td style="padding:24px 44px 34px;">
        <p style="font-family:Georgia,serif;font-style:italic;color:#1F4332;font-size:15px;margin:0 0 22px;text-align:center;">We can't wait to be part of your event.</p>
        <hr style="border:0;border-top:1px solid #ECE2D0;margin:0 0 20px;" />
        <p style="font-family:Inter,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#1F4332;font-weight:700;margin:0 0 10px;text-align:center;">Cindy + Hamilton <span style="color:#8A7358;font-weight:500;">· Owners</span></p>
        <img src="${A}/logos/FullLogo_Green.png" width="150" alt="Evergrain Photobooth" style="display:block;width:150px;max-width:60%;height:auto;margin:0 auto 10px;" />
        <p style="color:#5C4A35;font-size:13px;line-height:1.75;margin:0;text-align:center;">Tel: <a href="tel:+16265608330" style="color:#5C4A35;text-decoration:none;">(626) 560-8330</a><br /><a href="https://evergrainphotobooth.com" style="color:#A47A2A;text-decoration:none;font-weight:600;">Website</a> &nbsp;·&nbsp; <a href="https://www.instagram.com/evergrainphotobooth/" style="color:#A47A2A;text-decoration:none;font-weight:600;">Instagram</a> &nbsp;·&nbsp; <a href="https://www.yelp.com/biz/evergrain-photobooth-los-angeles" style="color:#A47A2A;text-decoration:none;font-weight:600;">Yelp</a></p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
