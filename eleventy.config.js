/**
 * eleventy.config.js — конфигурация Eleventy 3.x для сайта «Мир грибов».
 *
 * Подключает фильтры RSS-плагина, объявляет коллекции, добавляет кастомные
 * фильтры (русская дата, локализация статуса гриба) и настраивает Markdown.
 */

const fs = require("node:fs");
const path = require("node:path");
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
  eleventyConfig.addPassthroughCopy({ "src/c6038185ae24d92845b4bff322cf385b.txt": "c6038185ae24d92845b4bff322cf385b.txt" });

  // ——— Коллекции ——————————————————————————————————————————————————
  // Виды грибов (карточки).
  eleventyConfig.addCollection("griby", (api) => {
    return api
      .getFilteredByGlob("src/griby/*.md")
      .sort((a, b) => a.data.title.localeCompare(b.data.title, "ru"));
  });

  // Английские карточки видов (src/en/griby/).
  eleventyConfig.addCollection("gribyEn", (api) => {
    return api
      .getFilteredByGlob("src/en/griby/*.md")
      .sort((a, b) => a.data.title.localeCompare(b.data.title, "en"));
  });

  // URL всех англоязычных страниц — нужен для hreflang и переключателя языка.
  eleventyConfig.addCollection("enUrls", (api) => {
    return api.getAll().filter((p) => p.data.lang === "en").map((p) => p.url);
  });

  // Статьи блога — сортируем по дате по убыванию.
  eleventyConfig.addCollection("stati", (api) => {
    return api
      .getFilteredByGlob("src/stati/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Английские статьи.
  eleventyConfig.addCollection("statiEn", (api) => {
    return api
      .getFilteredByGlob("src/en/stati/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Английские тематические обзоры.
  eleventyConfig.addCollection("temyEn", (api) => {
    return api
      .getFilteredByGlob("src/en/temy/*.njk")
      .sort((a, b) => a.data.title.localeCompare(b.data.title, "en"));
  });

  // Английские карточки исследований.
  eleventyConfig.addCollection("issledovaniyaEn", (api) => {
    return api
      .getFilteredByGlob("src/en/issledovaniya/*.md")
      .sort((a, b) => {
        const yearA = a.data.year || (a.date ? a.date.getUTCFullYear() : 0);
        const yearB = b.data.year || (b.date ? b.date.getUTCFullYear() : 0);
        if (yearA !== yearB) return yearB - yearA;
        return (a.data.title || "").localeCompare(b.data.title || "", "en");
      });
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

  // ——— Сезонный календарь ————————————————————————————————————————
  // Грибы, которые встречаются в любом из заданных месяцев (без круглогодичных).
  eleventyConfig.addFilter("inMonths", (items, months) =>
    (items || []).filter((i) => !i.data.year_round && Array.isArray(i.data.months) && i.data.months.some((m) => months.includes(m)))
  );
  eleventyConfig.addFilter("withStatus", (items, statuses) => {
    const set = String(statuses).split(",");
    return (items || []).filter((i) => set.includes(i.data.status));
  });
  eleventyConfig.addFilter("yearRound", (items) => (items || []).filter((i) => i.data.year_round));

  // ——— Фильтры ——————————————————————————————————————————————————
  // Есть ли URL в списке (для проверки существования перевода страницы).
  eleventyConfig.addFilter("listHas", (list, v) => (list || []).includes(v));

  // Локализованный статус гриба → ярлык на языке страницы.
  eleventyConfig.addFilter("statusLabel", (status, lang) => {
    const labels = {
      ru: {
        edible: "Съедобный",
        conditional: "Условно-съедобный",
        poisonous: "Ядовитый",
        inedible: "Несъедобный",
        medicinal: "Лечебный",
      },
      en: {
        edible: "Edible",
        conditional: "Conditionally edible",
        poisonous: "Poisonous",
        inedible: "Inedible",
        medicinal: "Medicinal",
      },
    };
    return (labels[lang] || labels.ru)[status] || status;
  });

  // Дата в формате языка страницы: ru — «12 июля 2026», en — «12 July 2026».
  eleventyConfig.addFilter("dateFmt", (dateObj, lang) => {
    if (!dateObj) return "";
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    if (isNaN(d)) return "";
    const monthsEn = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    if (lang === "en") return `${monthsEn[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
    const monthsRu = [
      "января", "февраля", "марта", "апреля", "мая", "июня",
      "июля", "августа", "сентября", "октября", "ноября", "декабря",
    ];
    return `${d.getUTCDate()} ${monthsRu[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
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

  // Краткое описание для карточек в листингах: первое предложение,
  // при превышении maxLen — обрезка с многоточием. Не трогает короткие тексты.
  eleventyConfig.addFilter("excerpt", (text, maxLen = 180) => {
    if (!text) return "";
    const trimmed = String(text).trim();
    if (trimmed.length <= maxLen) return trimmed;
    // Первое предложение по [.!?] + пробел (или конец строки).
    const sentenceMatch = trimmed.match(/^[^.!?]+[.!?]/);
    if (sentenceMatch && sentenceMatch[0].length <= maxLen) {
      return sentenceMatch[0];
    }
    return trimmed.slice(0, maxLen).replace(/[\s,;:.-]+$/, "") + "…";
  });

  // Дата изменения исходного файла страницы (mtime) — для честного
  // <lastmod> в sitemap: у карточек исследований page.date — это дата
  // публикации РАБОТЫ, а не изменения страницы.
  eleventyConfig.addFilter("fileModified", (inputPath) => {
    try {
      const p = path.resolve(process.cwd(), inputPath.replace(/^\.\//, ""));
      return fs.statSync(p).mtime;
    } catch (_) {
      return new Date();
    }
  });

  // Оценка времени чтения статьи по очищенному от HTML тексту (~190 слов/мин).
  eleventyConfig.addFilter("readingTime", (content, lang) => {
    const plain = String(content || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z0-9#]+;/gi, " ")
      .trim();
    const words = plain ? plain.split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.round(words / 190));
    return lang === "en" ? `~${minutes} min read` : `~${minutes} мин чтения`;
  });

  // Извлекает оглавление из <h2 id="..."> в отрендеренном HTML статьи,
  // только если заголовков второго уровня не меньше minCount.
  eleventyConfig.addFilter("extractToc", (content, minCount = 4) => {
    const html = String(content || "");
    const decodeEntities = (str) =>
      String(str || "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&nbsp;/g, " ");
    const items = [];
    const re = /<h2\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi;
    let match;
    while ((match = re.exec(html)) !== null) {
      const text = decodeEntities(match[2].replace(/<[^>]+>/g, ""))
        .replace(/\s+/g, " ")
        .trim();
      if (text) items.push({ id: match[1], text });
    }
    return items.length >= minCount ? items : [];
  });

  // Подбор до limit смежных статей по общим содержательным тегам и дате.
  eleventyConfig.addFilter("relatedArticles", (collection, currentUrl, currentTags, limit = 3) => {
    const skip = new Set(["stati", "articles"]);
    const baseTags = new Set(
      (Array.isArray(currentTags) ? currentTags : [])
        .map((t) => String(t).trim().toLowerCase())
        .filter((t) => t && !skip.has(t))
    );
    return (collection || [])
      .filter((item) => item && item.url && item.url !== currentUrl)
      .map((item) => {
        const tags = Array.isArray(item.data && item.data.tags) ? item.data.tags : [];
        let overlap = 0;
        for (const t of tags) {
          const norm = String(t).trim().toLowerCase();
          if (norm && !skip.has(norm) && baseTags.has(norm)) overlap += 1;
        }
        const ts = item.date ? new Date(item.date).getTime() : 0;
        return { item, overlap, ts };
      })
      .sort((a, b) => (b.overlap !== a.overlap ? b.overlap - a.overlap : b.ts - a.ts))
      .slice(0, limit)
      .map((entry) => entry.item);
  });

  // ——— Глобальные данные ——————————————————————————————————————————
  // site.json уже подключается автоматически из src/_data/site.json.
  // Дополнительно: язык по умолчанию для локализации дат.
  eleventyConfig.addGlobalData("siteLocale", () => "ru-RU");
  // Момент сборки — lastmod для страниц без своей даты (sitemap, главная).
  eleventyConfig.addGlobalData("buildDate", () => new Date());

  // ——— Markdown ——————————————————————————————————————————————————
  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.set({ html: true, breaks: false, linkify: true, typographer: false });

    const cyrillicMap = {
      а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
      з: "z", и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o",
      п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
      ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
    };

    const translitSlug = (raw) => {
      let out = "";
      for (const ch of String(raw || "").toLowerCase()) {
        out += Object.prototype.hasOwnProperty.call(cyrillicMap, ch) ? cyrillicMap[ch] : ch;
      }
      return out
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    const headingPlainText = (inlineToken) => {
      if (!inlineToken) return "";
      if (Array.isArray(inlineToken.children) && inlineToken.children.length > 0) {
        return inlineToken.children
          .map((t) => {
            if (t.type === "text" || t.type === "code_inline") return t.content;
            if (t.type === "softbreak" || t.type === "hardbreak") return " ";
            if (t.type === "html_inline") return t.content.replace(/<[^>]+>/g, "");
            return "";
          })
          .join("");
      }
      return inlineToken.content || "";
    };

    const seenIdsByTokens = new WeakMap();
    const defaultHeadingOpen =
      mdLib.renderer.rules.heading_open ||
      function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

    // Генерируем стабильные уникальные id для h2 и h3, чтобы работали оглавление и якоря.
    mdLib.renderer.rules.heading_open = function (tokens, idx, options, env, self) {
      const token = tokens[idx];
      if (token.tag === "h2" || token.tag === "h3") {
        let used = seenIdsByTokens.get(tokens);
        if (!used) {
          used = new Set();
          seenIdsByTokens.set(tokens, used);
        }
        const existing = token.attrGet("id");
        if (existing) {
          used.add(existing);
        } else {
          const base = translitSlug(headingPlainText(tokens[idx + 1])) || "section";
          let slug = base;
          let suffix = 2;
          while (used.has(slug)) {
            slug = `${base}-${suffix++}`;
          }
          used.add(slug);
          token.attrSet("id", slug);
        }
      }
      return defaultHeadingOpen(tokens, idx, options, env, self);
    };

    mdLib.renderer.rules.table_open = () => '<div class="table-wrap"><table>\n';
    mdLib.renderer.rules.table_close = () => "</table></div>\n";
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
