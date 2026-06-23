/**
 * スクロール表示（フェードイン）
 * 相談しやすい版TOP：Aboutブロック → 01〜03を順番に表示
 */
document.addEventListener("DOMContentLoaded", () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const isFriendly = document.body.classList.contains("page-friendly");
  const isFriendlyHome =
    isFriendly && document.body.classList.contains("page-home");
  const isSubpage = document.querySelector(".main.page-single");

  // 下層ページ（プロフィール・サービス・料金・お問い合わせ等）はアニメーションしない
  if (isSubpage) {
    return;
  }

  function applyReveal(element, direction) {
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
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
      }
    );
    observer.observe(element);
  }

  function observeReveal(items, orderOffset = 0) {
    items.forEach((item, index) => {
      applyReveal(item.element, item.direction);
      item.element.dataset.revealOrder = String(orderOffset + index);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.target.classList.contains("is-visible")) {
            return;
          }
          const order = Number(entry.target.dataset.revealOrder) || 0;
          revealLater(entry.target, order * 150);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: isFriendly ? 0.1 : 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    items.forEach((item) => observer.observe(item.element));
  }

  if (isFriendlyHome) {
    const INTRO_GAP = 550;
    const BEFORE_CARDS = 800;
    const CARD_GAP = 260;

    const features = document.querySelector("#features");
    if (features) {
      const heading = features.querySelector(".section__title");
      const lead = features.querySelector(".section__lead");
      const cards = [...features.querySelectorAll(".feature-card")];
      const sequence = [];
      let delay = 0;

      if (heading) {
        applyReveal(heading, "outside");
        sequence.push({ element: heading, delay });
        delay += INTRO_GAP;
      }
      if (lead) {
        applyReveal(lead, "outside");
        sequence.push({ element: lead, delay });
        delay += BEFORE_CARDS;
      }
      cards.forEach((card) => {
        applyReveal(card, "down");
        sequence.push({ element: card, delay });
        delay += CARD_GAP;
      });

      observeOnce(features, () => {
        sequence.forEach((item) => {
          revealLater(item.element, item.delay);
        });
      });
    }

    const scrollSections = [];
    const pricing = document.querySelector("#pricing");
    if (pricing) scrollSections.push({ element: pricing, direction: "outside" });
    const news = document.querySelector("#news");
    if (news) scrollSections.push({ element: news, direction: "outside" });
    const contact = document.querySelector(".contact-banner__inner");
    if (contact) scrollSections.push({ element: contact, direction: "down" });

    observeReveal(scrollSections);
    return;
  }

  const extras = isFriendly ? [...document.querySelectorAll(".feature-card")] : [];
  const elements = [
    ...document.querySelectorAll(".main .section"),
    ...document.querySelectorAll(".page-single__main > *"),
    ...extras
  ].filter((element) => !element.classList.contains("page-single__title"));

  const uniqueElements = Array.from(new Set(elements));
  const items = uniqueElements.map((element, index) => ({
    element,
    direction: index % 2 === 0 ? "left" : "right"
  }));

  observeReveal(items);
});
