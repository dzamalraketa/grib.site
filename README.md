# «Мир грибов» — griby-site

Русскоязычный статический многостраничный сайт с проверенными фактами о грибах.
Построен на [Eleventy](https://www.11ty.dev/) v3, деплой через GitHub Pages.

## Стек

- Eleventy 3.x (шаблонизатор Nunjucks)
- Markdown + YAML front matter
- Чистый CSS (custom properties, light/dark тема)
- Pagefind (полнотекстовый поиск, статика, без бэкенда)
- Formspree (форма обратной связи)
- GitHub Actions + GitHub Pages

## Структура

```
src/
├── _data/          # глобальные данные (site.json)
├── _includes/      # layouts и partials (Nunjucks)
├── assets/         # css, js, img (pass-through)
├── griby/          # карточки видов (.md)
├── stati/          # статьи блога (.md)
├── temy/           # тематические обзоры (.njk)
├── o-proekte.md
├── istochniki.md
├── kontakty.njk
└── index.njk
```

## Команды

```bash
npm install      # установить зависимости
npm start        # локальный dev-сервер (с livereload)
npm run build    # сборка в _site/ + индексация Pagefind
npm run clean    # удалить _site/
```

## Деплой

При push в ветку `main` GitHub Actions собирает сайт и публикует на GitHub Pages
(workflow `.github/workflows/deploy.yml`). В настройках репозитория:
**Settings → Pages → Source → GitHub Actions**.

Домен: **grib.site** (кастомный). Файл `src/CNAME` содержит имя домена и
копируется в корень `_site/` при сборке. DNS настраивается у регистратора.

## Контент-принципы

- Никакого дословного копирования материалов с paulstamets.com, fungi.com,
  hostdefense.com — только адаптированный пересказ с указанием источника.
- Каждая карточка/статья обязана иметь `verified: true` и блок `sources`,
  иначе сборка завершится с ошибкой.
- Дисклеймеры (`foraging`, `health`, `psilocybin`) вставляются автоматически
  шаблоном, не вручную.
