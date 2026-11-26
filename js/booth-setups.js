/* =========================================================
   The Booth — "A few past setups" auto-scrolling marquee.

   Lists the Supabase media/images/the booth/ folder, keeps the
   "A few past setup…" photos, SHUFFLES them (fresh order every
   page load), and renders a seamless looping marquee. Drop new
   "A few past setup…" photos into that folder and they appear
   automatically — no code change.

   Motion pauses while hovered (mouse) or touched (finger). If the
   folder can't be listed yet (storage policy), it falls back to
   the known photos so the strip is never empty.
   ========================================================= */
(function () {
  const mount = document.querySelector("[data-setups-marquee]");
  if (!mount) return;

  const R2 = "https://pub-09ff8dfde6ef4e79bf4d6b9a00d6737d.r2.dev";

  // Shown only if listing is blocked/empty (so the strip is never empty).
  const FALLBACK = [
    "A few past setup_booth_1.jpg",
    "A few past setup_wedding_2.jpg",
    "A few past setup_babyshower_3.jpg",
    "A few past setup_birthday_4.jpg",
    "A few past setup_birthday_5.jpg",
  ];

  // Pre-generated thumbnails live in R2 under thumbs/booth/<file>
  // (pixel-identical to the former Supabase on-the-fly render).
  const thumb = (name) => `${R2}/thumbs/booth/${encodeURIComponent(name)}`;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  async function listNames() {
    try {
      const res = await fetch("/js/data/media-manifest.json", { cache: "no-cache" });
      if (!res.ok) return null;
      const names = ((await res.json()).booth || [])
        .filter((n) => /\.(jpe?g|png|webp)$/i.test(n));
      return names.length ? names : null;
    } catch (e) {
      return null;
    }
  }

  function render(names) {
    const shuffled = shuffle(names);
    const item = (n) =>
      `<div class="setups-marquee__item"><img src="${thumb(n)}" alt="The Evergrain booth at a past event" loading="lazy" /></div>`;
    const one = shuffled.map(item).join("");
    // Two copies → seamless -50% loop.
    mount.innerHTML = `<div class="setups-marquee__track" data-setups-track>${one}${one}</div>`;

    const track = mount.querySelector("[data-setups-track]");
    // ~5s per photo keeps the scroll speed consistent regardless of count.
    track.style.animationDuration = Math.max(24, shuffled.length * 5) + "s";

    // Pause while a finger is held down (mobile) — mouse hover is handled in CSS.
    const pause = () => mount.classList.add("is-paused");
    const resume = () => mount.classList.remove("is-paused");
    mount.addEventListener("touchstart", pause, { passive: true });
    mount.addEventListener("touchend", resume, { passive: true });
    mount.addEventListener("touchcancel", resume, { passive: true });
  }

  (async () => {
    const names = (await listNames()) || FALLBACK;
    render(names);
  })();
})();
