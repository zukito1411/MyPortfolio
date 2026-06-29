const yearNode = document.getElementById("year");
const themeToggle = document.getElementById("themeToggle");
const themeToggleLabel = document.querySelector(".theme-toggle-label");
const storageKey = "portfolio-theme";

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

applyTheme(getPreferredTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme") === "light" ? "light" : "dark";
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}
