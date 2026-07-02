/* =========================================================
   Blog → static site renderer (module, not a route)

   The public site has no build step — generated pages are committed files.
   So when a post is published we render a full static HTML page and commit it
   (plus a regenerated data/blog-index.json that the hub + category shells read)
   through the GitHub API, exactly like services/settings.

   Exports:
     syncSite(env, { putPosts, delPaths })  → commit post files + fresh index
     renderPostFile(post)                    → { path, content }
     postPath(post)                          → "a-thousand-words/<cat>/<slug>.html"
     postUrl(post)                            → "/a-thousand-words/<cat>/<slug>"
   ========================================================= */

import { commitTree, getFile } from "./github.js";

const SITE = "https://evergrainphotobooth.com";
const HUB_DIR = "a-thousand-words";
const INDEX_PATH = "data/blog-index.json";
const UNCATEGORIZED = { name: "A Thousand Words", slug: "uncategorized" };

/* ---------- helpers ---------- */
const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function textFromHtml(html) {
  return String(html || "")
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ").trim();
}

function excerptOf(post, max = 160) {
  const base = (post.meta_description && post.meta_description.trim())
    || textFromHtml(post.content_html);
  if (base.length <= max) return base;
  return base.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function dateLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function catOf(post) {
  const c = post.blog_categories;
  if (c && c.slug) return { name: c.name || "A Thousand Words", slug: c.slug };
  return UNCATEGORIZED;
}

export function postPath(post) {
  return `${HUB_DIR}/${catOf(post).slug}/${post.slug}.html`;
}
export function postUrl(post) {
  return `/${HUB_DIR}/${catOf(post).slug}/${post.slug}`;
}

/* ---------- Supabase reads ---------- */
async function sb(env, path) {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
  });
  if (!r.ok) throw new Error(`Supabase ${path}: ${r.status} ${await r.text()}`);
  return r.json();
}

async function fetchIndexData(env) {
  const posts = await sb(env,
    `blog_posts?select=title,slug,image_url,image_alt,meta_description,content_html,published_at,created_at,blog_categories(name,slug)` +
    `&status=eq.published&order=published_at.desc.nullslast`);
  const categories = await sb(env, `blog_categories?select=name,slug,blurb&order=name.asc`);
  return { posts, categories };
}

function buildIndexFile({ posts, categories }) {
  const data = {
    generated_at: new Date().toISOString(),
    categories: (categories || []).map(c => ({ name: c.name, slug: c.slug, blurb: c.blurb || "" })),
    posts: (posts || []).map(p => {
      const c = catOf(p);
      return {
        title: p.title,
        slug: p.slug,
        url: `/${HUB_DIR}/${c.slug}/${p.slug}`,
        category: { name: c.name, slug: c.slug },
        image: p.image_url || "",
        imageAlt: p.image_alt || p.title || "",
        date: p.published_at || p.created_at || null,
        dateLabel: dateLabel(p.published_at || p.created_at),
        excerpt: excerptOf(p),
      };
    }),
  };
  return { path: INDEX_PATH, content: JSON.stringify(data, null, 2) + "\n" };
}

/* ---------- shared page chrome (mirrors the area child pages, ../../ depth) ---------- */
const HEAD_FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Inter:wght@400;500;600&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet" />`;

const HEADER = `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container">
    <nav class="nav" aria-label="Primary">
      <a href="/" class="nav__logo"><img src="../../assets/logos/FullLogo_White.svg" alt="Evergrain Photobooth" /></a>
      <ul class="nav__menu">
        <li><a href="/our-story" class="nav__link">Our Story</a></li>
        <li><a href="/the-booth" class="nav__link">The Booth</a></li>
        <li><a href="/packages" class="nav__link">Packages</a></li>
        <li><a href="/add-ons" class="nav__link">Add-Ons</a></li>
        <li><a href="/faq" class="nav__link">FAQ</a></li>
      </ul>
      <div class="nav__actions">
        <button type="button" class="nav__cart" data-cart-toggle aria-label="Open Package List">
          <span>List</span><span class="nav__cart-count" data-count="0">0</span>
        </button>
        <button type="button" class="nav__toggle" aria-label="Toggle navigation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7h18M3 12h18M3 17h18" stroke-linecap="round"/></svg>
        </button>
      </div>
    </nav>
  </div>
</header>`;

