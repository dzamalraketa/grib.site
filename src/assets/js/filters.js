/* filters.js — клиентская фильтрация каталога грибов.
   Три независимые группы (съедобность / где растёт / особенности),
   внутри группы выбирается одно значение, между группами — «И».
   Состояние хранится в URL (?status=&ecology=&feature=), чтобы категории
   можно было отправлять ссылкой. Без JS видны все карточки. */

(function () {
  "use strict";

  function init() {
    var grid = document.getElementById("catalog");
    if (!grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-status]"));
    var groups = Array.prototype.slice.call(document.querySelectorAll("[data-filter-group]"));
    var statusEl = document.getElementById("catalog-status");
    var resetBtn = document.getElementById("filter-reset");
    var state = { status: "all", ecology: "all", feature: "all" };

    var attr = { status: "data-status", ecology: "data-ecology", feature: "data-features" };

    function cardValues(card, key) {
      var raw = card.getAttribute(attr[key]) || "";
      return key === "feature" ? raw.split("|") : [raw];
    }

    function matches(card, skipKey) {
      return Object.keys(state).every(function (key) {
        if (key === skipKey || state[key] === "all") return true;
        return cardValues(card, key).indexOf(state[key]) !== -1;
      });
    }

    function updateCounts() {
      groups.forEach(function (g) {
        var key = g.getAttribute("data-filter-group");
        g.querySelectorAll("[data-count]").forEach(function (el) {
          var v = el.getAttribute("data-count");
          var n = cards.filter(function (c) {
            return matches(c, key) && (v === "all" || cardValues(c, key).indexOf(v) !== -1);
          }).length;
          el.textContent = "(" + n + ")";
          var btn = el.closest("[data-value]");
          if (btn) btn.classList.toggle("is-empty", n === 0 && v !== "all");
        });
      });
    }

    function plural(n) {
      var m10 = n % 10, m100 = n % 100;
      if (m10 === 1 && m100 !== 11) return "гриб";
      if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "гриба";
      return "грибов";
    }

    function apply(pushUrl) {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.style.display = ok ? "" : "none";
        if (ok) visible++;
      });
      groups.forEach(function (g) {
        var key = g.getAttribute("data-filter-group");
        g.querySelectorAll("[data-value]").forEach(function (b) {
          b.setAttribute("aria-pressed", b.getAttribute("data-value") === state[key] ? "true" : "false");
        });
      });
      updateCounts();
      var active = Object.keys(state).some(function (k) { return state[k] !== "all"; });
      if (resetBtn) resetBtn.hidden = !active;
      if (statusEl) statusEl.textContent = visible ? "Показано: " + visible + " " + plural(visible) : "Ничего не найдено — попробуйте сбросить фильтры.";
      if (pushUrl && window.history && history.replaceState) {
        var p = new URLSearchParams();
        Object.keys(state).forEach(function (k) { if (state[k] !== "all") p.set(k, state[k]); });
        var q = p.toString();
        history.replaceState(null, "", location.pathname + (q ? "?" + q : "") + location.hash);
      }
    }

    var params = new URLSearchParams(location.search);
    Object.keys(state).forEach(function (k) {
      var v = params.get(k);
      if (v && groups.some(function (g) {
        return g.getAttribute("data-filter-group") === k && g.querySelector('[data-value="' + CSS.escape(v) + '"]');
      })) state[k] = v;
    });

    groups.forEach(function (g) {
      var key = g.getAttribute("data-filter-group");
      g.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-value]");
        if (!btn) return;
        state[key] = btn.getAttribute("data-value");
        apply(true);
      });
    });
    if (resetBtn) resetBtn.addEventListener("click", function () {
      state = { status: "all", ecology: "all", feature: "all" };
      apply(true);
    });

    apply(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
