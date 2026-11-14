# Проверенные источники (VERIFIED SOURCES)

Реестр доменов и URL-паттернов, используемых в карточках видов.
Проверено на 2026-11-14 — все паттерны давали HTTP 200 на
реальных видах. Дополнять по мере нахождения новых.

## Правило верификации видовых карточек

`scripts/check-verified.js` требует:
- `verified: true` во front matter;
- **≥2 независимых не-Wikipedia доменов** в `sources:` для
  каждой RU-карточки в `src/griby/`.
- `src/stati/` — тоже проверяется на `verified: true`.
- `src/issledovaniya/` — **не** проверяется скриптом (качество
  вручную: только первоисточники PubMed/DOI/journal).

## Белый список полевых справочников (species)

| Домен | Паттерн URL | Покрытие | Заметки |
|---|---|---|---|
| `www.first-nature.com` | `/fungi/<genus>-<species>.php` | ~85% видов Европы | Отдавать 404 на некоторых видах — проверять HEAD |
| `www.mushroomexpert.com` | `/<genus>_<species>.html` | ~75% | Kuo; сильнее по Сев. Америке, но много евро-видов |
| `www.gbif.org` | `/species/<key>` | ~100% | Fallback-второй-источник; ключ — через API match |
| `mycoweb.narod.ru` | `/fungi/<Genus>_<species>.html` | пятнистое | Рус.; регистр файла важен, часть страниц 404 |
| `www.wildfooduk.com` | `/mushroom-guide/<slug>/` | съедобные UK | Редиректы 301 → актуальные слаги, часть видов 404 |
| `gribnoemesto.com` | `/griby/<slug>/` | русские съедобные | Много 404 на редких видах |
| `gribopedia.ru` | | русские | Редко используется |
| `boletales.com` | `/genera/<genus>/<slug>/` | болеты | Специализировано, живучесть нестабильна |
| `www.amanitaceae.org` | `/?Amanita+<species>` | аманиты | Специализировано; бывают таймауты (000) |
| `www.inaturalist.org` | `/taxa/<id>` | ~100% | Как дополнительный, не как основной |
| `en.wikipedia.org` | — | ~100% | **Не считается** независимым источником — только как 3-й |

### GBIF — получение ключа

```bash
curl -s "https://api.gbif.org/v1/species/match?name=<Latin+Name>" \
  | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['usageKey'])"
# → sources url: https://www.gbif.org/species/<usageKey>
```

Прямая проверка `gbif.org/species/<key>` иногда отдаёт 403
(Cloudflare) — это не 404, ссылка валидна для браузера.

### Известные мёртвые/нестабильные паттерны (проверено)

- `first-nature.com/fungi/pleurotus-pulmonarius.php` → 404
- `first-nature.com/fungi/gyromitra-gigas.php` → 404
- `first-nature.com/fungi/pholiotina-rugosa.php` → 404
- `first-nature.com/fungi/panellus-serotinus.php` → 404
- `first-nature.com/fungi/clitopilus-prunulus.php` → 404
- `first-nature.com/fungi/pisolithus-arhizus.php` → 404
- `mushroomexpert.com/amanita_virosa.html` → 404
- `mushroomexpert.com/lepiota_brunneoincarnata.html` → 404
- `mushroomexpert.com/strobilomyces_strobilaceus.html` → 404
- `mushroomexpert.com/chroogomphus_rutilus.html` → 404
- `mushroomexpert.com/pleurotus_eryngii.html` → 404
- `mycoweb.narod.ru/fungi/Pleurotus_eryngii.html` → 404
- `mycoweb.narod.ru/fungi/Chroogomphus_rutilus.html` → 404
- `mycoweb.narod.ru/fungi/Strobilomyces_floccopus.html` → 404
- `boletales.com/genera/strobilomyces/s-strobilaceus/` → 000
- `wildfooduk.com/mushroom-guide/king-oyster/` → 404
- `ultimate-mushroom.com/edible/77-pleurotus-eryngii.html` →
  301 на ДРУГОЙ вид (ловушка редиректа!)
- `amanitaceae.org` — иногда 000 (таймауты)

## Источники исследований (research)

Только первоисточники:
- `pubmed.ncbi.nlm.nih.gov/<PMID>/` — основной формат
- `doi.org/<doi>` — когда удобнее DOI
- Прямые страницы журналов (Toxicon, Mycologia, Phytochemistry,
  Heart, Front Pediatr и др.) — как `source_name`
- medRxiv — только с пометкой preprint в карточке

### PubMed E-utilities — рабочий пайплайн

```bash
# поиск PMIDs
eutils/esearch.fcgi?db=pubmed&term=<query>&retmode=json&retmax=N
# метаданные (заголовок, журнал, дата)
eutils/esummary.fcgi?db=pubmed&id=<csv>&retmode=json
# абстракты
eutils/efetch.fcgi?db=pubmed&id=<csv>&retmode=xml
```

Не использовать символ «ö» и сложные bool-выражения в term —
ломает парсинг (проверено: пустой ответ).

## Изображения (images)

`npm run fetch-images` → `scripts/fetch-images.mjs`:
Wikidata `wbsearchentities` → QID → `wbgetentities` → claim
`P18` → Commons `Special:FilePath?width=1200` → sharp →
`src/assets/img/mushrooms/<slug>.jpg` + front matter
`image`, `image_author`, `image_license`, `image_source_url`.

Частые сбои: `fetch failed` (таймауты upload.wikimedia),
`HTTP 429` (rate limit Commons — пауза и повтор),
`NO-P18` (нет фото у таксона — fallback-иллюстрация,
НЕ ставить фото другого вида).

Ручной обходной путь: `/tmp/fetch_imgs.py`-паттерн —
wikidata search → P18 → Special:FilePath → imageinfo
extmetadata (Artist + LicenseShortName).

## Карточки без реального фото (fallback by design)

- `cordyceps-cicadae` — нет P18 у таксона
- `gruzd-chernyj` (*Lactarius necator*) — Commons держит фото
  под *L. turpis* (таксономическое слияние, чужой вид)

## Таксономические «проверки перед карточкой»

Перед добавлением вида — `grep` по `latin_name` в
`src/griby/` и `src/en/griby/`:
- `belyanka` уже = *Russula delica* (пойман дубль «подгруздок белый»)
- `polskij-grib` уже = *Imleria badia* (пойман дубль «болет бурый»)
- `opyonok-lugovoj` уже = *Marasmius oreades* (чеснок луговой)
- `svinushka-tonkaya` = *Paxillus involutus*, а «толстая» =
  *Tapinella atrotomentosa* — разные роды
