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

const SKIP_DIRS = new Set(["node_modules", ".git", "admin", "experiments"]);

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
  const before = html;

  // Build the insertion block — only include tags not already present.
  const parts = [];
  if (!html.includes('rel="canonical"')) parts.push(`<link rel="canonical" href="${url}" />`);
  const isHomepage = f === "index.html" || f === "./index.html";
  if (isHomepage && !html.includes("google-site-verification")) {
    parts.push(`<meta name="google-site-verification" content="${GSC_VERIFICATION}" />`);
  }
  if (!html.includes("googletagmanager.com")) parts.push(gtagBlock);

  if (parts.length === 0) continue;

  const insertion = parts.join("\n") + "\n";
  html = html.replace(/<\/head>/i, insertion + "</head>");

  if (html !== before) {
    writeFileSync(f, html);
    touched++;
    console.log(`  + ${f}  →  ${url}`);
  }
}

console.log(`\nTouched ${touched} of ${files.length} HTML files.`);
