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

  const SUPABASE_URL = "https://zjwobaopuhanqsyyilzb.supabase.co";
  const ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqd29iYW9wdWhhbnFzeXlpbHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NDk5NzUsImV4cCI6MjA5NTMyNTk3NX0.lsrtSS8XI4w2MSEnTY3k03Wi9V8xPFc3MIu40mBLyC0";
  const BUCKET = "media";
  const FOLDER = "images/the booth/";
  const MATCH = /a few past setup/i;

  // Shown only if listing is blocked/empty (so the strip is never empty).
  const FALLBACK = [
    "A few past setup_booth_1.jpg",
    "A few past setup_wedding_2.jpg",
    "A few past setup_babyshower_3.jpg",
    "A few past setup_birthday_4.jpg",
    "A few past setup_birthday_5.jpg",
  ];

  const thumb = (name) =>
    `${SUPABASE_URL}/storage/v1/render/image/public/${BUCKET}/${encodeURI(FOLDER)}${encodeURIComponent(name)}?width=700&height=875&resize=cover&quality=72`;

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
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
        method: "POST",
        headers: {
          apikey: ANON_KEY,
          Authorization: "Bearer " + ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prefix: FOLDER, limit: 1000, sortBy: { column: "name", order: "asc" } }),
      });
      if (!res.ok) return null;
      const items = await res.json();
      const names = items
        .filter((o) => o && o.id && /\.(jpe?g|png|webp)$/i.test(o.name) && MATCH.test(o.name))
        .map((o) => o.name);
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
