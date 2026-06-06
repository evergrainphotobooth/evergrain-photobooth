/* =========================================================
   Evergrain Photobooth — Inquiry Section Partial
   Single source of truth for the Request-a-Quote form.
   Injects into <div data-inquiry-placeholder></div> on every page.
   Runs synchronously so cart.js + script.js find the form
   already in the DOM when their DOMContentLoaded handlers fire.

   Package + add-on metadata is embedded as data-* attributes on
   <option> and <input type="checkbox"> so cart.js can two-way-bind
   selections back into the Package List without a separate lookup.
   ========================================================= */

(function () {
  const placeholder = document.querySelector("[data-inquiry-placeholder]");
  if (!placeholder) return;

  // All inter-page links use clean root-relative URLs; no depth math needed.

  // Master data — auto-generated from data/services.json by scripts/build-services.mjs
  // CMS:INQUIRY_DATA:START
  const PACKAGES = [
    { id: "candid", name: "The Candid", price: 600, desc: "3-hour minimum · DSLR quality · unlimited digital · prints + gallery" },
    { id: "moment", name: "The Moment", price: 750, desc: "3-hour minimum · customizable templates · premium backdrop · custom screens" },
    { id: "glam", name: "The Glam", price: 1050, desc: "4-hour minimum · premium props · B&W + color modes · two custom templates" }
  ];

  const ADDONS = [
    { id: "welcome-screen", name: "Custom Welcome / Tap-to-Start Screen", price: 50, desc: "Custom welcome screen guests see before their first photo" },
    { id: "rear-display", name: "Custom Rear Display / Branded Visuals", price: 50, desc: "Looping slideshow or branded visual on the back of the booth" },
    { id: "custom-template", name: "Custom Photo Template", price: 100, desc: "One-of-a-kind photo strip layout designed around your event" },
    { id: "additional-template", name: "Additional Custom Photo Template", price: 150, desc: "A second unique template design for the same event" },
    { id: "bw-color-filter", name: "B&W + Color Filter Set", price: 100, desc: "Switch between modes at the booth, all night" },
    { id: "glam-filter", name: "Glam Filter", price: 150, desc: "Real-time skin-smoothing filter — softens blemishes, evens tone, whitens teeth" },
    { id: "postcard-print", name: "Postcard Print Upgrade (4×6)", price: 50, desc: "Larger, glossier, designed to be kept" },
    { id: "premium-props", name: "Premium Prop Bundle", price: 50, desc: "Upgraded set of curated, on-trend, photogenic props" },
    { id: "premium-backdrop", name: "Premium Backdrop", price: 50, desc: "An upgrade from our standard library" },
    { id: "extra-time", name: "Extra Time", price: 150, desc: "Keep the energy going — add hours so nothing goes uncaptured" },
    { id: "early-setup", name: "Early Setup", price: 100, desc: "Get us on-site earlier than our standard 60–90 minute window" }
  ];
  // CMS:INQUIRY_DATA:END

  const esc = (s) => String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const packageOptions = PACKAGES.map(p =>
    `<option value="${esc(p.name)}" data-pkg-id="${p.id}" data-pkg-price="${p.price}" data-pkg-desc="${esc(p.desc)}">${esc(p.name)}</option>`
  ).join("\n            ");

  const addonCheckboxes = ADDONS.map(a =>
    `<label><input type="checkbox" name="interestedAddons" value="${esc(a.name)}" data-addon-id="${a.id}" data-addon-price="${a.price}" data-addon-desc="${esc(a.desc)}" /> ${esc(a.name)}</label>`
  ).join("\n          ");

  placeholder.outerHTML = `
<section class="section inquiry" id="inquiry">
  <div class="container container--narrow">
    <div class="inquiry__intro reveal">
      <span class="eyebrow">Tell us about your event</span>
      <h2 class="display">Request a quote.</h2>
      <p class="lede">Share a few details below and we'll respond within one business day with availability and a tailored estimate. Anything you check or pick here also updates your Package List — the two stay in sync.</p>
    </div>

    <div class="inquiry-cart-summary reveal" data-inquiry-summary>
      <h4>Your Package List</h4>
      <p style="margin:0;font-size:0.95rem;color:var(--bark);">Loading…</p>
    </div>

    <form class="form reveal" data-inquiry-form autocomplete="on" novalidate>

      <div class="form__row form__row--2">
        <div class="form__field">
          <label class="form__label" for="name">Your Name *</label>
          <input class="form__input" type="text" id="name" name="name" required autocomplete="name" />
        </div>
        <div class="form__field">
          <label class="form__label" for="email">Email *</label>
          <input class="form__input" type="email" id="email" name="email" required autocomplete="email" />
        </div>
      </div>

      <div class="form__row form__row--2">
        <div class="form__field">
          <label class="form__label" for="phone">Phone *</label>
          <input class="form__input" type="tel" id="phone" name="phone" required autocomplete="tel" inputmode="tel" placeholder="(XXX) XXX-XXXX" maxlength="14" />
        </div>
        <div class="form__field">
          <label class="form__label" for="eventDate">Event Date <span style="text-transform:none;letter-spacing:0;color:var(--bark);font-weight:400;font-size:0.85rem;">(MM/DD/YYYY)</span> *</label>
          <input class="form__input" type="date" id="eventDate" name="eventDate" required />
        </div>
      </div>

      <div class="form__row form__row--2">
        <div class="form__field">
          <label class="form__label" for="eventStartTime">Event Start Time <span style="text-transform:none;letter-spacing:0;color:var(--bark);font-weight:400;font-size:0.85rem;">(PST · Los Angeles)</span></label>
          <input class="form__input" type="time" id="eventStartTime" name="eventStartTime" />
        </div>
        <div class="form__field">
          <label class="form__label" for="eventType">Event Type *</label>
          <select class="form__select" id="eventType" name="eventType" required>
            <option value="">Select one…</option>
            <option>Wedding</option>
            <option>Birthday</option>
            <option>Baby Shower</option>
            <option>Holiday Party</option>
            <option>Corporate</option>
            <option>Brand Activation</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div class="form__row form__row--2">
        <div class="form__field">
          <label class="form__label" for="venueCity">Venue City *</label>
          <input class="form__input" type="text" id="venueCity" name="venueCity" required autocomplete="address-level2" />
        </div>
        <div class="form__field">
          <label class="form__label" for="guests">Estimated Guest Count</label>
          <select class="form__select" id="guests" name="guests">
            <option value="">Select one…</option>
            <option value="50 & below">50 &amp; below</option>
            <option value="51 - 100">51 – 100</option>
            <option value="101 - 300">101 – 300</option>
            <option value="300 & above">300 &amp; above</option>
          </select>
        </div>
      </div>

      <div class="form__field">
        <label class="form__label" for="venueAddress">Venue Full Address <span style="text-transform:none;letter-spacing:0;color:var(--bark);font-weight:400;font-size:0.85rem;">(if known)</span></label>
        <input class="form__input" type="text" id="venueAddress" name="venueAddress" autocomplete="street-address" />
      </div>

      <div class="form__row form__row--2">
        <div class="form__field">
          <label class="form__label" for="packageInterest">Package You're Considering</label>
          <select class="form__select" id="packageInterest" name="packageInterest">
            <option value="">Select one…</option>
            ${packageOptions}
            <option value="Not sure yet">Not sure yet</option>
          </select>
        </div>
        <div class="form__field">
          <label class="form__label" for="aesthetic">Aesthetic / Vibe</label>
          <select class="form__select" id="aesthetic" name="aesthetic">
            <option value="">Select one…</option>
            <option>Modern</option>
            <option>Boho</option>
            <option>Classic</option>
            <option>Moody</option>
            <option>Editorial</option>
            <option>Playful</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div class="form__field">
        <label class="form__label">Add-Ons That Caught Your Eye</label>
        <div class="checkbox-grid">
          ${addonCheckboxes}
        </div>
      </div>

      <div class="form__field">
        <label class="form__label" for="referral">How Did You Hear About Us?</label>
        <input class="form__input" type="text" id="referral" name="referral" placeholder="Instagram, friend, venue, Google…" />
      </div>

      <div class="form__field">
        <label class="form__label" for="message">Tell Us About Your Event</label>
        <textarea class="form__textarea" id="message" name="message" placeholder="Theme, schedule, special requests…"></textarea>
      </div>

      <input type="hidden" name="selectedPackage" data-hidden-package value="" />
      <input type="hidden" name="selectedAddons" data-hidden-addons value="" />
      <input type="hidden" name="estimatedTotal" data-hidden-total value="" />

      <div class="form__error" role="alert"></div>
      <div class="form__success" role="status">
        Thank you — we've received your inquiry. Expect a reply within one business day.
      </div>

      <div>
        <button type="submit" class="btn btn--primary">Send Inquiry</button>
        <p class="form__help" style="margin-top: var(--space-sm);">By submitting, you agree to our <a href="/privacy-policy">Privacy Policy</a>.</p>
      </div>
    </form>
  </div>
</section>`;
})();
