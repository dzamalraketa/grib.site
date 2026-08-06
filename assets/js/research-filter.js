/* research-filter.js — клиентский фильтр карточек по категориям
   на странице /issledovaniya/. */

(function () {
  "use strict";

  function init() {
    var buttons = document.querySelectorAll("[data-research-filter]");
    var cards = document.querySelectorAll("[data-category]");
    var countEls = document.querySelectorAll("[data-count]");
    if (buttons.length === 0 || cards.length === 0) return;

    // Считаем количество по каждой категории (один раз)
    var counts = { all: cards.length };
    cards.forEach(function (c) {
      var cat = c.getAttribute("data-category");
      if (!cat) return;
      counts[cat] = (counts[cat] || 0) + 1;
    });

    function setCount(filter, n) {
      countEls.forEach(function (el) {
        if (el.getAttribute("data-count") === filter) {
          el.textContent = "(" + n + ")";
        }
      });
    }

    // Заполняем все счётчики
    Object.keys(counts).forEach(function (k) {
      setCount(k, counts[k]);
    });

    function applyFilter(filter) {
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-research-filter") === filter));
      });
      cards.forEach(function (c) {
        if (filter === "all" || c.getAttribute("data-category") === filter) {
          c.style.display = "";
        } else {
          c.style.display = "none";
        }
      });
    }

    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        applyFilter(b.getAttribute("data-research-filter"));
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
