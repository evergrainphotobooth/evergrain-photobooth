/* =========================================================
   Evergrain Photobooth — Package List (Cart)
   Single source of truth for selected package + add-ons
   Persists in localStorage so it survives page navigation
   ========================================================= */

const STORAGE_KEY = "evergrain-package-list";

const Cart = {
  state: { package: null, addons: [] },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.state = JSON.parse(raw);
    } catch (e) {
      this.state = { package: null, addons: [] };
    }
    if (!this.state.addons) this.state.addons = [];
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  },

  setPackage(pkg, opts = {}) {
    // Only one package allowed; replaces existing
    this.state.package = pkg;
    this.save();
    this.render();
    if (!opts.silent) {
      this.notify(`${pkg.name} added to your list`);
      this.open();
    }
  },

  removePackage(opts = {}) {
    this.state.package = null;
    this.save();
    this.render();
  },

  // Add an add-on, no-op if already present. Used by inquiry-form checkboxes.
  addAddon(addon, opts = {}) {
    if (this.state.addons.find(a => a.id === addon.id)) return;
    this.state.addons.push(addon);
    this.save();
    this.render();
    if (!opts.silent) this.notify(`${addon.name} added`);
  },

  // Used by add-on cards (the "Add to List" button toggles in/out).
  toggleAddon(addon, opts = {}) {
    const existing = this.state.addons.find(a => a.id === addon.id);
    if (existing) {
      this.state.addons = this.state.addons.filter(a => a.id !== addon.id);
      if (!opts.silent) this.notify(`${addon.name} removed`);
    } else {
      this.state.addons.push(addon);
      if (!opts.silent) this.notify(`${addon.name} added`);
    }
    this.save();
    this.render();
  },

  removeAddon(id, opts = {}) {
    const addon = this.state.addons.find(a => a.id === id);
    this.state.addons = this.state.addons.filter(a => a.id !== id);
    this.save();
    this.render();
    if (addon && !opts.silent) this.notify(`${addon.name} removed`);
  },

  clear() {
    this.state = { package: null, addons: [] };
    this.save();
    this.render();
  },

  total() {
    let total = 0;
    if (this.state.package) total += Number(this.state.package.price) || 0;
    this.state.addons.forEach(a => { total += Number(a.price) || 0; });
    return total;
  },

  itemCount() {
    return (this.state.package ? 1 : 0) + this.state.addons.length;
  },

  formatPrice(n) {
    return "$" + Number(n).toLocaleString("en-US");
  },

  /* ---------- Rendering ---------- */
  render() {
    this.renderCount();
    this.renderPanel();
    this.renderSelections();
    this.renderInquirySummary();
    this.renderSelectedBanner();
    this.renderInquiryForm();
  },

  renderCount() {
    document.querySelectorAll(".nav__cart-count").forEach(el => {
      const count = this.itemCount();
      el.textContent = count;
      el.setAttribute("data-count", String(count));
    });
  },

  renderPanel() {
    const body = document.querySelector("[data-cart-body]");
    const totalEl = document.querySelector("[data-cart-total]");
    const footerEl = document.querySelector("[data-cart-footer]");
    if (!body) return;

    const { package: pkg, addons } = this.state;

    if (!pkg && addons.length === 0) {
      body.innerHTML = `
        <div class="cart__empty">
          <p>Your Package List is empty.</p>
          <p style="font-size:0.9rem;">Start by choosing a package, then customize with add-ons.</p>
          <a href="/packages" class="btn btn--primary btn--sm">Browse Packages</a>
        </div>`;
      if (footerEl) footerEl.style.display = "none";
      return;
    }

    if (footerEl) footerEl.style.display = "";

    let html = "";

    if (pkg) {
      html += `
        <div class="cart__section">
          <div class="cart__section-label">
            <span>Package</span>
            <a href="/packages" style="color:var(--brass);font-size:0.7rem;letter-spacing:0.18em;">Change</a>
          </div>
          <div class="cart__item">
            <div>
              <h4 class="cart__item-title">${pkg.name}</h4>
              <p class="cart__item-desc">${pkg.desc || ""}</p>
              <button type="button" class="cart__item-remove" data-remove-package>Remove</button>
            </div>
            <div class="cart__item-price">${this.formatPrice(pkg.price)}</div>
          </div>
        </div>`;
    } else {
      html += `
        <div class="cart__section">
          <div class="cart__section-label"><span>Package</span></div>
          <p style="font-size:0.9rem;color:var(--bark);margin:0 0 0.75rem;">No package selected yet.</p>
          <a href="/packages" class="btn btn--outline btn--sm">Choose a Package</a>
        </div>`;
    }

    if (addons.length > 0) {
      html += `
        <div class="cart__section">
          <div class="cart__section-label">
            <span>Add-Ons (${addons.length})</span>
            <a href="/add-ons" style="color:var(--brass);font-size:0.7rem;letter-spacing:0.18em;">Edit</a>
          </div>`;
      addons.forEach(a => {
        html += `
          <div class="cart__item">
            <div>
              <h4 class="cart__item-title">${a.name}</h4>
              <p class="cart__item-desc">${a.desc || ""}</p>
              <button type="button" class="cart__item-remove" data-remove-addon="${a.id}">Remove</button>
            </div>
            <div class="cart__item-price">${this.formatPrice(a.price)}</div>
          </div>`;
      });
      html += `</div>`;
    }

    body.innerHTML = html;
    if (totalEl) totalEl.textContent = this.formatPrice(this.total());

    body.querySelectorAll("[data-remove-addon]").forEach(btn => {
      btn.addEventListener("click", () => this.removeAddon(btn.getAttribute("data-remove-addon")));
    });
    const removePkgBtn = body.querySelector("[data-remove-package]");
    if (removePkgBtn) removePkgBtn.addEventListener("click", () => this.removePackage());
  },

  /* Mark selected package + add-on cards across pages */
  renderSelections() {
    document.querySelectorAll("[data-package-card]").forEach(card => {
      const id = card.getAttribute("data-package-card");
      const isSelected = this.state.package && this.state.package.id === id;
      card.classList.toggle("is-selected", !!isSelected);
      const btn = card.querySelector("[data-add-package]");
      if (btn) btn.textContent = isSelected ? "Selected" : "Add to List";
    });
    document.querySelectorAll("[data-addon-card]").forEach(card => {
      const id = card.getAttribute("data-addon-card");
      const isSelected = this.state.addons.some(a => a.id === id);
      card.classList.toggle("is-selected", isSelected);
      const btn = card.querySelector("[data-toggle-addon]");
      if (btn) btn.textContent = isSelected ? "Added" : "Add to List";
    });
  },

  /* Two-way bind: reflect cart state into the inquiry form's
     package dropdown + add-on checkboxes. */
  renderInquiryForm() {
    const select = document.querySelector("[data-inquiry-form] [name='packageInterest']");
    if (select) {
      const pkg = this.state.package;
      if (pkg) {
        const match = Array.from(select.options).find(opt => opt.dataset.pkgId === pkg.id);
        if (match) select.value = match.value;
      }
      // If no package in cart, leave the dropdown as-is to preserve user's choice
      // (they may have set "Not sure yet" deliberately).
    }
    document.querySelectorAll("[data-inquiry-form] [name='interestedAddons']").forEach(cb => {
      cb.checked = this.state.addons.some(a => a.id === cb.dataset.addonId);
    });
  },

  /* Wire change events on the inquiry form so user selections flow back to cart.
     Called once from init() — the form is in the DOM by then since
     inquiry-section.js runs synchronously before cart.js. */
  bindInquiryFormSync() {
    const select = document.querySelector("[data-inquiry-form] [name='packageInterest']");
    if (select) {
      select.addEventListener("change", () => {
        const opt = select.options[select.selectedIndex];
        const pkgId = opt.dataset.pkgId;
        if (pkgId) {
          this.setPackage({
            id: pkgId,
            name: opt.value,
            price: Number(opt.dataset.pkgPrice),
            desc: opt.dataset.pkgDesc || ""
          }, { silent: true });
        } else if (opt.value === "Not sure yet" && this.state.package) {
          // Explicit "Not sure yet" clears the cart package
          this.removePackage();
        }
        // Empty default ("Select one…") is a no-op — preserves cart state
      });
    }

    document.querySelectorAll("[data-inquiry-form] [name='interestedAddons']").forEach(cb => {
      cb.addEventListener("change", () => {
        const addon = {
          id: cb.dataset.addonId,
          name: cb.value,
          price: Number(cb.dataset.addonPrice),
          desc: cb.dataset.addonDesc || ""
        };
        if (cb.checked) {
          this.addAddon(addon, { silent: true });
        } else {
          this.removeAddon(addon.id, { silent: true });
        }
      });
    });
  },

  /* Render selected-package banner on add-ons page */
  renderSelectedBanner() {
    const banner = document.querySelector("[data-selected-package-banner]");
    const noPackageBanner = document.querySelector("[data-no-package-banner]");
    if (!banner) return;
    if (this.state.package) {
      banner.classList.remove("is-hidden");
      if (noPackageBanner) noPackageBanner.style.display = "none";
      const nameEl = banner.querySelector("[data-selected-package-name]");
      if (nameEl) nameEl.textContent = this.state.package.name;
    } else {
      banner.classList.add("is-hidden");
      if (noPackageBanner) noPackageBanner.style.display = "";
    }
  },

  /* Render the cart summary block inside the inquiry form (homepage) */
  renderInquirySummary() {
    const summaryEl = document.querySelector("[data-inquiry-summary]");
    const hiddenPkg = document.querySelector("[data-hidden-package]");
    const hiddenAddons = document.querySelector("[data-hidden-addons]");
    const hiddenTotal = document.querySelector("[data-hidden-total]");

    if (hiddenPkg) hiddenPkg.value = this.state.package ? `${this.state.package.name} (${this.formatPrice(this.state.package.price)})` : "None selected";
    if (hiddenAddons) hiddenAddons.value = this.state.addons.length
      ? this.state.addons.map(a => `${a.name} (${this.formatPrice(a.price)})`).join(" • ")
      : "None selected";
    if (hiddenTotal) hiddenTotal.value = this.formatPrice(this.total());

    if (!summaryEl) return;

    if (!this.state.package && this.state.addons.length === 0) {
      summaryEl.innerHTML = `
        <h4>Your Package List</h4>
        <p style="margin:0;font-size:0.95rem;color:var(--bark);">No items added yet — feel free to submit the form below, or <a href="/packages">browse our packages</a> first.</p>`;
      return;
    }

    let html = `<h4>Your Package List</h4><ul>`;
    if (this.state.package) {
      html += `<li><span>${this.state.package.name}</span><span>${this.formatPrice(this.state.package.price)}</span></li>`;
    }
    this.state.addons.forEach(a => {
      html += `<li><span>${a.name}</span><span>${this.formatPrice(a.price)}</span></li>`;
    });
    html += `</ul>
      <div class="inquiry-cart-summary__total">
        <span class="form__label">Estimated Total</span>
        <strong>${this.formatPrice(this.total())}</strong>
      </div>`;
    summaryEl.innerHTML = html;
  },

  /* ---------- Panel open/close ---------- */
  open() {
    document.querySelector("[data-cart]")?.classList.add("is-open");
    document.querySelector("[data-cart-overlay]")?.classList.add("is-open");
    document.body.style.overflow = "hidden";
  },

  close() {
    document.querySelector("[data-cart]")?.classList.remove("is-open");
    document.querySelector("[data-cart-overlay]")?.classList.remove("is-open");
    document.body.style.overflow = "";
  },

  /* ---------- Toast ---------- */
  notify(msg) {
    let toast = document.querySelector(".cart-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "cart-toast";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>✓</span> ${msg}`;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
  },

  /* ---------- Init ---------- */
  init() {
    this.load();

    document.querySelectorAll("[data-cart-toggle]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        const isOpen = document.querySelector("[data-cart]")?.classList.contains("is-open");
        isOpen ? this.close() : this.open();
      });
    });
    document.querySelector("[data-cart-close]")?.addEventListener("click", () => this.close());
    document.querySelector("[data-cart-overlay]")?.addEventListener("click", () => this.close());

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") this.close();
    });

    // Add-to-list buttons on Packages page
    document.querySelectorAll("[data-add-package]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        const card = btn.closest("[data-package-card]");
        if (!card) return;
        const pkg = {
          id: card.getAttribute("data-package-card"),
          name: card.getAttribute("data-name"),
          price: Number(card.getAttribute("data-price")),
          desc: card.getAttribute("data-desc") || ""
        };
        this.setPackage(pkg);
      });
    });

    // Toggle add-on buttons on Add-Ons page
    document.querySelectorAll("[data-toggle-addon]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        const card = btn.closest("[data-addon-card]");
        if (!card) return;
        const addon = {
          id: card.getAttribute("data-addon-card"),
          name: card.getAttribute("data-name"),
          price: Number(card.getAttribute("data-price")),
          desc: card.getAttribute("data-desc") || ""
        };
        this.toggleAddon(addon);
      });
    });

    // Clear cart button
    document.querySelector("[data-cart-clear]")?.addEventListener("click", () => {
      if (confirm("Clear your Package List?")) this.clear();
    });

    // Request quote — close cart, scroll to local #inquiry (every page has one)
    document.querySelectorAll("[data-cart-checkout]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        this.close();
        const target = document.getElementById("inquiry");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    // Two-way bind the inquiry form to cart state
    this.bindInquiryFormSync();

    this.render();
  }
};

document.addEventListener("DOMContentLoaded", () => Cart.init());
window.EvergrainCart = Cart;
