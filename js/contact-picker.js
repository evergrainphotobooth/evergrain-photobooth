/* =========================================================
   Evergrain Photobooth — Contact Picker (W3C Contact Picker API)
   One-tap autofill of Name / Email / Phone for the inquiry form.
   Progressive enhancement: the [data-contact-picker] trigger stays
   hidden unless the API is available (Chrome on Android, secure
   context), so the manual stepper form is always the baseline.
   ========================================================= */

(function () {
  const btn = document.querySelector("[data-contact-picker]");
  if (!btn) return;

  const supported =
    "contacts" in navigator &&
    "ContactsManager" in window &&
    navigator.contacts &&
    typeof navigator.contacts.select === "function";

  // Not supported → leave the trigger + helper UI hidden; manual form only.
  if (!supported) return;

  // Reveal the picker affordances now that we know the API exists.
  document
    .querySelectorAll("[data-contact-picker], [data-contact-picker-hint], [data-contact-picker-divider]")
    .forEach((el) => { el.hidden = false; });

  const firstOf = (arr) => (Array.isArray(arr) && arr.length ? arr[0] : "");

  // Match the inquiry form's (XXX) XXX-XXXX keyup formatter so the
  // picked number displays consistently even though we set it directly.
  function prettyPhone(digits) {
    const d = String(digits).replace(/\D/g, "").slice(0, 10);
    if (d.length >= 7) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    if (d.length >= 4) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    if (d.length > 0) return `(${d}`;
    return "";
  }

  function setField(id, val) {
    const el = document.getElementById(id);
    if (!el || val == null || val === "") return;
    el.value = val;
    // Fire input + change so any listeners (partial-save tracking, validation) react.
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      const results = await navigator.contacts.select(["name", "email", "tel"], { multiple: false });
      if (!results || !results.length) return; // user cancelled the picker

      const c = results[0];
      setField("name", firstOf(c.name));
      setField("email", firstOf(c.email));
      const tel = firstOf(c.tel);
      if (tel) setField("phone", prettyPhone(tel));

      // Nudge to the one remaining Step-1 field so they can hit Next fast.
      const eventType = document.getElementById("eventType");
      if (eventType) {
        eventType.focus();
        eventType.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (err) {
      // Permission denied / runtime failure → silently fall back to manual entry.
      console.warn("Contact Picker:", err && err.message);
    } finally {
      btn.disabled = false;
    }
  });
})();
