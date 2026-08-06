/* menu.js — мобильный drawer + выпадающая панель поиска в хедере. */

(function () {
  "use strict";

  // ---------- Мобильное меню (drawer) ----------
  function initMobileMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-site-menu]");
    if (!toggle || !menu) return;

    const TRANSITION_MS = 290; // совпадает с css transform:280ms + 10ms

    let closeTimer = null;
    function setOpen(isOpen) {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("is-menu-open", isOpen);

      if (isOpen) {
        // Открытие: сначала убираем hidden, даём кадр — тогда transition сработает
        menu.hidden = false;
        requestAnimationFrame(() => {
          // Запускаем трансформацию (body.is-menu-open .site-menu__panel -> translateX(0))
          document.body.classList.add("is-menu-open");
          requestAnimationFrame(() => {
            const firstLink = menu.querySelector(".site-menu__link");
            if (firstLink) firstLink.focus();
          });
        });
      } else {
        // Закрытие: сначала убираем is-menu-open (запускаем transition), потом hidden через таймаут
        toggle.focus();
        closeTimer = setTimeout(() => {
          menu.hidden = true;
          closeTimer = null;
        }, TRANSITION_MS);
      }
    }

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    menu.querySelectorAll("[data-menu-close]").forEach((el) => {
      el.addEventListener("click", () => setOpen(false));
    });

    // Закрытие по Esc
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
      }
    });

    // Закрытие при клике по ссылке внутри меню
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });
  }

  // ---------- Поиск в хедере ----------
  function initHeaderSearch() {
    const toggle = document.querySelector("[data-search-toggle]");
    const panel = document.querySelector("[data-site-search]");
    const input = document.querySelector("[data-site-search-input]");
    const closeBtn = document.querySelector("[data-search-close]");
    if (!toggle || !panel) return;

    function setOpen(isOpen) {
      toggle.setAttribute("aria-expanded", String(isOpen));
      panel.hidden = !isOpen;
      if (isOpen && input) {
        // Дать кадр на отрисовку
        requestAnimationFrame(() => input.focus());
      }
    }

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    if (closeBtn) closeBtn.addEventListener("click", () => setOpen(false));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) {
        setOpen(false);
        toggle.focus();
      }
      // Cmd/Ctrl + K — открыть поиск
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    });
  }

  // ---------- Sticky-хедер: тень при скролле ----------
  function initStickyHeader() {
    const header = document.querySelector("[data-site-header]");
    if (!header) return;
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle("is-scrolled", window.scrollY > 4);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function init() {
    initMobileMenu();
    initHeaderSearch();
    initStickyHeader();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