const PACKAGES = `<section class="section section--linen-warm">
    <div class="container">
      <div class="reveal text-center" style="max-width:680px;margin:0 auto var(--space-lg);">
        <span class="eyebrow">Pick a package</span>
        <h2 class="display">Bring the booth to your event.</h2>
        <p style="color:var(--bark);">Pick a package, then layer in extras. Your selection slides in from the right as a Package List.</p>
      </div>
      <div class="packages">
        <article class="package reveal" data-package-card="candid" data-name="The Candid" data-price="600" data-desc="3-hour minimum · DSLR quality · unlimited digital · prints + gallery">
          <h2 class="package__name">The Candid</h2>
          <p class="package__tagline">Built for smaller celebrations — birthdays, showers, grad parties, and private gatherings.</p>
          <div class="package__price"><span class="package__price-amount"><sup>$</sup>600</span><div class="package__price-meta">3-hour minimum · $150 / additional hour</div></div>
          <ul class="package__features">
            <li>Handcrafted wooden, open-air photo booth</li><li>DSLR quality photos</li><li>Unlimited digital photos</li><li>Instant digital sharing (text, email, AirDrop, QR code)</li><li>2×6 photo strip</li><li>Standard photo templates</li><li>Standard backdrop</li><li>Standard prop bundle</li><li>Custom felt letter board message</li><li>On-site attendant</li><li>Online gallery delivered after the event</li><li>Set-up &amp; tear down included</li>
          </ul>
          <button type="button" class="btn btn--outline package__cta" data-add-package>Add to List</button>
          <div class="package__selected-indicator">✓ Added to your list</div>
        </article>
        <article class="package package--featured reveal" data-package-card="moment" data-name="The Moment" data-price="750" data-desc="Great for weddings, company events, holiday parties, and celebrations for up to 150 guests.">
          <span class="package__tag">Most Popular</span>
          <h2 class="package__name">The Moment</h2>
          <p class="package__tagline">Great for weddings, company events, holiday parties, and celebrations for up to 150 guests.</p>
          <div class="package__price"><span class="package__price-amount"><sup>$</sup>750</span><div class="package__price-meta">3-hour minimum · $150 / additional hour</div></div>
          <ul class="package__features">
            <li>Everything in The Candid</li><li>Choice of 2×6 or 4×6 prints</li><li>Customizable photo templates</li><li>Customizable rear screen display</li><li>Customizable tap-to-start screen</li><li>Premium backdrop</li><li>Premium prop bundle</li>
          </ul>
          <button type="button" class="btn btn--brass package__cta" data-add-package>Add to List</button>
          <div class="package__selected-indicator" style="color:var(--champagne);">✓ Added to your list</div>
        </article>
        <article class="package reveal" data-package-card="glam" data-name="The Glam" data-price="1050" data-desc="Perfect for weddings, brand activations, company parties, and events that deserve the full experience.">
          <h2 class="package__name">The Glam</h2>
          <p class="package__tagline">Perfect for weddings, brand activations, company parties, and events that deserve the full experience.</p>
          <div class="package__price"><span class="package__price-amount"><sup>$</sup>1,050</span><div class="package__price-meta">4-hour minimum · $100 / additional hour</div></div>
          <ul class="package__features">
            <li>Everything in The Moment</li><li>B&amp;W Filter + color mode</li><li>2nd Customizable Photo Template</li><li>Glam Filter (skin smoothing &amp; teeth whitening)</li>
          </ul>
          <button type="button" class="btn btn--outline package__cta" data-add-package>Add to List</button>
          <div class="package__selected-indicator">✓ Added to your list</div>
        </article>
      </div>
      <p class="compare-note"><a href="/packages">See full feature comparison →</a></p>
    </div>
  </section>`;

