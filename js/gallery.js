/* =========================================================
   Gallery — loads every photo in the Supabase
   media/images/gallery/ folder at runtime.

   Two groups, split by filename:
   • Print strips named "…_2x6_N" / "…_4x6_N" render in a
     single justified row at the top (all 2x6 first, then all
     4x6, each in index order, left → right).
   • Everything else is a regular event photo in the 3-up grid
     below, ordered by its leading number ("1.", "2.", …).

   Drop a new photo into the folder and it appears automatically.

   The key below is the public "anon" key; it's safe to expose
   and is scoped (by a storage policy) to listing this folder.
   ========================================================= */
(function () {
  const grid = document.querySelector("[data-gallery-grid]");
  if (!grid) return;
  const stripsRow = document.querySelector("[data-strips-row]");

  const SUPABASE_URL = "https://zjwobaopuhanqsyyilzb.supabase.co";
  const ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqd29iYW9wdWhhbnFzeXlpbHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NDk5NzUsImV4cCI6MjA5NTMyNTk3NX0.lsrtSS8XI4w2MSEnTY3k03Wi9V8xPFc3MIu40mBLyC0";
  const BUCKET = "media";
  const PREFIX = "images/gallery/";

  const path = (name) => PREFIX + encodeURIComponent(name);
  // Resized + compressed thumbnail cropped to the given w×h (≈60–150 KB).
  const thumb = (name, w, h) =>
    `${SUPABASE_URL}/storage/v1/render/image/public/${BUCKET}/${path(name)}?width=${w}&height=${h}&resize=cover&quality=72`;
  // Filename -> readable alt text (strip number/format suffixes + extension).
  const label = (name) =>
    name
      .replace(/^\d+\.\s*/, "")
      .replace(/_?[24]x6_\d+/i, "")
      .replace(/\.[^.]+$/, "")
      .replace(/_/g, " ")
      .trim();

  async function listFiles() {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
      method: "POST",
      headers: {
        apikey: ANON_KEY,
        Authorization: "Bearer " + ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prefix: PREFIX,
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
      }),
    });
    if (!res.ok) throw new Error("Gallery list failed: " + res.status);
    return (await res.json()).filter(
      (o) => o && o.id && /\.(jpe?g|png|webp|gif|avif)$/i.test(o.name)
    );
  }

  async function load() {
    let files;
    try {
      files = await listFiles();
    } catch (err) {
      grid.removeAttribute("aria-busy");
      return; // fail quietly — leave the grid empty
    }

    const strips = []; // 2x6 / 4x6 print strips (top row)
    const photos = []; // regular event photos (grid)
    for (const f of files) {
      const m = f.name.match(/([24])x6_(\d+)/i);
      if (m) strips.push({ name: f.name, format: Number(m[1]), index: Number(m[2]) });
      else photos.push(f);
    }

    // Top row: all 2x6 first, then all 4x6, each in index order.
    strips.sort((a, b) => a.format - b.format || a.index - b.index);
    // Grid: by leading number.
    photos.sort(
      (a, b) =>
        (parseInt(a.name, 10) || 0) - (parseInt(b.name, 10) || 0) ||
        a.name.localeCompare(b.name)
    );

    if (stripsRow) {
      stripsRow.innerHTML = strips
        .map((s) => {
          const [w, h] = s.format === 2 ? [400, 1200] : [600, 900]; // 2:6 or 4:6
          return `<div class="strips-row__item strips-row__item--${s.format}x6"><img src="${thumb(s.name, w, h)}" alt="${label(s.name)}" loading="lazy" /></div>`;
        })
        .join("");
    }

    grid.innerHTML = photos
      .map(
        (f) =>
          `<div class="gallery__item"><img src="${thumb(f.name, 1200, 800)}" alt="${label(f.name)}" loading="lazy" /></div>`
      )
      .join("");
    grid.removeAttribute("aria-busy");
  }

  load();
})();
