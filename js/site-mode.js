(function () {
  const THEME = "css/theme-d.css?v=20260623a";
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUi);
  } else {
    initUi();
  }
})();
