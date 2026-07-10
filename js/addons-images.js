/* =========================================================
   Add-Ons — pulls a photo for each add-on from the Supabase
   media/images/add-ons/ folder at runtime and drops it into
   the left of the matching card.

   Matching is by filename: name the image after the add-on's
   title (e.g. "Glam Filter.png", "Premium Backdrop.png") and
   it attaches to that card. Case, spaces, and punctuation are
   ignored. Drop a new image into the folder (or replace one)
   and it shows up on the next page load — no code change.

   The images are decorative only: not links, not draggable,
   not clickable.

   The key below is the public "anon" key; it's safe to expose
   and is scoped (by a storage policy) to listing this folder.
   ========================================================= */
(function () {
  const cards = document.querySelectorAll("article.addon[data-addon-card]");
  if (!cards.length) return;

  const SUPABASE_URL = "https://zjwobaopuhanqsyyilzb.supabase.co";
  const ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqd29iYW9wdWhhbnFzeXlpbHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NDk5NzUsImV4cCI6MjA5NTMyNTk3NX0.lsrtSS8XI4w2MSEnTY3k03Wi9V8xPFc3MIu40mBLyC0";
  const BUCKET = "media";
  const FOLDER = "images/add-ons/";

  // Normalize a title/filename to a comparable key: lowercase, no
  // punctuation or spaces. "Glam FIlter" and "glam-filter" both -> "glamfilter".
  const norm = (s) =>
    (s || "")
      .replace(/&amp;/gi, "&")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

  const thumb = (name) =>
    `${SUPABASE_URL}/storage/v1/render/image/public/${BUCKET}/${encodeURI(FOLDER)}${encodeURIComponent(
      name
    )}?width=440&height=440&resize=cover&quality=72`;

  async function listImages() {
    try {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
        method: "POST",
        headers: {
          apikey: ANON_KEY,
          Authorization: "Bearer " + ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prefix: FOLDER,
          limit: 1000,
          sortBy: { column: "name", order: "asc" },
        }),
      });
      if (!res.ok) return [];
      const items = await res.json();
      return items
        .filter((o) => o && o.id && /\.(jpe?g|png|webp|avif)$/i.test(o.name))
        .map((o) => o.name);
    } catch (e) {
      return [];
    }
  }

  // Move the card's existing content into a body wrapper and add the
  // image to its left. Idempotent — safe to run more than once.
  function attach(card, name) {
    if (card.querySelector(".addon__media")) return;

    const body = document.createElement("div");
    body.className = "addon__body";
    while (card.firstChild) body.appendChild(card.firstChild);

    const media = document.createElement("figure");
    media.className = "addon__media";
    const img = document.createElement("img");
    img.src = thumb(name);
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;
    img.setAttribute("aria-hidden", "true");
    media.appendChild(img);

    card.appendChild(media);
    card.appendChild(body);
    card.classList.add("addon--has-media");
  }

  (async () => {
    const files = await listImages();
    if (!files.length) return;

    const map = files.map((n) => ({ name: n, key: norm(n.replace(/\.[^.]+$/, "")) }));

    cards.forEach((card) => {
      const title = card.querySelector(".addon__name")?.textContent || "";
      const keys = [norm(title), norm(card.getAttribute("data-name"))].filter(Boolean);
      const hit = map.find((m) => m.key && keys.includes(m.key));
      if (hit) attach(card, hit.name);
    });
  })();
})();
