(function () {
  const STORAGE_KEY = "kobayashi-site-mode";
  const MODES = { pro: "pro", friendly: "friendly" };
  const THEME = {
    pro: "css/theme-c.css?v=20260601d",
    friendly: "css/theme-d.css?v=20260601d"
  };
  const HOME = {
    pro: "index.html",
    friendly: "index-friendly.html"
  };

  function getMode() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === MODES.friendly || stored === MODES.pro) {
      return stored;
    }
    return currentFile() === "index-friendly.html" ? MODES.friendly : MODES.pro;
  }

  function setMode(mode) {
    localStorage.setItem(STORAGE_KEY, mode === MODES.friendly ? MODES.friendly : MODES.pro);
  }

  function currentFile() {
    const path = window.location.pathname;
    const file = path.slice(path.lastIndexOf("/") + 1);
    return file || "index.html";
  }

  function isHomePage(file) {
    return file === "index.html" || file === "index-friendly.html";
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

  /* --- ヘッドで実行（テーマ・ホームリダイレクト） --- */
  const mode = getMode();
  if (redirectHomeIfNeeded(mode)) {
    return;
  }
  applyTheme(mode);

  /* --- DOM 準備後（切替 UI・リンク更新） --- */
  function initUi() {
    const activeMode = getMode();
    applyBodyClass(activeMode);
    updateNavHomeLinks(activeMode);
    mountToggle(activeMode);
  }

  function applyBodyClass(mode) {
    const body = document.body;
    if (!body) return;
    body.classList.toggle("page-friendly", mode === MODES.friendly);
  }

  function updateNavHomeLinks(mode) {
    const href = homeHref(mode);
    document.querySelectorAll(".header__logo").forEach((el) => {
      el.setAttribute("href", href);
    });
    const homeNav = document.querySelector(".nav__list .nav__link[href*='index']");
    if (homeNav) {
      homeNav.setAttribute("href", href);
    }
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
    updateNavHomeLinks(nextMode);
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
