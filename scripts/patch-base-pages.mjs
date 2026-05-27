#!/usr/bin/env node
/* =========================================================
   One-off patch for the 9 base HTML files at repo root.
   Adds marquee placeholder + script, removes old footer__areas
   block, adds an "Areas We Serve" link to the Resources column.
   ========================================================= */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const files = readdirSync(ROOT).filter(f => f.endsWith(".html"));

let patched = 0;

for (const file of files) {
  const path = join(ROOT, file);
  let src = readFileSync(path, "utf8");
  let changed = false;

  // 1. Remove the entire <div class="footer__areas">…</div> block
  const areasBlock = /\s*<div class="footer__areas">[\s\S]*?<\/ul>\s*<\/div>\s*/;
  if (areasBlock.test(src)) {
    src = src.replace(areasBlock, "\n    ");
    changed = true;
  }

  // 2. Add "Areas We Serve" link in Resources column (if not already there)
  if (!src.includes('href="areas-we-serve/index.html"') && !src.includes('href="/areas-we-serve/index.html"')) {
    src = src.replace(
      /(<li><a href="#inquiry">Request a Quote<\/a><\/li>)/,
      `$1\n          <li><a href="areas-we-serve/index.html">Areas We Serve</a></li>`
    );
    changed = true;
  }

  // 3. Insert <div data-marquee-placeholder></div> right before <footer class="site-footer">
  if (!src.includes("data-marquee-placeholder")) {
    src = src.replace(
      /(<footer class="site-footer">)/,
      `<div data-marquee-placeholder></div>\n\n$1`
    );
    changed = true;
  }

  // 4. Add <script src="js/areas-marquee.js"></script> after inquiry-section.js
  if (!src.includes("areas-marquee.js")) {
    src = src.replace(
      /(<script src="js\/inquiry-section\.js"><\/script>)/,
      `$1\n<script src="js/areas-marquee.js"></script>`
    );
    changed = true;
  }

  if (changed) {
    writeFileSync(path, src);
    console.log(`  ✓ patched ${file}`);
    patched++;
  } else {
    console.log(`  - ${file} (no changes)`);
  }
}

console.log(`\nPatched ${patched} file(s).`);
