/* =========================================================
   Evergrain — Runtime footer patcher
   Fetches /data/settings.json (deployed canonical) and patches:
     - email/phone/location elements with [data-cms-email|phone|location]
     - social media link hrefs with [data-cms-social="<platform>"]
   Patcher fails silently if the JSON is missing or unreachable; the
   baked-in HTML stays as a fallback.
   ========================================================= */

(async function () {
  try {
    const r = await fetch("/data/settings.json", { cache: "no-cache" });
    if (!r.ok) return;
    const s = await r.json();
    if (s.contact) {
      const c = s.contact;
      document.querySelectorAll("[data-cms-email]").forEach(el => {
        if (el.tagName === "A") el.href = `mailto:${c.email}`;
        el.textContent = c.email;
      });
      document.querySelectorAll("[data-cms-phone]").forEach(el => {
        if (el.tagName === "A") el.href = `tel:${c.phoneE164 || c.phone.replace(/[^\d+]/g, "")}`;
        el.textContent = c.phone;
      });
      document.querySelectorAll("[data-cms-location]").forEach(el => {
        el.textContent = c.location;
      });
    }
    if (s.social) {
      for (const [k, url] of Object.entries(s.social)) {
        document.querySelectorAll(`[data-cms-social="${k}"]`).forEach(el => {
          if (el.tagName === "A" && url) el.href = url;
        });
      }
    }
    if (s.tagline) {
      document.querySelectorAll("[data-cms-tagline]").forEach(el => {
        el.textContent = s.tagline;
      });
    }
  } catch (err) {
    // Fail silently — baked-in HTML stays as fallback
  }
})();
