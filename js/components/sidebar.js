
const navItems = [
  {
    id: "dashboard",
    label: "Yhteenveto",
    href: "/dashboard.html",
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
             <rect x="1" y="2" width="14" height="12" rx="2"/>
           </svg>`,
  },
  {
    id: "trends",
    label: "Trendit",
    href: "/trends.html",
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
             <polyline points="2,11 5,7 9,9 14,4"/>
           </svg>`,
  },
  {
    id: "hrv",
    label: "HRV-analyysi",
    href: "/hrv.html",
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
             <polyline points="2,8 4,8 5,4 7,12 9,6 11,10 12,8 14,8"/>
           </svg>`,
  },
  {
    id: "professional",
    label: "Ammattilainen",
    href: "/professional.html",
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
             <circle cx="6" cy="5" r="3"/>
             <path d="M1 14c0-3 2.2-5 5-5h4c2.8 0 5 2 5 5"/>
           </svg>`,
  },
];

export function renderSidebar(activePage) {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  sidebar.innerHTML = `
        <div class="logo">
            <div class="logo-name">CardioRest</div>
            <div class="logo-sub">HRV-pohjainen unenlaatuseuranta</div>
        </div>
        <nav class="nav">
            <span class="nav-label">Potilas</span>
            ${navItems
              .map(
                (item) => `
                <a href="${item.href}" class="nav-item ${activePage === item.id ? "active" : ""}">
                    ${item.icon}
                    ${item.label}
                </a>
            `,
              )
              .join("")}
        </nav>
        <div class="sidebar-footer">
            <div class="user-chip">
                <div class="avatar">MM</div>
                <div class="user-info">
                    <div class="name">Matti Meikäläinen</div>
                    <div class="role">Potilas</div>
                </div>
            </div>
        </div>
    `;

  // Hamburger-logiikka
  const hamburger = document.getElementById("hamburger");
  const overlay = document.getElementById("sidebarOverlay");

  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("visible");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("visible");
    document.body.style.overflow = "";
  }

  hamburger?.addEventListener("click", openSidebar);
  overlay?.addEventListener("click", closeSidebar);

  // Sulje sidebar kun linkkiä klikataan mobiililla
  sidebar.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", closeSidebar);
  });
}
