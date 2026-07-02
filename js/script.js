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
    const setNav = open => {
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", e => {
      e.stopPropagation();
      setNav(!menu.classList.contains("is-open"));
    });
    menu.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => setNav(false));
    });
    // Tap the dimmed scrim (anywhere outside the drawer) to close.
    document.addEventListener("click", e => {
      if (menu.classList.contains("is-open") && !menu.contains(e.target) && !toggle.contains(e.target)) {
        setNav(false);
      }
    });
    // Swipe right on the drawer to collapse it back off-screen.
    let swipeX = 0, swipeY = 0;
    menu.addEventListener("touchstart", e => {
      swipeX = e.touches[0].clientX;
      swipeY = e.touches[0].clientY;
    }, { passive: true });
    menu.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - swipeX;
      const dy = e.changedTouches[0].clientY - swipeY;
      if (dx > 50 && Math.abs(dx) > Math.abs(dy)) setNav(false);
    }, { passive: true });
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

  /* --- Testimonial carousel (crossfade, manual + auto-advance) ---
     Fades between client quotes. Arrows step prev/next and wrap around.
     Auto-advances every 7s; pauses on hover/focus. Honors reduced-motion. */
  document.querySelectorAll("[data-testimonial-carousel]").forEach(root => {
    const slides = Array.from(root.querySelectorAll("[data-testimonial-slide]"));
    if (slides.length < 2) return;

    const AUTO_MS = 7000;
    let index = slides.findIndex(s => s.classList.contains("is-active"));
    if (index < 0) index = 0;
    let timer = null;

    const show = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, n) => slide.classList.toggle("is-active", n === index));
    };
    const next = () => show(index + 1);
    const prev = () => show(index - 1);

    const start = () => { if (!timer) timer = setInterval(next, AUTO_MS); };
    const stop = () => { clearInterval(timer); timer = null; };
    const reset = () => { stop(); start(); };

    root.querySelector("[data-testimonial-next]")?.addEventListener("click", () => { next(); reset(); });
    root.querySelector("[data-testimonial-prev]")?.addEventListener("click", () => { prev(); reset(); });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", () => { document.hidden ? stop() : start(); });

    start();
  });

  /* --- The Booth spec accordion ---
     Hover-to-open is handled in CSS. Clicking a header toggles .is-open to
     pin it open (and keeps it open after the pointer leaves). */
  document.querySelectorAll("[data-spec-accordion]").forEach(acc => {
    acc.querySelectorAll("[data-spec-toggle]").forEach(btn => {
      btn.addEventListener("click", () => {
        const spec = btn.closest(".booth-spec");
        const open = spec.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
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

    /* ===== 4-step stepper controller =====
       Step 1 (Contact) is captured to the backend on first "Next" — the API
       creates a partial row and returns its id. Each subsequent Next PATCHes
       that same row; final Submit flips it to completed + emails the team.
       The row id persists in sessionStorage so a mid-flow refresh continues
       the same record instead of orphaning a new one. */
    const TOTAL = 4;
    const ID_KEY = "evergrain-inquiry-id";
    const errorEl = form.querySelector(".form__error");
    const successEl = form.querySelector(".form__success");
    const steps = Array.from(form.querySelectorAll(".form-step"));
    const dots = Array.from(form.querySelectorAll("[data-step-dot]"));
    const stepperEl = form.querySelector("[data-stepper]");
    const navEl = form.querySelector("[data-step-nav]");
    const backBtn = form.querySelector("[data-step-back]");
    const nextBtn = form.querySelector("[data-step-next]");
    const submitBtn = form.querySelector("[data-step-submit]");

    let current = 1;
    let inquiryId = null;
    try { inquiryId = sessionStorage.getItem(ID_KEY) || null; } catch {}

    const STEP_REQUIRED = {
      1: [["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["eventType", "Event Type"]],
      2: [],
      3: [["packageInterest", "Package You're Considering"]],
      4: [],
    };

    const showErr = (msg) => {
      if (!errorEl) return;
      errorEl.textContent = msg;
      errorEl.classList.add("is-visible");
    };
    const clearErr = () => errorEl?.classList.remove("is-visible");

    const collect = () => {
      const fd = new FormData(form);
      const d = Object.fromEntries(fd.entries());
      d.interestedAddons = fd.getAll("interestedAddons");
      d.sourcePage = location.pathname; // which page the inquiry came from (invisible tracker)
      return d;
    };

    function validateStep(n) {
      clearErr();
      const d = collect();
      const miss = (STEP_REQUIRED[n] || []).filter(([k]) => !d[k]).map(([, l]) => l);
      if (miss.length) { showErr(`Please fill in: ${miss.join(", ")}.`); return false; }
      if (n === 1) {
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email || "")) { showErr("Please enter a valid email address."); return false; }
        if ((d.phone || "").replace(/\D/g, "").length !== 10) { showErr("Phone number must be 10 digits — please double-check."); return false; }
      }
      return true;
    }

    function showStep(n) {
      current = n;
      steps.forEach(fs => {
        const s = Number(fs.dataset.step);
        fs.hidden = s !== n;
        fs.classList.toggle("is-active", s === n);
      });
      dots.forEach(d => {
        const s = Number(d.dataset.stepDot);
        d.classList.toggle("is-active", s === n);
        d.classList.toggle("is-done", s < n);
      });
      if (backBtn) backBtn.hidden = n === 1;
      if (nextBtn) nextBtn.hidden = n === TOTAL;
      if (submitBtn) submitBtn.hidden = n !== TOTAL;
    }

    // POST to the inquiry endpoint. step = furthest step reached; isFinal flips completed.
    async function postInquiry(step, isFinal) {
      const data = collect();
      data.step = step;
      data.partial = !isFinal;
      if (inquiryId) data.id = inquiryId;
      const resp = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!resp.ok) {
        const b = await resp.json().catch(() => ({}));
        throw new Error(b.error || "Save failed");
      }
      const body = await resp.json().catch(() => ({}));
      if (body.id) {
        inquiryId = body.id;
        try { sessionStorage.setItem(ID_KEY, body.id); } catch {}
      }
      return body;
    }

    // ---- Next: validate → capture partial → advance ----
    nextBtn?.addEventListener("click", async () => {
      if (!validateStep(current)) return;
      nextBtn.disabled = true;
      const lbl = nextBtn.textContent;
      nextBtn.textContent = "Saving…";
      // Best-effort capture — never trap the user if the network hiccups;
      // the final submit will still create/complete the row.
      try { await postInquiry(Math.min(current + 1, TOTAL), false); } catch (err) { console.error(err); }
      nextBtn.disabled = false;
      nextBtn.textContent = lbl;
      showStep(Math.min(current + 1, TOTAL));
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    backBtn?.addEventListener("click", () => {
      clearErr();
      showStep(Math.max(current - 1, 1));
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // ---- Final submit: validate all gated steps → complete ----
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErr();
      successEl?.classList.remove("is-visible");
      // Re-check the required steps in case a field was cleared after advancing.
      if (!validateStep(1)) { showStep(1); form.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      if (!validateStep(3)) { showStep(3); form.scrollIntoView({ behavior: "smooth", block: "start" }); return; }

      const lbl = submitBtn?.textContent;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }
      try {
        await postInquiry(TOTAL, true);
        form.reset();
        inquiryId = null;
        try { sessionStorage.removeItem(ID_KEY); } catch {}
        // Collapse the stepper UI, reveal the success message.
        steps.forEach(fs => { fs.hidden = true; });
        stepperEl?.setAttribute("hidden", "");
        navEl?.setAttribute("hidden", "");
        successEl?.classList.add("is-visible");
        successEl?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (window.EvergrainCart) {
          window.EvergrainCart.renderInquirySummary();
          window.EvergrainCart.renderInquiryForm();
        }
      } catch (err) {
        console.error(err);
        showErr("Something went wrong sending your inquiry. Please try again, or email us directly.");
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = lbl || "Send Inquiry"; }
      }
    });

    showStep(1);
  }
});
