(function () {
  const THEME = "css/theme-d.css?v=20260709m";
  const HOME = "index-friendly.html";
  const PRO_HOME = "index.html";

  function currentFile() {
    const path = window.location.pathname;
    const file = path.slice(path.lastIndexOf("/") + 1);
    return file || PRO_HOME;
  }

  document.documentElement.classList.add("site-ready", "site-mode-friendly");
  document.documentElement.classList.remove("site-mode-pro");

  if (currentFile() === PRO_HOME) {
    window.location.replace(HOME + window.location.search + window.location.hash);
    return;
  }

  const themeLink = document.getElementById("site-theme-link");
  if (themeLink) {
    themeLink.href = THEME;
  }

  function initNav() {
    const header = document.querySelector(".header");
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".nav");
    if (!header || !toggle || !nav) return;

    const mq = window.matchMedia("(max-width: 767px)");

    function setOpen(open) {
      header.classList.toggle("is-nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    }

    function closeNav() {
      setOpen(false);
    }

    toggle.addEventListener("click", function () {
      setOpen(!header.classList.contains("is-nav-open"));
    });

    nav.querySelectorAll(".nav__link").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    document.addEventListener("click", function (event) {
      if (!header.contains(event.target)) closeNav();
    });

    function onViewportChange() {
      if (!mq.matches) closeNav();
    }

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onViewportChange);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(onViewportChange);
    }
  }

  function initUi() {
    document.body?.classList.add("page-friendly");

    document.querySelectorAll(".header__logo").forEach((el) => {
      el.setAttribute("href", HOME);
    });

    const file = currentFile();
    document.querySelectorAll(".nav__link, .footer__nav-link").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      const linkFile = href.split("/").pop().split("#")[0].split("?")[0];
      if (linkFile === file) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    initNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUi);
  } else {
    initUi();
  }
})();
