/* =========================================================
   Evergrain Photobooth — Quick Contact fill
   One-tap fast path for the inquiry form, on EVERY device:
     • Android Chrome / Samsung Internet → W3C Contact Picker API
       (navigator.contacts.select) opens the native contacts sheet.
     • iOS Safari / desktop (no Contact Picker API) → focus the Name
       field so the browser's built-in AutoFill ("AutoFill Contact")
       bar appears above the keyboard. That is Apple's/Chrome's native
       equivalent — there is no web API to open the contacts sheet on iOS.
   The button is always visible; only its behavior branches.
   ========================================================= */

(function () {
  const btn = document.querySelector("[data-contact-picker]");
  if (!btn) return;

  const supported =
    "contacts" in navigator &&
    "ContactsManager" in window &&
    navigator.contacts &&
    typeof navigator.contacts.select === "function";

  // Always reveal the button + helper UI — it works on every device,
  // just via different mechanisms (native picker vs. native AutoFill).
  document
    .querySelectorAll("[data-contact-picker], [data-contact-picker-hint], [data-contact-picker-divider]")
    .forEach((el) => { el.hidden = false; });

  // Tailor the hint copy to what the tap will actually do on this device.
  const hint = document.querySelector("[data-contact-picker-hint]");
  if (hint) {
    hint.textContent = supported
      ? "One tap to autofill your name, email & phone from your contacts."
      : "One tap to jump in and use your keyboard's AutoFill.";
  }

  const firstOf = (arr) => (Array.isArray(arr) && arr.length ? arr[0] : "");

  // Match the inquiry form's (XXX) XXX-XXXX formatter so a picked number
  // displays consistently even though we set it programmatically.
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
    // Fire input + change so partial-save tracking + validation react.
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // Fallback path (iOS / desktop): bring the Name field into view and focus
  // it within the click gesture so the OS AutoFill suggestion bar surfaces.
  function focusForAutofill() {
    const name = document.getElementById("name");
    if (!name) return;
    name.scrollIntoView({ behavior: "smooth", block: "center" });
    // focus must run in the same user-gesture tick for iOS to show AutoFill
    name.focus({ preventScroll: true });
  }

  btn.addEventListener("click", async () => {
    if (!supported) {
      focusForAutofill();
      return;
    }
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
      // Permission denied / runtime failure → fall back to manual entry.
      console.warn("Contact Picker:", err && err.message);
      focusForAutofill();
    } finally {
      btn.disabled = false;
    }
  });
})();
