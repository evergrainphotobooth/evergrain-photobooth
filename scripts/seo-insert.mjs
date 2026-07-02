/* =========================================================
   SEO insert — adds three things to every public HTML page:
     1. <link rel="canonical" ...>   (one per page, URL matches path)
     2. <meta name="google-site-verification" ...>   (homepage only)
     3. gtag.js (Google Analytics)   (every page except admin/experiments)

   Idempotent — re-running the script is a no-op if the tag is already present.
   Skips: admin/, experiments/, node_modules/, .git/.

   Usage:
     node scripts/seo-insert.mjs
   ========================================================= */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://evergrainphotobooth.com";
const GA_ID = "G-N7ERDKCDX7";
const GSC_VERIFICATION = "Cpa0Kq10QOKIpqoFMstt_k3OzLzUJ4bV9GTnWABuZeM";
const OG_IMAGE = `${SITE}/assets/img/evergrain_favicon.png`;

const SKIP_DIRS = new Set(["node_modules", ".git", "admin", "experiments"]);
// The blog category page is a template served via rewrite for many URLs — its
// canonical / OG are set per-category by JS, so leave it out of the static pass.
const SKIP_FILES = new Set(["a-thousand-words/category.html"]);

// Business facts for the sitewide LocalBusiness structured data (AIO + local SEO).
const settings = JSON.parse(readFileSync("data/settings.json", "utf8"));
const LOCALBUSINESS_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE}/#business`,
  name: "Evergrain Photobooth",
  description: "Luxury open-air DSLR photo booth rental for weddings, corporate events, and celebrations across Los Angeles and Orange County.",
  url: SITE,
  telephone: settings?.contact?.phoneE164 || "+16265608330",
  email: settings?.contact?.email || "evergrainphotobooth@gmail.com",
  image: OG_IMAGE,
  logo: `${SITE}/assets/logos/FullLogo_White.svg`,
  priceRange: "$$",
  address: { "@type": "PostalAddress", addressLocality: "Los Angeles", addressRegion: "CA", addressCountry: "US" },
  areaServed: [
    { "@type": "City", name: "Los Angeles" },
    { "@type": "AdministrativeArea", name: "Orange County" },
    { "@type": "AdministrativeArea", name: "Los Angeles County" },
  ],
  sameAs: Object.values(settings?.social || {}).filter(Boolean),
});

// Pull a page's existing <title> / description so OG mirrors them exactly.
const grab = (html, re) => { const m = html.match(re); return m ? m[1].trim() : ""; };
const attr = (s) => String(s).replace(/"/g, "&quot;");

function findHtml(dir, out = []) {
  for (const f of readdirSync(dir)) {
    if (SKIP_DIRS.has(f) || f.startsWith(".")) continue;
    const p = join(dir, f);
    const s = statSync(p);
    if (s.isDirectory()) findHtml(p, out);
    else if (f.endsWith(".html")) out.push(p);
  }
  return out;
}

/* Convert filesystem path → canonical URL.
   index.html     → https://site/
   our-story.html → https://site/our-story
   areas-we-serve/central-los-angeles/hollywood.html
                  → https://site/areas-we-serve/central-los-angeles/hollywood
*/
function canonicalUrlFor(filePath) {
  let rel = filePath.replace(/^\.\//, "").replace(/\\/g, "/").replace(/\.html$/, "");
  if (rel.endsWith("/index") || rel === "index") rel = rel.slice(0, -"index".length).replace(/\/$/, "");
  return SITE + (rel ? "/" + rel : "/");
}

const gtagBlock = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');
</script>`;

const files = findHtml(".");
let touched = 0;
for (const f of files) {
  const url = canonicalUrlFor(f);
  let html = readFileSync(f, "utf8");
  const relPath = f.replace(/^\.\//, "");
  if (SKIP_FILES.has(relPath)) continue;
  const before = html;

  // Build the insertion block — only include tags not already present.
  const parts = [];
  if (!html.includes('rel="canonical"')) parts.push(`<link rel="canonical" href="${url}" />`);
  const isHomepage = f === "index.html" || f === "./index.html";
  if (isHomepage && !html.includes("google-site-verification")) {
    parts.push(`<meta name="google-site-verification" content="${GSC_VERIFICATION}" />`);
  }

  // Open Graph + Twitter, mirroring the page's own <title>/description.
  if (!html.includes('property="og:title"')) {
    const title = grab(html, /<title>([\s\S]*?)<\/title>/i);
    const desc = grab(html, /<meta\s+name="description"\s+content="([\s\S]*?)"/i);
    parts.push(
      `<meta property="og:type" content="${isHomepage ? "website" : "website"}" />`,
      `<meta property="og:site_name" content="Evergrain Photobooth" />`,
      `<meta property="og:title" content="${attr(title)}" />`,
      `<meta property="og:description" content="${attr(desc)}" />`,
      `<meta property="og:url" content="${url}" />`,
      `<meta property="og:image" content="${OG_IMAGE}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${attr(title)}" />`,
      `<meta name="twitter:description" content="${attr(desc)}" />`,
      `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    );
  }

  // Sitewide LocalBusiness structured data (AIO + local SEO).
  if (!html.includes(`${SITE}/#business`)) {
    parts.push(`<script type="application/ld+json">${LOCALBUSINESS_LD}</script>`);
  }

  if (!html.includes("googletagmanager.com")) parts.push(gtagBlock);

  if (parts.length === 0) continue;

  const insertion = parts.join("\n") + "\n";
  // Function replacement so `$` sequences in the JSON-LD (e.g. priceRange "$$")
  // aren't interpreted as replacement patterns by String.replace.
  html = html.replace(/<\/head>/i, () => insertion + "</head>");

  if (html !== before) {
    writeFileSync(f, html);
    touched++;
    console.log(`  + ${f}  →  ${url}`);
  }
}

console.log(`\nTouched ${touched} of ${files.length} HTML files.`);
