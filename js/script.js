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
