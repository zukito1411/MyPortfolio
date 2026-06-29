const yearNode = document.getElementById("year");
const themeToggle = document.getElementById("themeToggle");
const themeToggleLabel = document.querySelector(".theme-toggle-label");
const topbar = document.querySelector(".topbar");
const storageKey = "portfolio-theme";
const revealTargets = [
  ".hero",
  ".status-band",
  ".project-card",
  ".content-card",
  ".contact-block",
  ".timeline-item",
  ".skill-card",
  ".education-card",
  ".callout",
  ".quick-card"
];
const animatedLogoSelectors = [
  ".brand-mark",
  ".project-logo",
  ".tech-logo",
  ".stack-ribbon i",
  ".tech-line i",
  ".skill-icons i",
  ".status-pills i"
];

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

function getPreferredTheme() {
  const savedTheme = window.localStorage.getItem(storageKey);
  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  window.localStorage.setItem(storageKey, theme);

  if (themeToggleLabel) {
    themeToggleLabel.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  }
}

function getAnchorOffset() {
  const baseOffset = topbar ? topbar.getBoundingClientRect().height : 0;
  return Math.round(baseOffset + 24);
}

function scrollToHashTarget(hash, smooth = false) {
  const target = document.querySelector(hash);
  if (!target) {
    return;
  }

  const targetTop = window.scrollY + target.getBoundingClientRect().top - getAnchorOffset();
  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: smooth ? "smooth" : "auto"
  });
}

function clearHomeHash() {
  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", cleanUrl);
}

function forceTopStart() {
  window.scrollTo({ top: 0, behavior: "auto" });
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  });
}

applyTheme(getPreferredTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme") === "light" ? "light" : "dark";
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

document.body.classList.add("js-ready");

function syncInitialScroll() {
  if (!window.location.hash || window.location.hash === "#home") {
    clearHomeHash();
    forceTopStart();
    return;
  }

  scrollToHashTarget(window.location.hash, false);
}

window.addEventListener("DOMContentLoaded", syncInitialScroll);
window.addEventListener("load", syncInitialScroll);
window.addEventListener("pageshow", syncInitialScroll);

window.addEventListener("hashchange", () => {
  if (!window.location.hash || window.location.hash === "#home") {
    clearHomeHash();
    forceTopStart();
    return;
  }

  scrollToHashTarget(window.location.hash, true);
});

function setupRevealMotion() {
  const cards = revealTargets.flatMap((selector) => [...document.querySelectorAll(selector)]);
  const uniqueCards = [...new Set(cards)];

  uniqueCards.forEach((card, index) => {
    card.classList.add("reveal-card");
    card.style.setProperty("--reveal-delay", `${Math.min(index * 45, 360)}ms`);

    if (card.matches(".hero")) {
      card.classList.add("is-visible");
    }
  });

  const animatedLogos = animatedLogoSelectors.flatMap((selector) => [...document.querySelectorAll(selector)]);
  const uniqueLogos = [...new Set(animatedLogos)];

  uniqueLogos.forEach((logo, index) => {
    logo.classList.add("motion-logo");
    logo.style.setProperty("--float-delay", `${(index % 8) * 0.35}s`);
  });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    uniqueCards.forEach((card) => card.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "-6% 0px -10% 0px"
    }
  );

  uniqueCards.forEach((card) => observer.observe(card));
}

setupRevealMotion();
