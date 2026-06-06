/* =========================================================
   One-shot script that injects CMS data-* attributes + the
   runtime patcher <script> into every public HTML file.

   Idempotent: re-running it is a no-op if attributes already exist.

   Skips: admin/, experiments/, node_modules/, .git/, scripts/.
   ========================================================= */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SKIP_DIRS = new Set(["node_modules", ".git", "admin", "experiments", "scripts", "api"]);

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

const SOCIAL_HOSTS = [
  ["yelp",      /yelp\.com\/biz\/evergrain-photobooth-los-angeles/i],
  ["instagram", /instagram\.com\/evergrainphotobooth\/?/i],
  ["facebook",  /facebook\.com\/evergrainphotobooth\/?/i],
  ["tiktok",    /tiktok\.com\/@evergrainphotobooth/i],
  ["pinterest", /pinterest\.com\/evergrainphotobooth\/?/i],
];

function patch(html) {
  let out = html;

  // 1. Email anchor — add data-cms-email
  out = out.replace(
    /<a\s+([^>]*?)href="mailto:evergrainphotobooth@gmail\.com"([^>]*)>([^<]+)<\/a>/gi,
    (m, pre, post, txt) => {
      if (/data-cms-email/.test(m)) return m;
      return `<a ${pre}href="mailto:evergrainphotobooth@gmail.com"${post} data-cms-email>${txt}</a>`;
    }
  );

  // 2. Phone anchor — add data-cms-phone
  out = out.replace(
    /<a\s+([^>]*?)href="tel:\+16265608330"([^>]*)>([^<]+)<\/a>/gi,
    (m, pre, post, txt) => {
      if (/data-cms-phone/.test(m)) return m;
      return `<a ${pre}href="tel:+16265608330"${post} data-cms-phone>${txt}</a>`;
    }
  );

  // 3. Location <li> with exactly "Los Angeles, CA" — add data-cms-location
  out = out.replace(
    /<li>Los Angeles, CA<\/li>/gi,
    (m) => m.includes("data-cms-location") ? m : `<li data-cms-location>Los Angeles, CA</li>`
  );

  // 4. Social links — add data-cms-social="<platform>" to each
  for (const [platform, hostRe] of SOCIAL_HOSTS) {
    out = out.replace(
      new RegExp(`<a\\s+([^>]*?)href="(https?:\\/\\/[^"]*?)"([^>]*?)>`, "gi"),
      (m, pre, url, post) => {
        if (!hostRe.test(url)) return m;
        if (/data-cms-social=/.test(m)) return m;
        return `<a ${pre}href="${url}"${post} data-cms-social="${platform}">`;
      }
    );
  }

  // 5. Tagline — add data-cms-tagline to the footer__tagline <p>
  out = out.replace(
    /<p class="footer__tagline">([^<]+)<\/p>/gi,
    (m, txt) => m.includes("data-cms-tagline") ? m : `<p class="footer__tagline" data-cms-tagline>${txt}</p>`
  );

  // 6. Inject site-settings.js script before </body> (if not already present)
  if (!out.includes("js/site-settings.js")) {
    out = out.replace(/<\/body>/i, '<script src="/js/site-settings.js" defer></script>\n</body>');
  }

  return out;
}

const files = findHtml(".");
let touched = 0;
for (const f of files) {
  const before = readFileSync(f, "utf8");
  const after = patch(before);
  if (after !== before) {
    writeFileSync(f, after);
    touched++;
    console.log(`  + ${f}`);
  }
}
console.log(`\nTouched ${touched} of ${files.length} HTML files.`);
