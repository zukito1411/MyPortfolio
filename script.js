const yearNode = document.getElementById("year");
const themeToggle = document.getElementById("themeToggle");
const themeToggleLabel = document.querySelector(".theme-toggle-label");
const topbar = document.querySelector(".topbar");
const scrollProgress = document.getElementById("scrollProgress");
const scrollCue = document.getElementById("scrollCue");
const storageKey = "portfolio-theme";
const revealTargets = [
  ".hero",
  ".status-band",
  ".hero-stats article",
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
  ".skill-logo-wrap",
  ".status-pills i"
];
const tiltTargets = [
  ".project-card",
  ".skill-card",
  ".education-card",
  ".timeline-item",
  ".content-card",
  ".contact-block",
  ".quick-card",
  ".hero-feature",
  ".callout"
];

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

function getPreferredTheme() {
  const savedTheme = window.localStorage.getItem(storageKey);
  if (savedTheme) {
    return { theme: savedTheme, persisted: true };
  }

  return {
    theme: window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark",
    persisted: false
  };
}

function applyTheme(theme, persist = true) {
  document.body.setAttribute("data-theme", theme);

  if (persist) {
    window.localStorage.setItem(storageKey, theme);
  }

  if (themeToggleLabel) {
    themeToggleLabel.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  }
}

function getAnchorOffset() {
  const baseOffset = topbar ? topbar.getBoundingClientRect().height : 0;
  return Math.round(baseOffset + 12);
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
  window.setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, 40);
}

const initialTheme = getPreferredTheme();
applyTheme(initialTheme.theme, initialTheme.persisted);

document.body.classList.add("js-ready");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme") === "light" ? "light" : "dark";
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

if (scrollCue) {
  scrollCue.addEventListener("click", () => {
    window.scrollBy({
      top: Math.round(window.innerHeight * 0.78),
      behavior: "smooth"
    });
  });
}

function setupAnchorNavigation() {
  const anchorLinks = [...document.querySelectorAll('a[href^="#"]')];

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") || "";
      if (!href) {
        return;
      }

      event.preventDefault();

      if (href === "#home") {
        clearHomeHash();
        forceTopStart();
        updateScrollUI();
        return;
      }

      const target = document.querySelector(href);
      if (!target) {
        return;
      }

      window.history.replaceState(null, "", href);
      scrollToHashTarget(href, true);
      window.setTimeout(updateScrollUI, 120);
    });
  });
}

function syncInitialScroll() {
  clearHomeHash();
  // The timeout helps ensure this runs after any browser-initiated scroll restoration attempts.
  setTimeout(forceTopStart, 0);
}

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

function updateScrollUI() {
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1) * 100;
  const remainingScroll = Math.max(maxScroll - window.scrollY, 0);

  if (scrollProgress) {
    scrollProgress.style.width = `${progress}%`;
  }

  if (scrollCue) {
    const shouldShowCue = maxScroll > 40 && remainingScroll > 48;
    scrollCue.classList.toggle("is-hidden", !shouldShowCue);
  }

  if (topbar) {
    topbar.classList.toggle("is-scrolled", window.scrollY > 16);
  }

  const sections = [...document.querySelectorAll("section[id]")];
  const navLinks = [...document.querySelectorAll('.topnav a[href^="#"]')];
  const activeSection = sections
    .map((section) => ({
      id: section.id,
      top: Math.abs(section.getBoundingClientRect().top - getAnchorOffset())
    }))
    .sort((a, b) => a.top - b.top)[0];

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("is-active", Boolean(activeSection && href === `#${activeSection.id}`));
  });
}

function setupTiltMotion() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  const targets = [...new Set(tiltTargets.flatMap((selector) => [...document.querySelectorAll(selector)]))];

  targets.forEach((target) => target.classList.add("tilt-ready"));

  if (prefersReducedMotion || !hasFinePointer) {
    return;
  }

  targets.forEach((target) => {
    target.addEventListener("pointermove", (event) => {
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      const rotateX = -(((y / rect.height) - 0.5) * 8);

      target.classList.add("is-tilting");
      target.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
      target.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
    });

    target.addEventListener("pointerleave", () => {
      target.classList.remove("is-tilting");
      target.style.removeProperty("--tilt-x");
      target.style.removeProperty("--tilt-y");
    });
  });
}

function setupCounters() {
  const counters = [...document.querySelectorAll("[data-count-to]")];
  if (!counters.length) {
    return;
  }

  const animateCounter = (counter) => {
    if (counter.dataset.counted === "true") {
      return;
    }

    counter.dataset.counted = "true";
    const target = Number(counter.dataset.countTo || 0);
    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = String(Math.round(target * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function debounce(func, wait = 150) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// --- Initial Setup Calls ---

setupAnchorNavigation();
setupRevealMotion();
setupTiltMotion();
setupCounters();
updateScrollUI();

// On page load or when navigating back/forward
window.addEventListener("pageshow", (event) => {
  // event.persisted is true if the page is from the back/forward cache
  syncInitialScroll();
});

// Initial call for fresh page loads
if (document.readyState !== "loading") {
  syncInitialScroll();
} else {
  document.addEventListener("DOMContentLoaded", syncInitialScroll);
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
window.addEventListener("resize", debounce(updateScrollUI));
