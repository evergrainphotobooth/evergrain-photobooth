/* =========================================================
   build-services.mjs — regenerate the data-driven sections of:
     • packages.html         (3 package cards + every-package list)
     • add-ons.html          (categorized add-on cards)
     • js/inquiry-section.js (PACKAGES + ADDONS const arrays)

   Source of truth: data/services.json
   Replacement: marker comments delimit each section.
     HTML:  <!-- CMS:PACKAGES_GRID:START --> … <!-- CMS:PACKAGES_GRID:END -->
     JS:    // CMS:INQUIRY_DATA:START … // CMS:INQUIRY_DATA:END

   Run during Vercel build via `npm run build`.
   ========================================================= */

import { readFileSync, writeFileSync } from "node:fs";

const DATA = JSON.parse(readFileSync("data/services.json", "utf8"));

/* ---------- Helpers ---------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const escAttr = esc;
const fmtPrice = (n) => Number(n).toLocaleString("en-US");

function replaceMarker(source, name, marker, replacement) {
  const re = new RegExp(`(${marker}:START\\s*-->)([\\s\\S]*?)(<!--\\s*${marker}:END)`, "i");
  const reJs = new RegExp(`(${marker}:START\\s*\\n)([\\s\\S]*?)(\\s*//\\s*${marker}:END)`, "i");
  // Use REPLACEMENT FUNCTION (not string) so $-sequences in user data like
  // "$150 / hour" aren't interpreted as backreferences.
  if (re.test(source))   return source.replace(re,   (_, s, _content, e) => `${s}\n${replacement}\n      ${e}`);
  if (reJs.test(source)) return source.replace(reJs, (_, s, _content, e) => `${s}${replacement}${e}`);
  console.warn(`  ! Marker ${marker} not found in ${name} — skipping`);
  return source;
}

/* ---------- 1. packages.html — packages grid + every-package list ---------- */
function buildPackagesGrid() {
  return DATA.packages.map(p => {
    const articleClass = p.featured ? "package package--featured reveal" : "package reveal";
    const ctaClass = p.featured ? "btn btn--brass" : "btn btn--outline";
    const indicatorStyle = p.featured ? ` style="color:var(--champagne);"` : "";
    const tag = p.featured && p.featuredTag ? `\n          <span class="package__tag">${esc(p.featuredTag)}</span>` : "";
    const features = p.features.map(f => `            <li>${esc(f)}</li>`).join("\n");
    return `        <!-- ${esc(p.name).toUpperCase()} -->
        <article class="${articleClass}" data-package-card="${escAttr(p.id)}" data-name="${escAttr(p.name)}" data-price="${p.price}" data-desc="${escAttr(p.shortDesc)}">${tag}
          <h2 class="package__name">${esc(p.name)}</h2>
          <p class="package__tagline">${esc(p.tagline)}</p>
          <p class="package__starting">Starting at</p>
          <div class="package__price">
            <span class="package__price-amount"><sup>$</sup>${fmtPrice(p.price)}</span>
            <div class="package__price-meta">${esc(p.priceDescription)}</div>
          </div>
          <ul class="package__features">
${features}
          </ul>
          <button type="button" class="${ctaClass} package__cta" data-add-package>Add to List</button>
          <div class="package__selected-indicator"${indicatorStyle}>✓ Added to your list</div>
        </article>`;
  }).join("\n\n");
}

function buildEveryPackageList() {
  return DATA.everyPackageIncludes.map(item => `          <li>${esc(item)}</li>`).join("\n");
}

/* ---------- 2. add-ons.html — categorized addon cards ---------- */
/* Optional price-set quantity picker. When an add-on has priceSets, guests
   choose how many of each set — quantities combine (e.g. 1×50 + 1×100 = 150).
   The card's price + cart entry follow the combined selection. */
function buildAddonVariants(a) {
  if (!Array.isArray(a.priceSets) || a.priceSets.length < 1) return "";
  const rows = a.priceSets.map((ps, idx) =>
    `              <div class="addon__variant-row">
                <span class="addon__variant-name">${esc(ps.label)} — $${fmtPrice(ps.price)}</span>
                <div class="addon__qty" data-qty data-variant-label="${escAttr(ps.label)}" data-variant-price="${ps.price}" data-variant-units="${ps.units || 0}">
                  <button type="button" class="addon__qty-btn" data-qty-dec aria-label="Decrease ${escAttr(ps.label)}">−</button>
                  <span class="addon__qty-val" data-qty-val>${idx === 0 ? 1 : 0}</span>
                  <button type="button" class="addon__qty-btn" data-qty-inc aria-label="Increase ${escAttr(ps.label)}">+</button>
                </div>
              </div>`
  ).join("\n");
  return `
            <div class="addon__variants addon__variants--qty" data-variant-qty>
