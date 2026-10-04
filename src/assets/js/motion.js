/* motion.js — scroll-reveal, счётчики, прогресс чтения, подсветка карточек,
   параллакс hero, кнопка «наверх». Без зависимостей; при
   prefers-reduced-motion: reduce динамика не включается. */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* --- Scroll reveal ------------------------------------------------ */
  function initReveal() {
    if (reduce || !("IntersectionObserver" in window)) return;
    // NB: .species-chip исключён — он лежит в горизонтальном .species-strip
    // (overflow-x), IntersectionObserver видит клиппинг и ratio=0 навсегда.
    // Вместо чипов reveal-им саму полосу.
    var sel = ".card, .topic-tile, .stat, .species-strip, .research-meta, .related-research > *, main section > h2";
    var nodes = document.querySelectorAll(sel);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        el.classList.add("is-in");
        el.addEventListener("animationend", function done() {
          el.classList.remove("reveal", "is-in");
          el.style.removeProperty("--i");
          el.removeEventListener("animationend", done);
        });
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    var counters = new Map();
    nodes.forEach(function (el) {
      var r = el.getBoundingClientRect();
      // Элементы уже выше вьюпорта (восстановленный скролл, якорь)
      // не прячем — observer для них не сработает при скролле вниз.
      if (r.bottom < -20) return;
      var parent = el.parentElement;
      var idx = counters.get(parent) || 0;
      counters.set(parent, idx + 1);
      el.style.setProperty("--i", Math.min(idx, 8));
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  /* --- Счётчики ----------------------------------------------------- */
  function initCounters() {
    var els = document.querySelectorAll("[data-counter]");
    if (!els.length) return;
    function run(el) {
      var target = parseInt(el.getAttribute("data-counter"), 10) || 0;
      if (reduce) { el.textContent = target; return; }
      var dur = 1400, start = null;
      function step(t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased);
        if (p < 1) raf(step);
      }
      raf(step);
    }
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); run(e.target); }
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* --- Прогресс чтения + кнопка «наверх» ---------------------------- */
  function initScrollUi() {
    var article = document.querySelector("article");
    var bar = null;
    if (article) {
      bar = document.createElement("div");
      bar.className = "read-progress";
      bar.setAttribute("aria-hidden", "true");
      document.body.appendChild(bar);
    }
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "to-top";
    btn.setAttribute("aria-label", "Наверх");
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    document.body.appendChild(btn);

    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY || document.documentElement.scrollTop;
      btn.classList.toggle("is-visible", y > 600);
      if (bar && article) {
        var top = article.offsetTop;
        var h = article.offsetHeight - window.innerHeight;
        var p = h > 0 ? Math.min(Math.max((y - top) / h, 0), 1) : 0;
        bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
      }
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; raf(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* --- Подсветка карточек за курсором ------------------------------- */
  function initSpotlight() {
    if (!finePointer || reduce) return;
    document.addEventListener("pointermove", function (e) {
      var t = e.target.closest && e.target.closest(".card, .topic-tile");
      if (!t) return;
      var r = t.getBoundingClientRect();
      t.style.setProperty("--mx", (e.clientX - r.left) + "px");
      t.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  }

  /* --- Параллакс hero ---------------------------------------------- */
  function initHeroParallax() {
    var hero = document.querySelector(".hero");
    if (!hero || !finePointer || reduce) return;
    var blobs = hero.querySelectorAll(".hero__blob");
    if (!blobs.length) return;
    var pending = false, nx = 0, ny = 0;
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      nx = (e.clientX - r.left) / r.width - 0.5;
      ny = (e.clientY - r.top) / r.height - 0.5;
      if (!pending) {
        pending = true;
        raf(function () {
          pending = false;
          blobs.forEach(function (b, i) {
            var k = (i + 1) * 14;
            b.style.translate = (nx * k) + "px " + (ny * k) + "px";
          });
        });
      }
    }, { passive: true });
  }

  function init() {
    initReveal();
    initCounters();
    initScrollUi();
    initSpotlight();
    initHeroParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
