#!/usr/bin/env node
/* =========================================================
   Evergrain Photobooth — One-time URL cleanup
   Rewrites every href/src .html reference in every HTML file
   to a clean root-relative URL (no .html, no /index).
   - index.html               → /
   - our-story.html           → /our-story
   - areas-we-serve/index.html→ /areas-we-serve
   - areas-we-serve/foo.html  → /areas-we-serve/foo
   - areas-we-serve/foo/bar.html → /areas-we-serve/foo/bar
   Skips external URLs, anchors, mailto:, tel:, and non-.html assets.
   Safe to re-run (idempotent).
   ========================================================= */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, posix } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function findHtmlFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git" || entry.startsWith(".")) continue;
    const path = join(dir, entry);
    const st = statSync(path);
    if (st.isDirectory()) findHtmlFiles(path, files);
    else if (entry.endsWith(".html")) files.push(path);
  }
  return files;
}

function fileDirAsAbsolute(file) {
  // Convert "ROOT/areas-we-serve/foo.html" → "/areas-we-serve/"
  const rel = file.slice(ROOT.length).replace(/^\/+/, "");
  const dir = dirname(rel);
  if (dir === "." || dir === "") return "/";
  return "/" + dir + "/";
}

function transformHref(href, fileDir) {
  // External / pseudo-protocol / anchor / protocol-relative — leave alone
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return href;
  if (href.startsWith("#")) return href;
  if (href.startsWith("//")) return href;
  if (!href.includes(".html")) return href;

  // Split off query + hash
  const m = href.match(/^([^?#]*)([?#].*)?$/);
  const pathPart = m[1];
  const suffix = m[2] || "";

  // Resolve to absolute path
  let absolute;
  if (pathPart.startsWith("/")) {
    absolute = pathPart;
  } else {
    absolute = posix.normalize(posix.join(fileDir, pathPart));
    if (!absolute.startsWith("/")) absolute = "/" + absolute;
  }

  // Strip .html
  let clean = absolute.replace(/\.html$/, "");

  // Strip trailing /index → bare path
  if (clean === "/index") clean = "/";
  else if (clean.endsWith("/index")) clean = clean.slice(0, -"/index".length);

  return clean + suffix;
}

const files = findHtmlFiles(ROOT);
let totalFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  const fileDir = fileDirAsAbsolute(file);
  let src = readFileSync(file, "utf8");
  let fileReplacements = 0;

  src = src.replace(/(\b(?:href|src)=")([^"]+)(")/g, (match, prefix, value, post) => {
    const transformed = transformHref(value, fileDir);
    if (transformed !== value) fileReplacements++;
    return `${prefix}${transformed}${post}`;
  });

  if (fileReplacements > 0) {
    writeFileSync(file, src);
    console.log(`  ✓ ${file.slice(ROOT.length + 1)}  (${fileReplacements} replacements)`);
    totalFiles++;
    totalReplacements += fileReplacements;
  }
}

console.log(`\nDone. ${totalReplacements} replacements across ${totalFiles} files.`);