${rows}
            </div>`;
}

function buildAddonCard(a) {
  const displayName = a.displayName || a.name;
  const dataDescAttr = escAttr(a.description);
  return `          <article class="addon reveal" data-addon-card="${escAttr(a.id)}" data-name="${escAttr(a.name)}" data-price="${a.price}" data-desc="${dataDescAttr}">
            <div class="addon__header">
              <h3 class="addon__name">${esc(displayName)}</h3>
              <div><span class="addon__price">$${fmtPrice(a.price)}</span><span class="addon__price-meta">${esc(a.priceMeta)}</span></div>
            </div>
            <p class="addon__copy">${esc(a.description)}.</p>${buildAddonVariants(a)}
            <button type="button" class="addon__toggle" data-toggle-addon>Add to List</button>
          </article>`;
}

function buildAddonsContainer() {
  const out = [];
  let i = 0;
  while (i < DATA.addonCategories.length) {
    const c = DATA.addonCategories[i];
    if (c.layout === "trio") {
      // Collect all consecutive 'trio' categories
      const trio = [];
      while (i < DATA.addonCategories.length && DATA.addonCategories[i].layout === "trio") {
        trio.push(DATA.addonCategories[i]);
        i++;
      }
      const trioInner = trio.map(tc => `        <div class="addon-category reveal">
          <h2 class="addon-category__label">${esc(tc.label)}</h2>
          <div class="addons">
${tc.addons.map(buildAddonCard).join("\n")}
          </div>
        </div>`).join("\n\n");
      out.push(`      <!-- ===== TRIO: ${trio.map(t => t.label).join(" + ")} ===== -->
      <div class="addon-category-trio">
${trioInner}
      </div>`);
    } else {
      // Full layout: 2x2-style grid (`addons addons--2col`) when there are
      // 2+ addons, plain `addons` for solo. Trio inner uses plain `addons`.
      const useTwoCol = c.addons.length >= 2 && c.layout !== "auto";
      const gridCls = useTwoCol ? "addons addons--2col" : "addons";
      const labelComment = `(${c.addons.length === 4 ? "2x2" : c.addons.length + " items"})`;
      out.push(`      <!-- ===== ${c.label.toUpperCase()} ${labelComment} ===== -->
      <div class="addon-category reveal">
        <h2 class="addon-category__label">${esc(c.label)}</h2>
        <div class="${gridCls}">
${c.addons.map(buildAddonCard).join("\n")}
        </div>
      </div>`);
      i++;
    }
  }
  return out.join("\n\n");
}

/* ---------- 3. inquiry-section.js — PACKAGES + ADDONS arrays ---------- */
function buildInquiryArrays() {
  const pkgs = DATA.packages.map(p =>
    `    { id: "${p.id}", name: "${p.name}", price: ${p.price}, desc: ${JSON.stringify(p.shortDesc)} }`
  ).join(",\n");

  // Flatten all addons from all categories
  const allAddons = [];
  for (const c of DATA.addonCategories) {
    for (const a of c.addons) {
      // Strip trailing period if any for the desc
      const shortDesc = a.description.replace(/\.$/, "");
      allAddons.push(`    { id: "${a.id}", name: ${JSON.stringify(a.name)}, price: ${a.price}, desc: ${JSON.stringify(shortDesc)} }`);
    }
  }
  return `  const PACKAGES = [
${pkgs}
  ];

  const ADDONS = [
${allAddons.join(",\n")}
  ];`;
}

/* ---------- Run regenerations ---------- */
function update(filePath, marker, replacement) {
  const src = readFileSync(filePath, "utf8");
  const out = replaceMarker(src, filePath, marker, replacement);
  if (out !== src) {
    writeFileSync(filePath, out);
    console.log(`  ✓ ${filePath} — ${marker}`);
  } else {
    console.log(`  · ${filePath} — ${marker} (no change)`);
  }
}

console.log("Regenerating data-driven sections from data/services.json…\n");
update("packages.html", "CMS:PACKAGES_GRID", buildPackagesGrid());
update("packages.html", "CMS:EVERY_PACKAGE", buildEveryPackageList());
update("add-ons.html", "CMS:ADDONS_CONTAINER", buildAddonsContainer());
update("js/inquiry-section.js", "CMS:INQUIRY_DATA", buildInquiryArrays());
console.log("\nDone.");
