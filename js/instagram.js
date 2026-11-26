/* =========================================================
   Homepage "Find us on Instagram" carousel.

   Loads media from the Supabase media/images/instagram/ folder.
   Name each file after its Instagram shortcode — the part after
   /p/ or /reel/ in the post URL, e.g. a post at
   instagram.com/p/C8xYabc123/ becomes "C8xYabc123.mp4" (video)
   or "C8xYabc123.jpg" (image). Drop new posts in and they show
   automatically, newest upload first.

   • Videos autoplay (muted) while hovered, pause + reset on leave.
   • Every card links out to its Instagram post in a new tab.
   • The whole section stays hidden until at least one post exists.

   The key below is the public "anon" key; it's safe to expose and
   is scoped (by a storage policy) to listing this folder.
   ========================================================= */
(function () {
  const section = document.querySelector("[data-ig-section]");
  const track = section && section.querySelector("[data-ig-track]");
  if (!section || !track) return;

  const R2 = "https://pub-09ff8dfde6ef4e79bf4d6b9a00d6737d.r2.dev";
  const VIDEO = /\.(mp4|webm|mov|m4v)$/i;
  const IMAGE = /\.(jpe?g|png|webp|avif)$/i;

  // Videos stream from R2 originals; image posts (if any) use an R2 thumbnail.
  const objectUrl = (name) =>
    `${R2}/images/instagram/${encodeURIComponent(name)}`;
  const imgThumb = (name) =>
    `${R2}/thumbs/instagram/${encodeURIComponent(name)}`;
  // Files are named "<order>. <shortcode>.<ext>" (e.g. "4. DbrlVuqvuU8.mp4");
  // the order number sorts them, the shortcode links to the post. "/p/" works
  // for both feed posts and reels. Bare "<shortcode>.<ext>" is also supported.
  const orderOf = (name) => { const m = name.match(/^\s*(\d+)\s*[.\-_)]/); return m ? Number(m[1]) : -1; };
  const shortcode = (name) => name.replace(/^\s*\d+\s*[.\-_)]\s*/, "").replace(/\.[^.]+$/, "").trim();
  const postUrl = (name) => `https://www.instagram.com/p/${encodeURIComponent(shortcode(name))}/`;

  const BADGE =
    '<svg class="ig-card__badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>';

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  async function listFiles() {
    const res = await fetch("/js/data/media-manifest.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("Instagram list failed: " + res.status);
    return ((await res.json()).instagram || [])
      .filter((n) => VIDEO.test(n) || IMAGE.test(n));
  }

  const card = (name) => {
    const media = VIDEO.test(name)
      ? `<video class="ig-card__media" src="${objectUrl(name)}" muted loop playsinline preload="metadata"></video>`
      : `<img class="ig-card__media" src="${imgThumb(name)}" alt="Evergrain Photobooth on Instagram" loading="lazy" />`;
    return `<a class="ig-card" href="${postUrl(name)}" target="_blank" rel="noopener noreferrer" aria-label="View this post on Instagram">${media}${BADGE}</a>`;
  };

  (async () => {
    let files;
    try {
      files = await listFiles();
    } catch (e) {
      return; // stays hidden
    }
    if (!files.length) return;

    // Latest first (highest leading number on the left → oldest on the right).
    // Files without a number fall back to newest-upload order (already applied
    // by the list sort), and sit after the numbered ones.
    files.sort((a, b) => orderOf(b) - orderOf(a));

    track.innerHTML = files.map(card).join("");
    section.hidden = false;

    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (isTouch && !reduceMotion) {
      // Mobile: autoplay visible videos via IntersectionObserver.
      // Mobile Safari allows muted+playsinline videos to autoplay.
      track.querySelectorAll("video").forEach((v) => v.setAttribute("autoplay", ""));
      const io = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          const v = target.querySelector("video");
          if (!v) return;
          if (isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      }, { threshold: 0.2 });
      track.querySelectorAll(".ig-card").forEach((c) => io.observe(c));
    } else if (!reduceMotion) {
      // Desktop: play on hover, pause + reset on leave.
      track.querySelectorAll(".ig-card").forEach((a) => {
        const v = a.querySelector("video");
        if (!v) return;
        a.addEventListener("mouseenter", () => { v.play().catch(() => {}); });
        a.addEventListener("mouseleave", () => { v.pause(); try { v.currentTime = 0; } catch (_) {} });
      });
    }

    // Prev / next arrows — hidden at each end and when it all fits.
    const prev = section.querySelector("[data-ig-prev]");
    const next = section.querySelector("[data-ig-next]");
    const step = () => Math.min(track.clientWidth * 0.8, 620);
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    const update = () => {
      const overflow = track.scrollWidth - track.clientWidth > 4;
      prev.disabled = !overflow || track.scrollLeft <= 1;
      next.disabled = !overflow || track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    };
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    setTimeout(update, 300);
  })();
})();
