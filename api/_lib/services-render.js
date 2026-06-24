/* =========================================================
   services-render.js — shared rendering logic for packages.html,
   add-ons.html, and js/inquiry-section.js from a services data object.

   Used by:
     • scripts/build-services.mjs (CLI build)
     • api/admin/services.js     (CMS save endpoint)

   The logic was originally inlined in scripts/build-services.mjs.
   Extracted here so the Vercel function can produce the same output
   without shelling out to node.
   ========================================================= */

export function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
export function fmtPrice(n) {
  return Number(n).toLocaleString("en-US");
}

/* ---------- packages.html PACKAGES_GRID ---------- */
export function renderPackagesGrid(packages) {
  return packages.map(p => {
    const articleClass = p.featured ? "package package--featured reveal" : "package reveal";
    const ctaClass = p.featured ? "btn btn--brass" : "btn btn--outline";
    const indicatorStyle = p.featured ? ` style="color:var(--champagne);"` : "";
    const tag = p.featured && p.featuredTag
      ? `\n          <span class="package__tag">${esc(p.featuredTag)}</span>`
      : "";
    const features = p.features.map(f => `            <li>${esc(f)}</li>`).join("\n");
    return `        <!-- ${esc(p.name).toUpperCase()} -->
        <article class="${articleClass}" data-package-card="${esc(p.id)}" data-name="${esc(p.name)}" data-price="${p.price}" data-desc="${esc(p.shortDesc)}">${tag}
          <h2 class="package__name">${esc(p.name)}</h2>
          <p class="package__tagline">${esc(p.tagline)}</p>
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

/* ---------- packages.html EVERY_PACKAGE list ---------- */
export function renderEveryPackageList(everyPackageIncludes) {
  return everyPackageIncludes.map(item => `          <li>${esc(item)}</li>`).join("\n");
}

/* ---------- add-ons.html addon card ---------- */
/* Optional price-set quantity picker. When an add-on has priceSets, guests
   choose how many of each set — quantities combine (e.g. 1×50 + 1×100 = 150).
   The card's price + cart entry follow the combined selection. */
function renderAddonVariants(a) {
  if (!Array.isArray(a.priceSets) || a.priceSets.length < 1) return "";
  const rows = a.priceSets.map((ps, idx) =>
    `              <div class="addon__variant-row">
                <span class="addon__variant-name">${esc(ps.label)} — $${fmtPrice(ps.price)}</span>
                <div class="addon__qty" data-qty data-variant-label="${esc(ps.label)}" data-variant-price="${ps.price}" data-variant-units="${ps.units || 0}">
                  <button type="button" class="addon__qty-btn" data-qty-dec aria-label="Decrease ${esc(ps.label)}">−</button>
                  <span class="addon__qty-val" data-qty-val>${idx === 0 ? 1 : 0}</span>
                  <button type="button" class="addon__qty-btn" data-qty-inc aria-label="Increase ${esc(ps.label)}">+</button>
                </div>
              </div>`
  ).join("\n");
  return `
            <div class="addon__variants addon__variants--qty" data-variant-qty>
${rows}
            </div>`;
}

function renderAddonCard(a) {
  const displayName = a.displayName || a.name;
  return `          <article class="addon reveal" data-addon-card="${esc(a.id)}" data-name="${esc(a.name)}" data-price="${a.price}" data-desc="${esc(a.description)}">
            <div class="addon__header">
              <h3 class="addon__name">${esc(displayName)}</h3>
              <div><span class="addon__price">$${fmtPrice(a.price)}</span><span class="addon__price-meta">${esc(a.priceMeta)}</span></div>
            </div>
            <p class="addon__copy">${esc(a.description)}.</p>${renderAddonVariants(a)}
            <button type="button" class="addon__toggle" data-toggle-addon>Add to List</button>
          </article>`;
}

/* ---------- add-ons.html container (groups consecutive 'trio' layouts) ---------- */
export function renderAddonsContainer(addonCategories) {
  const out = [];
  let i = 0;
  while (i < addonCategories.length) {
    const c = addonCategories[i];
    if (c.layout === "trio") {
      const trio = [];
      while (i < addonCategories.length && addonCategories[i].layout === "trio") {
        trio.push(addonCategories[i]);
        i++;
      }
      const trioInner = trio.map(tc => `        <div class="addon-category reveal">
          <h2 class="addon-category__label">${esc(tc.label)}</h2>
          <div class="addons">
${tc.addons.map(renderAddonCard).join("\n")}
          </div>
        </div>`).join("\n\n");
      out.push(`      <!-- ===== TRIO: ${trio.map(t => t.label).join(" + ")} ===== -->
      <div class="addon-category-trio">
${trioInner}
      </div>`);
    } else {
      const useTwoCol = c.addons.length >= 2 && c.layout !== "auto";
      const gridCls = useTwoCol ? "addons addons--2col" : "addons";
      const labelComment = `(${c.addons.length === 4 ? "2x2" : c.addons.length + " items"})`;
      out.push(`      <!-- ===== ${c.label.toUpperCase()} ${labelComment} ===== -->
      <div class="addon-category reveal">
        <h2 class="addon-category__label">${esc(c.label)}</h2>
        <div class="${gridCls}">
${c.addons.map(renderAddonCard).join("\n")}
        </div>
      </div>`);
      i++;
    }
  }
  return out.join("\n\n");
}

/* ---------- inquiry-section.js PACKAGES + ADDONS const arrays ---------- */
export function renderInquiryArrays(data) {
  const pkgs = data.packages.map(p =>
    `    { id: "${p.id}", name: "${p.name}", price: ${p.price}, desc: ${JSON.stringify(p.shortDesc)} }`
  ).join(",\n");

  const allAddons = [];
  for (const c of data.addonCategories) {
    for (const a of c.addons) {
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

/* ---------- Surgical marker replacement (HTML or JS) ---------- */
export function replaceMarker(source, marker, replacement) {
  const reHtml = new RegExp(`(${marker}:START\\s*-->)([\\s\\S]*?)(<!--\\s*${marker}:END)`, "i");
  const reJs   = new RegExp(`(${marker}:START\\s*\\n)([\\s\\S]*?)(\\s*//\\s*${marker}:END)`, "i");
  if (reHtml.test(source))
    return source.replace(reHtml, (_, s, _content, e) => `${s}\n${replacement}\n      ${e}`);
  if (reJs.test(source))
    return source.replace(reJs, (_, s, _content, e) => `${s}${replacement}${e}`);
  return source; // marker not found — return unchanged
}
