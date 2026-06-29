/* =========================================================
   Gallery — loads every photo in the Supabase
   media/images/gallery/ folder at runtime, ordered by the
   leading number in each filename (1., 2., 3., …).

   Drop a new photo into that folder in Supabase and it shows
   up here automatically — no code changes needed.

   The key below is the public "anon" key; it's safe to expose
   and is scoped (by a storage policy) to listing the gallery
   folder only.
   ========================================================= */
(function () {
  const grid = document.querySelector("[data-gallery-grid]");
  if (!grid) return;

  const SUPABASE_URL = "https://zjwobaopuhanqsyyilzb.supabase.co";
  const ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqd29iYW9wdWhhbnFzeXlpbHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NDk5NzUsImV4cCI6MjA5NTMyNTk3NX0.lsrtSS8XI4w2MSEnTY3k03Wi9V8xPFc3MIu40mBLyC0";
  const BUCKET = "media";
  const PREFIX = "images/gallery/";

  const path = (name) => PREFIX + encodeURIComponent(name);
  const fullUrl = (name) =>
    `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path(name)}`;
  // Resized + compressed thumbnail cropped to the grid's 6:4 (landscape) cell
  // (≈60–120 KB vs multi-MB). The full photo opens on click.
  const thumbUrl = (name) =>
    `${SUPABASE_URL}/storage/v1/render/image/public/${BUCKET}/${path(name)}?width=1200&height=800&resize=cover&quality=72`;
  // "1. Austins_1st_birthday.jpg" -> "Austins 1st birthday"
  const label = (name) =>
    name.replace(/^\d+\.\s*/, "").replace(/\.[^.]+$/, "").replace(/_/g, " ").trim();

  async function load() {
    let files = [];
    try {
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
      const items = await res.json();
      files = items
        .filter((o) => o && o.id && /\.(jpe?g|png|webp|gif|avif)$/i.test(o.name))
        .sort(
          (a, b) =>
            (parseInt(a.name, 10) || 0) - (parseInt(b.name, 10) || 0) ||
            a.name.localeCompare(b.name)
        );
    } catch (err) {
      grid.removeAttribute("aria-busy");
      return; // fail quietly — leave the grid empty
    }

    grid.innerHTML = files
      .map((f) => {
        const alt = label(f.name);
        return `<a href="${fullUrl(f.name)}" class="gallery__item" target="_blank" rel="noopener"><img src="${thumbUrl(f.name)}" alt="${alt}" loading="lazy" /></a>`;
      })
      .join("");
    grid.removeAttribute("aria-busy");
  }

  load();
})();
