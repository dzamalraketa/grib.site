/**
 * eleventy.config.js — конфигурация Eleventy 3.x для сайта «Мир грибов».
 *
 * Подключает фильтры RSS-плагина, объявляет коллекции, добавляет кастомные
 * фильтры (русская дата, локализация статуса гриба) и настраивает Markdown.
 */

const {
  dateToRfc3339,
  dateToRfc822,
  getNewestCollectionItemDate,
  absoluteUrl,
} = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {
  // ——— Фильтры из @11ty/eleventy-plugin-rss ————————————————————
  eleventyConfig.addFilter("dateToRfc3339", dateToRfc3339);
  eleventyConfig.addFilter("dateToRfc822", dateToRfc822);
  eleventyConfig.addFilter("getNewestCollectionItemDate", getNewestCollectionItemDate);
  eleventyConfig.addFilter("absoluteUrl", absoluteUrl);

  // ——— Passthrough: статические файлы идут в корень _site/ —————————
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/.nojekyll": ".nojekyll" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  // ——— Коллекции ——————————————————————————————————————————————————
  // Виды грибов (карточки).
  eleventyConfig.addCollection("griby", (api) => {
    return api
      .getFilteredByGlob("src/griby/*.md")
      .sort((a, b) => a.data.title.localeCompare(b.data.title, "ru"));
  });

  // Статьи блога — сортируем по дате по убыванию.
  eleventyConfig.addCollection("stati", (api) => {
    return api
      .getFilteredByGlob("src/stati/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Тематические обзоры (temy).
  eleventyConfig.addCollection("temy", (api) => {
    return api
      .getFilteredByGlob("src/temy/*.njk")
      .sort((a, b) => a.data.title.localeCompare(b.data.title, "ru"));
  });

  // Карточки научных исследований (исследования/источники) — сортируем по году убыванию.
  eleventyConfig.addCollection("issledovaniya", (api) => {
    return api
      .getFilteredByGlob("src/issledovaniya/*.md")
      .sort((a, b) => {
        const yearA = a.data.year || (a.date ? a.date.getUTCFullYear() : 0);
        const yearB = b.data.year || (b.date ? b.date.getUTCFullYear() : 0);
        if (yearA !== yearB) return yearB - yearA;
        return (a.data.title || "").localeCompare(b.data.title || "", "ru");
      });
  });

  // ——— Фильтры ——————————————————————————————————————————————————
  // Локализованный статус гриба → русский ярлык.
  eleventyConfig.addFilter("statusLabel", (status) => {
    const labels = {
      edible: "Съедобный",
      conditional: "Условно-съедобный",
      poisonous: "Ядовитый",
      inedible: "Несъедобный",
      medicinal: "Лечебный",
    };
    return labels[status] || status;
  });

  // Дата в русском формате: «12 июля 2026».
  eleventyConfig.addFilter("ruDate", (dateObj) => {
    if (!dateObj) return "";
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    if (isNaN(d)) return "";
    const months = [
      "января", "февраля", "марта", "апреля", "мая", "июня",
      "июля", "августа", "сентября", "октября", "ноября", "декабря",
    ];
    return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  });

  // ISO-дата (YYYY-MM-DD) — нужен для атрибутов <time datetime="…">.
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    if (!dateObj) return "";
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
  });

  // ——— Глобальные данные ——————————————————————————————————————————
  // site.json уже подключается автоматически из src/_data/site.json.
  // Дополнительно: язык по умолчанию для локализации дат.
  eleventyConfig.addGlobalData("siteLocale", () => "ru-RU");

  // ——— Markdown ——————————————————————————————————————————————————
  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.set({ html: true, breaks: false, linkify: true, typographer: false });
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    pathPrefix: "/",
  };
};
