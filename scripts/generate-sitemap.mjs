/* =========================================================
   Sitemap generator — walks public HTML files and writes sitemap.xml.

   Priorities (informational; Google mostly ignores these now):
     /                                 1.0  (homepage)
     /our-story, /the-booth, /packages...  0.8  (main pages)
     /areas-we-serve                   0.8  (areas index)
     /areas-we-serve/{region}          0.7  (region pages)
     /areas-we-serve/{region}/{nbhd}   0.6  (neighborhood pages)
     /privacy-policy, /terms           0.3  (legal)

   Skipped: admin/, experiments/, api/.
   ========================================================= */

import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://evergrainphotobooth.com";
const SKIP_DIRS = new Set(["node_modules", ".git", "admin", "experiments", "api"]);
const TODAY = new Date().toISOString().slice(0, 10);

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

function urlFor(filePath) {
  let rel = filePath.replace(/^\.\//, "").replace(/\\/g, "/").replace(/\.html$/, "");
  if (rel.endsWith("/index") || rel === "index") rel = rel.slice(0, -"index".length).replace(/\/$/, "");
  return SITE + (rel ? "/" + rel : "/");
}

function priorityFor(p) {
  if (p === "./index.html") return "1.0";
  if (p === "./privacy-policy.html" || p === "./terms.html") return "0.3";
  if (p === "./areas-we-serve/index.html") return "0.8";
  if (p.startsWith("./areas-we-serve/") && p.split("/").length === 3) return "0.7"; // ./areas-we-serve/{region}.html
  if (p.startsWith("./areas-we-serve/") && p.split("/").length === 4) return "0.6"; // ./areas-we-serve/{region}/{nbhd}.html
  return "0.8";
}

function changefreqFor(p) {
  if (p === "./privacy-policy.html" || p === "./terms.html") return "yearly";
  if (p === "./index.html") return "weekly";
  return "monthly";
}

const files = findHtml(".").sort();
const entries = files.map(f => `  <url>
    <loc>${urlFor(f)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreqFor(f)}</changefreq>
    <priority>${priorityFor(f)}</priority>
  </url>`).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

writeFileSync("sitemap.xml", xml);
console.log(`Wrote sitemap.xml with ${files.length} URLs.`);
