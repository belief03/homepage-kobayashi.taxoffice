document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFriendlyHome =
    document.body.classList.contains("page-friendly") &&
    document.body.classList.contains("page-home");

  if (isFriendlyHome) {
    const title = document.querySelector(".hero-friendly__title");
    if (title && !title.dataset.animatedChars) {
      const original = title.textContent || "";
      title.setAttribute("aria-label", original.trim());
      title.dataset.animatedChars = "true";

      const lines = original.split("\n").map((line) => line.trim()).filter(Boolean);
      const htmlSource = title.innerHTML;
      const hasBr = /<br\s*\/?>/i.test(htmlSource);
      const titleLines = hasBr ? htmlSource.split(/<br\s*\/?>/i).map((line) => line.trim()) : lines;
      const normalized = titleLines.length > 0 ? titleLines : [original.trim()];

      title.innerHTML = "";
      let charIndex = 0;

      normalized.forEach((line) => {
        const lineWrap = document.createElement("span");
        lineWrap.className = "hero-friendly__title-line";

        Array.from(line).forEach((char) => {
          const charSpan = document.createElement("span");
          charSpan.className = "hero-friendly__title-char";
          charSpan.setAttribute("aria-hidden", "true");
          charSpan.innerHTML = char === " " ? "&nbsp;" : char;
          if (!prefersReducedMotion) {
            charSpan.style.animationDelay = `${1.15 + charIndex * 0.055}s`;
          }
          lineWrap.appendChild(charSpan);
          charIndex += 1;
        });

        title.appendChild(lineWrap);
      });
    }
  }

  if (prefersReducedMotion) {
    return;
  }

  const friendlyExtras = document.body.classList.contains("page-friendly")
    ? [...document.querySelectorAll(".feature-card")]
    : [];

  const targets = [
    ...document.querySelectorAll(".main .section"),
    ...document.querySelectorAll(".page-single__main > *"),
    ...friendlyExtras
  ].filter((element) => !element.classList.contains("page-single__title"));

  const uniqueTargets = Array.from(new Set(targets));
  uniqueTargets.forEach((element, index) => {
    element.classList.add("reveal");
    element.classList.add(index % 2 === 0 ? "reveal--left" : "reveal--right");
  });

  const isFriendly = document.body.classList.contains("page-friendly");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: isFriendly ? 0.12 : 0.18,
      rootMargin: isFriendly ? "0px 0px -5% 0px" : "0px 0px -8% 0px"
    }
  );

  uniqueTargets.forEach((element) => observer.observe(element));
});
