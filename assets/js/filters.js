/* filters.js — клиентская фильтрация каталога грибов по статусу.
   Работает на статически отрендеренной странице /griby/. */

(function () {
  "use strict";

  function init() {
    const grid = document.getElementById("catalog");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll("[data-status]"));
    const buttons = document.querySelectorAll("[data-filter]");

    // Подсчёт количества по статусам
    const counts = { all: cards.length };
    cards.forEach((c) => {
      const s = c.getAttribute("data-status");
      counts[s] = (counts[s] || 0) + 1;
    });
    document.querySelectorAll("[data-count]").forEach((el) => {
      const k = el.getAttribute("data-count");
      el.textContent = "(" + (counts[k] || 0) + ")";
    });

    function applyFilter(value) {
      let visible = 0;
      cards.forEach((card) => {
        const match = value === "all" || card.getAttribute("data-status") === value;
        card.style.display = match ? "" : "none";
        if (match) visible++;
      });
      grid.dataset.activeFilter = value;
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.getAttribute("data-filter");
        buttons.forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
        applyFilter(value);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
