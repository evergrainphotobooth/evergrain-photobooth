/* =========================================================
   Build home — injects swappable homepage partials into index.html.

   The hero lives in partials/home-hero.html so it can be redesigned in
   isolation. This script re-injects it into index.html between the
   <!-- BUILD:home-hero --> … <!-- /BUILD:home-hero --> markers, keeping the
   hero in the served HTML (good for SEO / LCP — no client-side flash).

   Usage:
     node scripts/build-home.mjs      (or: npm run build:home)

   To change the hero: edit partials/home-hero.html, then run this.
   Idempotent — re-running with no partial change is a no-op.
   ========================================================= */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// name → { partial file, start marker, end marker }
const INCLUDES = [
  { name: "home-hero", file: "partials/home-hero.html", start: "<!-- BUILD:home-hero -->", end: "<!-- /BUILD:home-hero -->" },
];

const indexPath = join(ROOT, "index.html");
let html = readFileSync(indexPath, "utf8");
let changed = false;

for (const inc of INCLUDES) {
  const s = html.indexOf(inc.start);
  const e = html.indexOf(inc.end);
  if (s === -1 || e === -1 || e < s) {
    console.error(`✗ ${inc.name}: markers not found in index.html — skipping`);
    continue;
  }
  const partial = readFileSync(join(ROOT, inc.file), "utf8").trim();
  const before = html.slice(0, s + inc.start.length);
  const after = html.slice(e);
  const next = `${before}\n  ${partial}\n  ${after}`;
  if (next !== html) { html = next; changed = true; console.log(`  + ${inc.name}  ←  ${inc.file}`); }
  else console.log(`  = ${inc.name} (unchanged)`);
}

if (changed) { writeFileSync(indexPath, html); console.log("Wrote index.html"); }
else console.log("index.html already up to date.");
