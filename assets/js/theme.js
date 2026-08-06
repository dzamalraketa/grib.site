/* theme.js — переключение светлой / тёмной темы.
   Светлая — по умолчанию (выставляется inline-скриптом в base.njk).
   Тёмная — явный выбор пользователя. */

(function () {
  "use strict";

  const STORAGE_KEY = "theme"; // "light" | "dark"

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function store(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* ignore */ }
  }

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  function toggle() {
    const next = currentTheme() === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    store(next);
    syncToggle(next);
  }

  function syncToggle(value) {
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      const isLight = value === "light";
      btn.setAttribute("aria-pressed", isLight ? "false" : "true");
      btn.setAttribute(
        "aria-label",
        isLight ? "Включить тёмную тему" : "Включить светлую тему"
      );
      const label = btn.querySelector("[data-theme-toggle-label]");
      if (label) label.textContent = isLight ? "Светлая" : "Тёмная";
      // Иконка солнце/луна (через data-атрибут для CSS)
      btn.setAttribute("data-current-theme", value);
    });
  }

  function init() {
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", toggle);
    });
    syncToggle(currentTheme());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