const FOOTER = `<footer class="site-footer">
  <div class="container">
    <div class="footer__grid">
      <div class="footer__logo">
        <img src="../../assets/logos/FullLogo_White.svg" alt="Evergrain Photobooth" />
        <p class="footer__tagline" data-cms-tagline>A photobooth experience built around the camera — never around the gimmick.</p>
      </div>
      <div><h4>Explore</h4><ul class="footer__list"><li><a href="/our-story">Our Story</a></li><li><a href="/the-booth">The Booth</a></li><li><a href="/packages">Packages</a></li><li><a href="/a-thousand-words">A Thousand Words</a></li></ul></div>
      <div><h4>Resources</h4><ul class="footer__list"><li><a href="/faq">FAQ</a></li><li><a href="#inquiry">Request a Quote</a></li><li><a href="/get-started">Get Started</a></li><li><a href="/areas-we-serve">Areas We Serve</a></li></ul></div>
      <div><h4>Contact</h4><ul class="footer__list"><li><a href="mailto:evergrainphotobooth@gmail.com" data-cms-email>evergrainphotobooth@gmail.com</a></li><li><a href="tel:+16265608330" data-cms-phone>(626) 560-8330</a></li><li data-cms-location>Los Angeles, CA</li></ul></div>
    </div>
    <div class="footer__bottom">
      <span>© <span data-year>2025</span> Evergrain Photobooth. All rights reserved.</span>
      <span><a href="/privacy-policy">Privacy Policy</a> · <a href="/terms">Terms &amp; Conditions</a></span>
    </div>
  </div>
</footer>`;

const CART = `<div class="cart-overlay" data-cart-overlay></div>
<aside class="cart" data-cart aria-label="Your Package List" role="dialog" aria-modal="true">
  <div class="cart__header">
    <h2 class="cart__title">Your Package List</h2>
    <button type="button" class="cart__close" data-cart-close aria-label="Close"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg></button>
  </div>
  <div class="cart__body" data-cart-body></div>
  <div class="cart__footer" data-cart-footer>
    <div class="cart__total"><span class="cart__total-label">Estimated Total</span><span class="cart__total-amount" data-cart-total>$0</span></div>
    <a href="#inquiry" class="btn btn--primary btn--block" data-cart-checkout>Request a Quote</a>
    <p class="cart__note"><button type="button" data-cart-clear style="background:none;border:0;color:var(--bark);cursor:pointer;font:inherit;text-decoration:underline;">Clear list</button> · Final pricing confirmed after consult.</p>
  </div>
</aside>`;

const SCRIPTS = `<script src="../../js/inquiry-section.js"></script>
<script src="../../js/cart.js"></script>
<script src="../../js/script.js"></script>
<script src="../../js/animations.js"></script>`;

const GTAG = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-N7ERDKCDX7"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-N7ERDKCDX7');</script>`;

/* ---------- render one post ---------- */
export function renderPostFile(post) {
  const c = catOf(post);
  const url = `${SITE}/${HUB_DIR}/${c.slug}/${post.slug}`;
  const title = post.title || "A Thousand Words";
  const metaTitle = post.meta_title || `${title} | Evergrain Photobooth`;
  const metaDesc = post.meta_description || excerptOf(post);
  const img = post.image_url || "";
  const published = post.published_at || post.created_at;
  const heroStyle = img ? ` style="background-image:url('${esc(img)}')"` : ""; /* green overlay is in css/blog.css (.blog-hero::before) */

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: metaDesc,
    image: img ? [img] : undefined,
    datePublished: published,
    dateModified: post.updated_at || published,
    author: { "@type": "Organization", name: "Evergrain Photobooth" },
    publisher: { "@type": "Organization", name: "Evergrain Photobooth", logo: { "@type": "ImageObject", url: `${SITE}/assets/logos/FullLogo_White.svg` } },
    mainEntityOfPage: url,
  };

  const content = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(metaTitle)}</title>
