/* =========================================================
   Evergrain Photobooth — Main script
   Navbar scroll state, mobile toggle, FAQ, gallery filter,
   form handler, smooth-scroll niceties
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* --- Year stamp in footer --- */
  document.querySelectorAll("[data-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* --- Navbar scroll state --- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Mobile nav toggle --- */
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.querySelector(".nav__menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => menu.classList.remove("is-open"));
    });
  }

  /* --- Highlight active nav link (clean-URL aware) --- */
  // Normalize current path: strip .html, strip trailing /index, default to "/"
  let path = location.pathname.replace(/\.html$/, "").replace(/\/index$/, "");
  if (path === "") path = "/";
  document.querySelectorAll(".nav__link").forEach(link => {
    const href = link.getAttribute("href");
    if (href && href === path) link.classList.add("is-active");
  });

  /* --- FAQ: single-open accordion behaviour --- */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        faqItems.forEach(other => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* --- City carousel arrow controls --- */
  document.querySelectorAll("[data-carousel]").forEach(carousel => {
    const wrap = carousel.parentElement;
    const prev = wrap?.querySelector("[data-carousel-prev]");
    const next = wrap?.querySelector("[data-carousel-next]");
    const step = () => Math.min(carousel.clientWidth * 0.85, 420);
    prev?.addEventListener("click", () => carousel.scrollBy({ left: -step(), behavior: "smooth" }));
    next?.addEventListener("click", () => carousel.scrollBy({ left: step(), behavior: "smooth" }));
  });

  /* --- The Booth single-image carousel (infinite loop, auto-advance) ---
     Slides one image at a time, always sliding LEFT on auto-advance.
     Seamless infinite loop via cloned first/last slides. Auto-advances
     every 3s; pauses while the pointer is over the image; arrows give
     manual control (and reset the timer). Honors reduced-motion. */
  document.querySelectorAll("[data-booth-carousel]").forEach(root => {
    const track = root.querySelector("[data-booth-track]");
    if (!track) return;
    const slides = Array.from(track.children);
    if (slides.length < 2) return;

    const AUTO_MS = 3000;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Clone last → prepend, first → append, for seamless wrap in both directions.
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");
    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    const real = slides.length;          // count of real slides
    let pos = 1;                          // index in the padded track (1 = first real slide)
    let animating = false;
    let timer = null;
    let hovering = false;

    const setX = (animate) => {
      track.style.transition = animate && !reduceMotion ? "" : "none";
      track.style.transform = `translateX(${-pos * 100}%)`;
    };
    setX(false); // start on first real slide without animation

    const go = (delta) => {
      if (animating) return;
      animating = true;
      pos += delta;
      setX(true);
    };
    const next = () => go(1);
    const prev = () => go(-1);

    track.addEventListener("transitionend", () => {
      // After landing on a clone, jump (no animation) to the matching real slide.
      if (pos === real + 1) { pos = 1; setX(false); }       // past last → first real
      else if (pos === 0) { pos = real; setX(false); }       // before first → last real
      animating = false;
    });

    // --- Auto-advance ---
    const start = () => {
      if (reduceMotion || timer || hovering) return;
      timer = setInterval(next, AUTO_MS);
    };
    const stop = () => { clearInterval(timer); timer = null; };
    // Reset the timer's phase after a manual nav — but stay paused if hovering.
    const resetTimer = () => { stop(); start(); };

    // Pause on hover (and keyboard focus, for parity)
    root.addEventListener("mouseenter", () => { hovering = true; stop(); });
    root.addEventListener("mouseleave", () => { hovering = false; start(); });
    root.addEventListener("focusin", () => { hovering = true; stop(); });
    root.addEventListener("focusout", () => { hovering = false; start(); });

    // Arrows: manual control resets the auto timer (start() no-ops while hovering)
    root.querySelector("[data-booth-next]")?.addEventListener("click", () => { next(); resetTimer(); });
    root.querySelector("[data-booth-prev]")?.addEventListener("click", () => { prev(); resetTimer(); });

    // Pause when the tab is hidden; resume when visible
    document.addEventListener("visibilitychange", () => {
      document.hidden ? stop() : start();
    });

    start();
  });

  /* --- Gallery filtering --- */
  const filterPills = document.querySelectorAll(".filter-pill");
  const galleryItems = document.querySelectorAll(".gallery__item");
  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      const cat = pill.getAttribute("data-filter");
      galleryItems.forEach(item => {
        const itemCat = item.getAttribute("data-category");
        const show = cat === "all" || itemCat === cat;
        item.style.display = show ? "" : "none";
      });
    });
  });

  /* --- Inquiry form handler ---
     POSTs to /api/inquiry (Vercel serverless function) which writes to
     Supabase and emails the team via Resend.
  */
  const form = document.querySelector("[data-inquiry-form]");
  if (form) {
    // Live phone formatter — strips non-digits, caps at 10, formats as (XXX) XXX-XXXX
    const phoneInput = form.querySelector("[name='phone']");
    if (phoneInput) {
      const formatPhone = (raw) => {
        const d = raw.replace(/\D/g, "").slice(0, 10);
        if (!d) return "";
        if (d.length <= 3) return `(${d}`;
        if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
        return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
      };
      phoneInput.addEventListener("input", e => {
        e.target.value = formatPhone(e.target.value);
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const successEl = form.querySelector(".form__success");
      const errorEl = form.querySelector(".form__error");
      const submitBtn = form.querySelector("button[type='submit']");
      errorEl?.classList.remove("is-visible");
      successEl?.classList.remove("is-visible");

      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());
      // Multi-value: collect every checked add-on as an array
      data.interestedAddons = fd.getAll("interestedAddons");

      // Required field validation (matches asterisks in the form)
      const required = [
        ["name", "Your Name"],
        ["email", "Email"],
        ["phone", "Phone"],
        ["eventDate", "Event Date"],
        ["eventType", "Event Type"],
        ["venueCity", "Venue City"]
      ];
      const missing = required.filter(([k]) => !data[k]).map(([, l]) => l);
      if (missing.length) {
        errorEl.textContent = `Please fill in: ${missing.join(", ")}.`;
        errorEl.classList.add("is-visible");
        return;
      }

      // Phone must be 10 digits (formatted by the live formatter)
      const phoneDigits = (data.phone || "").replace(/\D/g, "");
      if (phoneDigits.length !== 10) {
        errorEl.textContent = "Phone number must be 10 digits — please double-check.";
        errorEl.classList.add("is-visible");
        return;
      }

      // Submit
      const originalLabel = submitBtn?.textContent;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      try {
        const resp = await fetch("/api/inquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          throw new Error(body.error || "Submission failed");
        }

        form.reset();
        successEl?.classList.add("is-visible");
        successEl?.scrollIntoView({ behavior: "smooth", block: "center" });
        // Re-render cart-summary block + form sync after reset
        if (window.EvergrainCart) {
          window.EvergrainCart.renderInquirySummary();
          window.EvergrainCart.renderInquiryForm();
        }
      } catch (err) {
        console.error(err);
        errorEl.textContent = "Something went wrong sending your inquiry. Please try again, or email us directly.";
        errorEl.classList.add("is-visible");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel || "Send Inquiry";
        }
      }
    });
  }
});
