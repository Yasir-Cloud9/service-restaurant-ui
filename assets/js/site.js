// assets/js/site.js
// Shared site-level logic: theme init + toggle + icon swap.
// Safe to load on all pages (home/menu/contact).

console.log("site.js is running");

document.addEventListener("DOMContentLoaded", () => {
  initThemeSystem();
});

function initThemeSystem() {
  const htmlElement = document.documentElement;

  // Default should be DARK (as requested).
  // If a user has already chosen a theme, respect it.
  const savedTheme = localStorage.getItem("theme") || "dark";

  applyTheme(savedTheme);

  // Wire up toggle if present on this page
  const toggleButton = document.getElementById("dark-mode-toggle");
  if (!toggleButton) {
    return; // Home/contact may not have it
  }

  toggleButton.addEventListener("click", () => {
    const isDark = htmlElement.classList.contains("dark");
    const nextTheme = isDark ? "light" : "dark";
    applyTheme(nextTheme);
  });
}

function applyTheme(theme) {
  const htmlElement = document.documentElement;

  if (theme === "dark") {
    htmlElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    htmlElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }

  // Optional: icon swap (only if icons exist on the page)
  const sunIcon = document.getElementById("sun-icon");
  const moonIcon = document.getElementById("moon-icon");

  if (sunIcon && moonIcon) {
    // Your HTML already uses `hidden dark:block` etc,
    // so this is not strictly required.
    // But keeping it here makes the behavior explicit and future-proof.
    if (theme === "dark") {
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    } else {
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    }
  }
}
