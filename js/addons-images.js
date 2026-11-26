/* =========================================================
   Add-Ons — pulls a photo for each add-on from the Supabase
   media/images/add-ons/ folder at runtime and drops it into
   the left of the matching card.

   Matching is by filename: name the image after the add-on's
   title (e.g. "Glam Filter.png", "Premium Backdrop.png") and
   it attaches to that card. Case, spaces, and punctuation are
   ignored. Drop a new image into the folder (or replace one)
   and it shows up on the next page load — no code change.
   If a filename can't match the title, set data-image="<file>"
   on the card instead.

   The images are decorative only: not links, not draggable,
   not clickable.

   The key below is the public "anon" key; it's safe to expose
   and is scoped (by a storage policy) to listing this folder.
   ========================================================= */
(function () {
  const cards = document.querySelectorAll("article.addon[data-addon-card]");
  if (!cards.length) return;

  const R2 = "https://pub-09ff8dfde6ef4e79bf4d6b9a00d6737d.r2.dev";

  // Normalize a title/filename to a comparable key: lowercase, no
  // punctuation or spaces. "Glam FIlter" and "glam-filter" both -> "glamfilter".
  const norm = (s) =>
    (s || "")
      .replace(/&amp;/gi, "&")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

  // resize=contain → the whole image is preserved (never cropped); it's shown
  // on a white 1:1 tile via CSS object-fit: contain.
  // Pre-generated thumbnails live in R2 under thumbs/addons/<file>
  // (pixel-identical to the former Supabase on-the-fly render).
  const thumb = (name) => `${R2}/thumbs/addons/${encodeURIComponent(name)}`;

  async function listImages() {
    try {
      const res = await fetch("/js/data/media-manifest.json", { cache: "no-cache" });
      if (!res.ok) return [];
      return ((await res.json()).addons || [])
        .filter((n) => /\.(jpe?g|png|webp|avif)$/i.test(n));
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

    const map = files
      .map((n) => ({ name: n, key: norm(n.replace(/\.[^.]+$/, "")) }))
      .filter((m) => m.key);

    cards.forEach((card) => {
      const title = card.querySelector(".addon__name")?.textContent || "";
      const keys = [norm(title), norm(card.getAttribute("data-name"))].filter(Boolean);

      // 0) An explicit data-image="<filename>" on the card wins, for images
      //    whose filename doesn't follow the card title.
      const explicit = norm((card.getAttribute("data-image") || "").replace(/\.[^.]+$/, ""));
      let hit = explicit ? map.find((m) => m.key === explicit) : null;

      // 1) Exact match on the (normalized) title.
      if (!hit) hit = map.find((m) => keys.includes(m.key));

      // 2) Otherwise accept a shortened filename that is an unambiguous prefix
      //    of the title — e.g. "Custom Rear Display" for the card
      //    "Custom Rear Display / Branded Visuals". The longest such prefix
      //    wins, and only if it isn't a prefix of some *other* card too.
      if (!hit) {
        const prefixes = map
          .filter((m) => m.key.length >= 5 && keys.some((k) => k.startsWith(m.key)))
          .sort((a, b) => b.key.length - a.key.length);
        for (const cand of prefixes) {
          const otherCards = [...cards].filter((c) => c !== card).some((c) => {
            const ck = [norm(c.querySelector(".addon__name")?.textContent), norm(c.getAttribute("data-name"))];
            return ck.some((k) => k && k.startsWith(cand.key));
          });
          if (!otherCards) { hit = cand; break; }
        }
      }

      if (hit) attach(card, hit.name);
    });
  })();
})();
