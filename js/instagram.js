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

  const SUPABASE_URL = "https://zjwobaopuhanqsyyilzb.supabase.co";
  const ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqd29iYW9wdWhhbnFzeXlpbHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NDk5NzUsImV4cCI6MjA5NTMyNTk3NX0.lsrtSS8XI4w2MSEnTY3k03Wi9V8xPFc3MIu40mBLyC0";
  const BUCKET = "media";
  const PREFIX = "images/instagram/";
  const VIDEO = /\.(mp4|webm|mov|m4v)$/i;
  const IMAGE = /\.(jpe?g|png|webp|avif)$/i;

  const objectUrl = (name) =>
    `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${PREFIX}${encodeURIComponent(name)}`;
  const imgThumb = (name) =>
    `${SUPABASE_URL}/storage/v1/render/image/public/${BUCKET}/${PREFIX}${encodeURIComponent(
      name
    )}?width=560&height=700&resize=cover&quality=76`;
  // Filename (minus extension) is the Instagram shortcode. "/p/" works for
  // both feed posts and reels, so we don't need to distinguish them.
  const postUrl = (name) =>
    `https://www.instagram.com/p/${encodeURIComponent(name.replace(/\.[^.]+$/, "").trim())}/`;

  const BADGE =
    '<svg class="ig-card__badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>';

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  async function listFiles() {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
      method: "POST",
      headers: {
        apikey: ANON_KEY,
        Authorization: "Bearer " + ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefix: PREFIX, limit: 100, sortBy: { column: "created_at", order: "desc" } }),
    });
    if (!res.ok) throw new Error("Instagram list failed: " + res.status);
    return (await res.json())
      .filter((o) => o && o.id && (VIDEO.test(o.name) || IMAGE.test(o.name)))
      .map((o) => o.name);
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

    track.innerHTML = files.map(card).join("");
    section.hidden = false;

    // Autoplay videos on hover; pause + reset on leave.
    track.querySelectorAll(".ig-card").forEach((a) => {
      const v = a.querySelector("video");
      if (!v || reduceMotion) return;
      a.addEventListener("mouseenter", () => { v.play().catch(() => {}); });
      a.addEventListener("mouseleave", () => { v.pause(); try { v.currentTime = 0; } catch (_) {} });
    });

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
