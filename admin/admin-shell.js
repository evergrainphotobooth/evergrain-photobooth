/* =========================================================
   Evergrain CMS — Admin shell partial
   Injects the sidebar + topbar into every admin page.
   Looks for: <div data-admin-shell data-page="dashboard"></div>
   ========================================================= */

(function () {
  const root = document.querySelector("[data-admin-shell]");
  if (!root) return;

  const currentPage = root.getAttribute("data-page") || "";
  const pageTitle = root.getAttribute("data-title") || "";

  // Nav items — keep in sync across pages
  const NAV = [
    { id: "dashboard", label: "Dashboard",            href: "/admin/dashboard", icon: iconDashboard() },
    { id: "pages",     label: "Pages",                href: "/admin/pages",     icon: iconPages() },
    { id: "services",  label: "Our Services",         href: "/admin/services",  icon: iconServices() },
    { id: "assets",    label: "Assets",               href: "/admin/assets",    icon: iconAssets() },
    { id: "inquiries", label: "Inquiries",            href: "/admin/inquiries", icon: iconInquiries() },
    { id: "settings",  label: "General Information",  href: "/admin/settings",  icon: iconSettings() },
  ];

  const navHtml = NAV.map(n => `
    <a class="admin-nav__item ${n.id === currentPage ? "is-active" : ""}" href="${n.href}">
      ${n.icon}
      <span>${n.label}</span>
    </a>
  `).join("");

  root.innerHTML = `
    <div class="admin">
      <aside class="admin-sidebar">
        <div class="admin-sidebar__brand">
          <img src="/assets/logos/FullLogo_White.svg" alt="Evergrain Photobooth" class="admin-sidebar__logo" />
          <div class="admin-sidebar__label">CMS</div>
        </div>
        <nav class="admin-nav" aria-label="Admin sections">
          ${navHtml}
        </nav>
        <div class="admin-sidebar__footer">
          <span><span class="admin-sidebar__user" data-admin-user>—</span></span>
          <button type="button" class="admin-sidebar__logout" data-admin-logout>Log out</button>
        </div>
      </aside>
      <main class="admin-main">
        <header class="admin-topbar">
          <h1 class="admin-topbar__title">${pageTitle}</h1>
          <div class="admin-topbar__actions" data-admin-topbar-actions></div>
        </header>
        <div class="admin-content" data-admin-content></div>
      </main>
    </div>
  `;

  // Move the original page content into the .admin-content area
  const originalContent = document.querySelector("[data-admin-page-content]");
  const target = root.querySelector("[data-admin-content]");
  if (originalContent && target) {
    target.appendChild(originalContent);
    originalContent.hidden = false;
  }

  // Hydrate logged-in user + handle logout
  fetch("/api/admin/me").then(async r => {
    if (!r.ok) { location.href = "/admin?next=" + encodeURIComponent(location.pathname); return; }
    const { user } = await r.json();
    const slot = root.querySelector("[data-admin-user]");
    if (slot) slot.textContent = user;
  }).catch(() => {
    location.href = "/admin?next=" + encodeURIComponent(location.pathname);
  });

  root.querySelector("[data-admin-logout]")?.addEventListener("click", async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    location.href = "/admin";
  });

  /* ---------- Inline SVG icons ---------- */
  function iconDashboard() {
    return `<svg class="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`;
  }
  function iconPages() {
    return `<svg class="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>`;
  }
  function iconAssets() {
    return `<svg class="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`;
  }
  function iconInquiries() {
    return `<svg class="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
  }
  function iconSettings() {
    return `<svg class="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
  }
  function iconServices() {
    return `<svg class="admin-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7L12 3 4 7v10l8 4 8-4V7z"/><path d="M12 12L4 7"/><path d="M12 12l8-5"/><path d="M12 12v9"/></svg>`;
  }
})();
