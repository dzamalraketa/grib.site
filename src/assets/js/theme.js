/* theme.js — переключение тёмной / светлой темы.
   Тёмная — по умолчанию (выставляется inline-скриптом в base.njk).
   Светлая — явный выбор пользователя. */

(function () {
  "use strict";

  const STORAGE_KEY = "theme"; // "dark" | "light"

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function store(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* ignore */ }
  }

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  function toggle() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    store(next);
    syncToggle(next);
  }

  function syncToggle(value) {
    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    btn.setAttribute("aria-pressed", value === "light" ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      value === "dark" ? "Включить светлую тему" : "Включить тёмную тему"
    );
    const label = btn.querySelector("[data-theme-toggle-label]");
    if (label) label.textContent = value === "dark" ? "Тёмная" : "Светлая";
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
