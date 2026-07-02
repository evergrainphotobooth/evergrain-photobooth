/* =========================================================
   A Thousand Words — hub + category listing behaviour.
   Reads /data/blog-index.json (committed on publish) and renders the
   entry grid with category tabs (hub only), fade-in-left reveal on scroll,
   and pagination (20 per page). One script drives both page types via the
   data-mode attribute on [data-blog-root].
   ========================================================= */
(function () {
  const root = document.querySelector("[data-blog-root]");
  if (!root) return;

  const MODE = root.getAttribute("data-mode") || "hub"; // "hub" | "category"
  const PAGE_SIZE = 20;

  const gridEl = root.querySelector("[data-blog-grid]");
  const tabsEl = root.querySelector("[data-blog-tabs]");
  const pagerEl = root.querySelector("[data-blog-pagination]");
  const statusEl = root.querySelector("[data-blog-status]");

  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  let POSTS = [];
  let activeCat = null; // slug or null (=All)
  let page = 1;
  let revealObserver = null;

  function categorySlugFromPath() {
    // /a-thousand-words/<slug>  → <slug>
    const m = location.pathname.replace(/\/+$/, "").match(/\/a-thousand-words\/([^/]+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  // A post can belong to several categories; fall back to the single primary.
  function catsOf(p) {
    return (Array.isArray(p.categories) && p.categories.length) ? p.categories : (p.category ? [p.category] : []);
  }

  function filtered() {
    if (!activeCat) return POSTS;
    return POSTS.filter((p) => catsOf(p).some((c) => c && c.slug === activeCat));
  }

  function cardHTML(p) {
    const img = p.image
      ? `<img class="blog-card__img" src="${esc(p.image)}" alt="${esc(p.imageAlt || p.title)}" loading="lazy" />`
      : `<span class="blog-card__img--empty">A Thousand Words</span>`;
    return `
      <a class="blog-card" href="${esc(p.url)}">
        <div class="blog-card__imgwrap">${img}</div>
        <div class="blog-card__body">
          <h3 class="blog-card__title">${esc(p.title)}</h3>
          ${p.dateLabel ? `<div class="blog-card__date">${esc(p.dateLabel)}</div>` : ""}
          <p class="blog-card__excerpt">${esc(p.excerpt || "")}</p>
          ${p.category ? `<span class="blog-card__cat">${esc(p.category.name)}</span>` : ""}
        </div>
      </a>`;
  }

  function renderReveal() {
    if (revealObserver) revealObserver.disconnect();
    const cards = gridEl.querySelectorAll(".blog-card");
    if (!("IntersectionObserver" in window)) {
      cards.forEach((c) => c.classList.add("is-in"));
      return;
    }
    revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); obs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    // Small stagger per row for a pleasant cascade.
    cards.forEach((c, i) => { c.style.transitionDelay = (i % 4) * 60 + "ms"; revealObserver.observe(c); });
  }

  function pageItems(total, current) {
    // Windowed pagination: 1 … (c-1) c (c+1) … total
    const items = [];
    const add = (n) => items.push(n);
    const win = 1;
    const lo = Math.max(2, current - win);
    const hi = Math.min(total - 1, current + win);
    add(1);
    if (lo > 2) items.push("…");
    for (let n = lo; n <= hi; n++) add(n);
    if (hi < total - 1) items.push("…");
    if (total > 1) add(total);
    return items;
  }

  function renderPager(total) {
    if (!pagerEl) return;
    if (total <= 1) { pagerEl.innerHTML = ""; return; }
    const btn = (label, p, opts = {}) => {
      const cls = "blog-pagination__btn" + (opts.active ? " is-active" : "");
      const dis = opts.disabled ? " disabled" : "";
      return `<button type="button" class="${cls}"${dis} data-page="${p}" aria-label="${esc(opts.aria || ("Page " + label))}">${label}</button>`;
    };
    let html = btn("‹ Prev", page - 1, { disabled: page === 1, aria: "Previous page" });
    for (const it of pageItems(total, page)) {
      html += it === "…" ? `<span class="blog-pagination__gap">…</span>` : btn(String(it), it, { active: it === page });
    }
    html += btn("Next ›", page + 1, { disabled: page === total, aria: "Next page" });
    pagerEl.innerHTML = html;
    pagerEl.querySelectorAll("[data-page]").forEach((b) => {
      b.addEventListener("click", () => {
        const p = parseInt(b.getAttribute("data-page"), 10);
        if (!p || p === page || p < 1 || p > total) return;
        page = p;
        render();
        // Scroll back to the top of the grid on page change.
        const y = gridEl.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    });
  }

  function render() {
    const list = filtered();
    const total = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (page > total) page = total;
    if (statusEl) statusEl.hidden = list.length > 0;

    if (list.length === 0) {
      gridEl.innerHTML = "";
      if (statusEl) statusEl.innerHTML = `<div class="blog-empty"><h3>Nothing here yet.</h3><p>New A Thousand Words stories are on the way.</p></div>`;
      renderPager(1);
      return;
    }

    const start = (page - 1) * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);
    gridEl.classList.add("js-reveal");
    gridEl.innerHTML = slice.map(cardHTML).join("");
    renderReveal();
    renderPager(total);
  }

  function renderTabs() {
    if (MODE !== "hub" || !tabsEl) return;
    // Categories that actually have published posts, in the index's order.
    const bySlug = new Map();
    POSTS.forEach((p) => catsOf(p).forEach((c) => { if (c && c.slug && !bySlug.has(c.slug)) bySlug.set(c.slug, c.name); }));
    const cats = Array.from(bySlug, ([slug, name]) => ({ slug, name }));
    const tab = (label, slug) =>
      `<button type="button" class="filter-pill${(activeCat === slug || (!activeCat && slug === null)) ? " is-active" : ""}" data-cat="${slug === null ? "" : esc(slug)}">${esc(label)}</button>`;
    tabsEl.innerHTML = tab("All", null) + cats.map((c) => tab(c.name, c.slug)).join("");
    tabsEl.querySelectorAll("[data-cat]").forEach((b) => {
      b.addEventListener("click", () => {
        const slug = b.getAttribute("data-cat") || null;
        if (slug === activeCat) return;
        activeCat = slug;
        page = 1;
        tabsEl.querySelectorAll(".filter-pill").forEach((x) => x.classList.remove("is-active"));
        b.classList.add("is-active");
        render();
      });
    });
    tabsEl.hidden = cats.length === 0;
  }

  function applyCategoryChrome(categories) {
    // Category page: set H1 / blurb / <title> / canonical from the URL slug.
    const slug = categorySlugFromPath();
    activeCat = slug;
    const meta = (categories || []).find((c) => c.slug === slug);
    const name = meta ? meta.name : (slug || "A Thousand Words").replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    const titleEl = root.querySelector("[data-cat-title]");
    const blurbEl = root.querySelector("[data-cat-blurb]");
    if (titleEl) titleEl.textContent = name;
    if (blurbEl) {
      if (meta && meta.blurb) { blurbEl.textContent = meta.blurb; blurbEl.hidden = false; }
      else blurbEl.hidden = true;
    }
    document.title = `${name} — A Thousand Words | Evergrain Photobooth`;
    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) { canon = document.createElement("link"); canon.rel = "canonical"; document.head.appendChild(canon); }
    canon.href = `${location.origin}/a-thousand-words/${slug}`;
  }

  async function init() {
    try {
      const r = await fetch("/data/blog-index.json", { cache: "no-cache" });
      if (!r.ok) throw new Error("index");
      const data = await r.json();
      POSTS = Array.isArray(data.posts) ? data.posts : [];
      const categories = Array.isArray(data.categories) ? data.categories : [];
      if (MODE === "category") applyCategoryChrome(categories);
      else renderTabs();
      render();
    } catch (e) {
      if (statusEl) { statusEl.hidden = false; statusEl.innerHTML = `<div class="blog-empty"><h3>Couldn’t load posts.</h3><p>Please refresh in a moment.</p></div>`; }
    }
  }

  init();
})();
