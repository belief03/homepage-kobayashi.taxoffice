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

  const isFriendly = document.body.classList.contains("page-friendly");

  function applyRevealClasses(element, direction) {
    element.classList.add("reveal");
    if (!isFriendly) {
      element.classList.add(direction === "right" ? "reveal--right" : "reveal--left");
      return;
    }
    if (direction === "left") {
      element.classList.add("reveal--from-left");
    } else if (direction === "right") {
      element.classList.add("reveal--from-right");
    } else if (direction === "down") {
      element.classList.add("reveal--from-down");
    } else {
      element.classList.add("reveal--from-outside");
    }
  }

  function revealLater(element, delayMs) {
    window.setTimeout(() => {
      element.classList.add("is-visible");
    }, delayMs);
  }

  function observeOnce(element, onVisible) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          onVisible(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -6% 0px"
      }
    );
    observer.observe(element);
  }

  if (isFriendlyHome) {
    const INTRO_GAP = 420;
    const BEFORE_CARDS = 500;
    const CARD_GAP = 190;

    const features = document.querySelector("#features");
    if (features) {
      const heading = features.querySelector(".section__title");
      const lead = features.querySelector(".section__lead");
      const cards = [...features.querySelectorAll(".feature-card")];

      const sequence = [];
      let delay = 0;

      if (heading) {
        sequence.push({ element: heading, direction: "outside", delay });
        delay += INTRO_GAP;
      }
      if (lead) {
        sequence.push({ element: lead, direction: "outside", delay });
        delay += BEFORE_CARDS;
      }
      cards.forEach((card, index) => {
        sequence.push({
          element: card,
          direction: index % 2 === 0 ? "left" : "right",
          delay
        });
        delay += CARD_GAP;
      });

      sequence.forEach((item) => {
        applyRevealClasses(item.element, item.direction);
      });

      observeOnce(features, () => {
        sequence.forEach((item) => {
          revealLater(item.element, item.delay);
        });
      });
    }

    const pricing = document.querySelector("#pricing");
    if (pricing) {
      applyRevealClasses(pricing, "outside");
      observeOnce(pricing, () => revealLater(pricing, 0));
    }

    const news = document.querySelector("#news");
    if (news) {
      applyRevealClasses(news, "outside");
      observeOnce(news, () => revealLater(news, 0));
    }

    const contact = document.querySelector(".contact-banner__inner");
    if (contact) {
      applyRevealClasses(contact, "down");
      observeOnce(contact, () => revealLater(contact, 0));
    }

    return;
  }

  const friendlyExtras = isFriendly ? [...document.querySelectorAll(".feature-card")] : [];
  const targets = [
    ...document.querySelectorAll(".main .section"),
    ...document.querySelectorAll(".page-single__main > *"),
    ...friendlyExtras
  ].filter((element) => !element.classList.contains("page-single__title"));

  const uniqueTargets = Array.from(new Set(targets));
  uniqueTargets.forEach((element, index) => {
    const direction =
      isFriendly && element.classList.contains("feature-card")
        ? index % 2 === 0
          ? "left"
          : "right"
        : index % 2 === 0
          ? "left"
          : "right";
    applyRevealClasses(element, direction);
    element.dataset.revealOrder = String(index);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.classList.contains("is-visible")) {
          return;
        }
        const order = Number(entry.target.dataset.revealOrder) || 0;
        revealLater(entry.target, order * 180);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: isFriendly ? 0.08 : 0.18,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  uniqueTargets.forEach((element) => observer.observe(element));
});
