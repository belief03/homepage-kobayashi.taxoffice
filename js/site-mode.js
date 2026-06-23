(function () {
  const STORAGE_KEY = "kobayashi-site-mode";
  const MODES = { pro: "pro", friendly: "friendly" };
  const THEME = {
    pro: "css/theme-c.css?v=20260623a",
    friendly: "css/theme-d.css?v=20260623a"
  };
  const HOME = {
    pro: "index.html",
    friendly: "index-friendly.html"
  };
  const PRO_ONLY = new Set(["index.html", "office.html"]);
  const FRIENDLY_ONLY = new Set([
    "index-friendly.html",
    "pricing.html",
    "news.html",
    "for-you.html"
  ]);
  const NAV = {
    pro: [
      { href: "index.html", label: "ホーム" },
      { href: "about.html", label: "事業概要" },
      { href: "services.html", label: "サービス" },
      { href: "profile.html", label: "プロフィール" },
      { href: "office.html", label: "アクセス" },
      { href: "contact.html", label: "お問い合わせ" }
    ],
    friendly: [
      { href: "index-friendly.html", label: "ホーム" },
      { href: "profile.html", label: "プロフィール" },
      { href: "services.html", label: "サービス" },
      { href: "pricing.html", label: "料金" },
      { href: "contact.html", label: "お問い合わせ" }
    ]
  };

  function currentFile() {
    const path = window.location.pathname;
    const file = path.slice(path.lastIndexOf("/") + 1);
    return file || "index.html";
  }

  function modeFromQuery() {
    const value = new URLSearchParams(window.location.search).get("mode");
    if (value === MODES.friendly || value === MODES.pro) {
      return value;
    }
    return null;
  }

  function getMode() {
    const file = currentFile();
    const fromQuery = modeFromQuery();
    if (fromQuery) {
      return fromQuery;
    }
    if (PRO_ONLY.has(file)) {
      return MODES.pro;
    }
    if (FRIENDLY_ONLY.has(file)) {
      return MODES.friendly;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === MODES.friendly || stored === MODES.pro) {
      return stored;
    }
    return MODES.pro;
  }

  function setMode(mode) {
    localStorage.setItem(STORAGE_KEY, mode === MODES.friendly ? MODES.friendly : MODES.pro);
  }

  function isHomePage(file) {
    return file === "index.html" || file === "index-friendly.html";
  }

  function navItemsFor(mode) {
    const items = NAV[mode].map((item) => ({ ...item }));
    if (mode === MODES.friendly && currentFile() === "news.html") {
      items.splice(4, 0, { href: "news.html", label: "NEWS" });
    }
    return items;
  }

  function renderLinkList(selector, mode) {
    const list = document.querySelector(selector);
    if (!list) return;
    const file = currentFile();
    const items = navItemsFor(mode);
    list.innerHTML = items
      .map((item) => {
        const isCurrent = file === item.href;
        const aria = isCurrent ? ' aria-current="page"' : "";
        return `<li><a class="${selector.includes("footer") ? "footer__nav-link" : "nav__link"}" href="${item.href}"${aria}>${item.label}</a></li>`;
      })
      .join("");
  }

  function renderNav(mode) {
    renderLinkList(".nav__list", mode);
  }

  function renderFooter(mode) {
    renderLinkList(".footer__nav-list", mode);
  }

  function applyTheme(mode) {
    const link = document.getElementById("site-theme-link");
    if (link) {
      link.href = mode === MODES.friendly ? THEME.friendly : THEME.pro;
    }
    document.documentElement.classList.toggle("site-mode-friendly", mode === MODES.friendly);
    document.documentElement.classList.toggle("site-mode-pro", mode !== MODES.friendly);
  }

  function redirectHomeIfNeeded(mode) {
    const file = currentFile();
    if (mode === MODES.friendly && file === "index.html") {
      window.location.replace(HOME.friendly + window.location.search + window.location.hash);
      return true;
    }
    if (mode === MODES.pro && file === "index-friendly.html") {
      window.location.replace(HOME.pro + window.location.search + window.location.hash);
      return true;
    }
    return false;
  }

  function homeHref(mode) {
    return mode === MODES.friendly ? HOME.friendly : HOME.pro;
  }

  const mode = getMode();
  if (redirectHomeIfNeeded(mode)) {
    return;
  }
  applyTheme(mode);

  function initUi() {
    const activeMode = getMode();
    applyBodyClass(activeMode);
    renderNav(activeMode);
    renderFooter(activeMode);
    document.querySelectorAll(".header__logo").forEach((el) => {
      el.setAttribute("href", homeHref(activeMode));
    });
    mountToggle(activeMode);
    document.documentElement.classList.add("site-ready");
  }

  function applyBodyClass(mode) {
    const body = document.body;
    if (!body) return;
    body.classList.toggle("page-friendly", mode === MODES.friendly);
  }

  function mountToggle(activeMode) {
    const headerInner = document.querySelector(".header__inner");
    if (!headerInner || headerInner.querySelector(".site-mode")) return;

    const wrap = document.createElement("div");
    wrap.className = "site-mode";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "サイト表示モード");

    const btnPro = document.createElement("button");
    btnPro.type = "button";
    btnPro.className = "site-mode__btn";
    btnPro.dataset.mode = MODES.pro;
    btnPro.textContent = "プロ";
    btnPro.setAttribute("aria-pressed", activeMode === MODES.pro ? "true" : "false");

    const btnFriendly = document.createElement("button");
    btnFriendly.type = "button";
    btnFriendly.className = "site-mode__btn";
    btnFriendly.dataset.mode = MODES.friendly;
    btnFriendly.textContent = "相談しやすい";
    btnFriendly.setAttribute("aria-pressed", activeMode === MODES.friendly ? "true" : "false");

    wrap.append(btnPro, btnFriendly);
    headerInner.appendChild(wrap);

    wrap.addEventListener("click", (event) => {
      const btn = event.target.closest(".site-mode__btn");
      if (!btn || btn.dataset.mode === getMode()) return;
      switchMode(btn.dataset.mode);
    });
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    const file = currentFile();
    if (isHomePage(file)) {
      window.location.href = homeHref(nextMode) + window.location.search + window.location.hash;
      return;
    }
    applyTheme(nextMode);
    applyBodyClass(nextMode);
    renderNav(nextMode);
    renderFooter(nextMode);
    document.querySelectorAll(".header__logo").forEach((el) => {
      el.setAttribute("href", homeHref(nextMode));
    });
    document.querySelectorAll(".site-mode__btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.mode === nextMode ? "true" : "false");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUi);
  } else {
    initUi();
  }
})();
