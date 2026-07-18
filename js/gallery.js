/* =========================================================
   Gallery — three auto-scrolling rows, one per print size,
   loaded from the Supabase media/images/gallery/ folder.

   Filenames follow  <size>_<name>_<index>.<ext>  e.g.
   "2x6_wine_o_clock_2.jpg", "6x4_Family_4.jpg".

   • Row 1 — every 2x6 file
   • Row 2 — every 4x6 file
   • Row 3 — every 6x4 file, split across two stacked rows

   Each row is a seamless marquee that pauses while hovered.
   Photos are ordered by their trailing index with the NEWEST
   (highest index) on the LEFT, so dropping in a higher-numbered
   photo makes it appear first — no code change.

   The key below is the public "anon" key; it's safe to expose
   and is scoped (by a storage policy) to listing this folder.
   ========================================================= */
(function () {
  const mount = document.querySelector("[data-gallery-marquees]");
  if (!mount) return;

  const SUPABASE_URL = "https://zjwobaopuhanqsyyilzb.supabase.co";
  const ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqd29iYW9wdWhhbnFzeXlpbHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NDk5NzUsImV4cCI6MjA5NTMyNTk3NX0.lsrtSS8XI4w2MSEnTY3k03Wi9V8xPFc3MIu40mBLyC0";
  const BUCKET = "media";
  const PREFIX = "images/gallery/";

  // Render a whole (uncropped) thumbnail that fits within w×h.
  const thumb = (name, w, h) =>
    `${SUPABASE_URL}/storage/v1/render/image/public/${BUCKET}/${PREFIX}${encodeURIComponent(
      name
    )}?width=${w}&height=${h}&resize=contain&quality=76`;

  // "6x4_Dominic's_1st_birthday_6.jpg" -> "Dominic's 1st birthday"
  const label = (name) =>
    name
      .replace(/^\d+x\d+_/i, "")
      .replace(/_\d+\.[^.]+$/, "")
      .replace(/_/g, " ")
      .trim();

  // -> { name, fmt: "2x6", index: 6 } or null
  const parse = (name) => {
    const m = name.match(/^(\d+x\d+)_.*?_(\d+)\.[^.]+$/i);
    return m ? { name, fmt: m[1].toLowerCase(), index: Number(m[2]) } : null;
  };

  async function listFiles() {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
      method: "POST",
      headers: {
        apikey: ANON_KEY,
        Authorization: "Bearer " + ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefix: PREFIX, limit: 1000, sortBy: { column: "name", order: "asc" } }),
    });
    if (!res.ok) throw new Error("Gallery list failed: " + res.status);
    return (await res.json())
      .filter((o) => o && o.id && /\.(jpe?g|png|webp|avif)$/i.test(o.name))
      .map((o) => o.name);
  }

  const itemHTML = (it, w, h) =>
    `<figure class="gal-item"><img src="${thumb(it.name, w, h)}" alt="${label(
      it.name
    )}" loading="lazy" decoding="async" draggable="false" /></figure>`;

  // Render one row: each photo once, in a scroll container with prev/next
  // arrows. Arrows fade out at the ends and hide entirely if it all fits.
  function renderRow(el, items, w, h) {
    if (!el) return;
    if (!items.length) {
      el.style.display = "none";
      return;
    }
    const itemsHTML = items.map((it) => itemHTML(it, w, h)).join("");
    el.innerHTML =
      '<button type="button" class="gal-row__arrow gal-row__arrow--prev" aria-label="Scroll left">←</button>' +
      `<div class="gal-row__track">${itemsHTML}</div>` +
      '<button type="button" class="gal-row__arrow gal-row__arrow--next" aria-label="Scroll right">→</button>';

    const track = el.querySelector(".gal-row__track");
    const prev = el.querySelector(".gal-row__arrow--prev");
    const next = el.querySelector(".gal-row__arrow--next");
    const step = () => Math.min(track.clientWidth * 0.8, 600);
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));

    const update = () => {
      const overflow = track.scrollWidth - track.clientWidth > 4;
      prev.disabled = !overflow || track.scrollLeft <= 1;
      next.disabled = !overflow || track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    };
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // Re-check once images have laid out.
    update();
    setTimeout(update, 300);
  }

  (async () => {
    let files;
    try {
      files = await listFiles();
    } catch (err) {
      mount.removeAttribute("aria-busy");
      return; // fail quietly
    }

    const byFmt = { "2x6": [], "4x6": [], "6x4": [] };
    files.map(parse).forEach((p) => {
      if (p && byFmt[p.fmt]) byFmt[p.fmt].push(p);
    });
    // Newest (highest index) first → shows on the left.
    Object.values(byFmt).forEach((a) => a.sort((x, y) => y.index - x.index));

    renderRow(mount.querySelector('[data-gal-row="2x6"]'), byFmt["2x6"], 420, 1260); // 2:6
    renderRow(mount.querySelector('[data-gal-row="4x6"]'), byFmt["4x6"], 620, 930); //  4:6

    // 6x4 → two stacked rows, alternating so the newest sit on the left of both.
    const rowA = [];
    const rowB = [];
    byFmt["6x4"].forEach((p, i) => (i % 2 === 0 ? rowA : rowB).push(p));
    renderRow(mount.querySelector('[data-gal-row="6x4-a"]'), rowA, 900, 600); // 6:4
    renderRow(mount.querySelector('[data-gal-row="6x4-b"]'), rowB, 900, 600);

    mount.removeAttribute("aria-busy");
  })();
})();
