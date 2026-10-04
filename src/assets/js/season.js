/* season.js — подсвечивает текущее время года на странице календаря. */
(function () {
  "use strict";
  function init() {
    var month = new Date().getMonth() + 1;
    var nav = document.querySelector("[data-season-nav]");
    if (!nav) return;
    var current = null;
    document.querySelectorAll(".season-period[data-months]").forEach(function (sec) {
      var ms = (sec.getAttribute("data-months") || "").split(",").filter(Boolean).map(Number);
      if (ms.indexOf(month) === -1) return;
      current = sec.id;
      sec.classList.add("is-current");
      var now = sec.querySelector(".season-period__now");
      if (now) now.hidden = false;
    });
    if (!current) return;
    nav.querySelectorAll("a").forEach(function (a) {
      if (a.getAttribute("href") === "#" + current) {
        a.classList.add("is-current");
        a.setAttribute("aria-current", "true");
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