<meta name="description" content="${esc(metaDesc)}" />
<link rel="canonical" href="${esc(url)}" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(metaDesc)}" />
${img ? `<meta property="og:image" content="${esc(img)}" />` : ""}
<meta property="og:url" content="${esc(url)}" />
<meta name="twitter:card" content="summary_large_image" />
${HEAD_FONTS}
<link rel="stylesheet" href="../../css/style.css" />
<link rel="stylesheet" href="../../css/components.css" />
<link rel="stylesheet" href="../../css/pages.css" />
<link rel="stylesheet" href="../../css/blog.css" />
<link rel="icon" type="image/png" href="/assets/img/evergrain_favicon.png" />
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
${GTAG}
</head>
<body>
${HEADER}
<main id="main">
  <section class="blog-hero"${heroStyle}>
    <div class="container">
      <nav class="breadcrumb breadcrumb--hero" aria-label="Breadcrumb"><a class="breadcrumb__link" href="/">Home</a> <span class="breadcrumb__sep">›</span> <a class="breadcrumb__link" href="/a-thousand-words">A Thousand Words</a> <span class="breadcrumb__sep">›</span> <a class="breadcrumb__link" href="/a-thousand-words/${esc(c.slug)}">${esc(c.name)}</a> <span class="breadcrumb__sep">›</span> <span class="breadcrumb__current" aria-current="page">${esc(title)}</span></nav>
      <div class="blog-hero__meta"><a class="blog-hero__cat" href="/a-thousand-words/${esc(c.slug)}">${esc(c.name)}</a>${published ? `<span class="blog-hero__date">${esc(dateLabel(published))}</span>` : ""}</div>
      <h1 class="blog-hero__title">${esc(title)}</h1>
    </div>
  </section>

  <article class="section blog-article">
    <div class="container container--narrow">
      <div class="blog-article__body">
${post.content_html || "<p>Coming soon.</p>"}
      </div>
      <div class="blog-article__back"><a href="/a-thousand-words" class="link-arrow">← Back to A Thousand Words</a></div>
    </div>
  </article>

  ${PACKAGES}

  <div data-inquiry-placeholder></div>
</main>
${FOOTER}
${CART}
${SCRIPTS}
</body>
</html>
`;
  return { path: postPath(post), content };
}

/* ---------- orchestration: commit post files + fresh index ---------- */
export async function syncSite(env, { putPosts = [], delPaths = [] } = {}, message) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env missing");
  const idx = buildIndexFile(await fetchIndexData(env));
  const put = [...putPosts.map(renderPostFile), idx];
  // Only delete paths that actually exist, so a stale/missing path can't 422 the whole commit.
  const del = [];
  for (const p of delPaths) { try { if (await getFile(p)) del.push(p); } catch { /* ignore */ } }
  const commit = await commitTree({ put, del }, message || "Blog: sync published content");
  return { ok: true, commit };
}

/* Rebuild only the index (category changes, etc.) */
export async function syncIndexOnly(env, message) {
  return syncSite(env, {}, message || "Blog: refresh index");
}

/* Cron entry: publish any 'scheduled' posts whose time has arrived. Flips them
   to published in Supabase, then renders their pages + rebuilds the index in
   one commit. Returns { ok, published }. */
export async function publishScheduled(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env missing");
  const nowIso = new Date().toISOString();
  const due = await sb(env,
    `blog_posts?status=eq.scheduled&scheduled_at=lte.${encodeURIComponent(nowIso)}&select=*,blog_categories(name,slug)`);
  if (!Array.isArray(due) || due.length === 0) return { ok: true, published: 0 };

  const H = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };
  for (const p of due) {
    await fetch(`${env.SUPABASE_URL}/rest/v1/blog_posts?id=eq.${encodeURIComponent(p.id)}`, {
      method: "PATCH",
      headers: H,
      body: JSON.stringify({ status: "published", published_at: nowIso, scheduled_at: null, updated_at: nowIso }),
    });
    p.status = "published"; p.published_at = nowIso; // reflect for rendering
  }
  await syncSite(env, { putPosts: due }, `Blog: publish ${due.length} scheduled post(s)`);
  return { ok: true, published: due.length };
}
