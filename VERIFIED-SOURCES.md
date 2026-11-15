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

### Отбор исследований: польза для человека прежде всего

При выборе новых карточек приоритет: РКИ/пилоты на людях →
эпидемиология и мета-анализы → токсикология и клинические
случаи → доклиника (in vitro/мыши) и базовая наука. Доклиничные
и механистические карточки допустимы, но обязаны быть помечены
«на животных/in vitro» и снабжены оговоркой о переносе на людей.

### Нормализация источников (аудит 2026-11-15)

Все `source_url` карточек исследований приведены к единому
виду — прямой PMID-линк `pubmed.ncbi.nlm.nih.gov/<PMID>/`.
DOI оставлены только там, где статья не индексируется в
PubMed (см. список ниже). Проверено через
`esearch ... term=<doi>[doi]` и `pmc/utils/idconv`.

Заменено DOI→PMID (16): agaricus-bisporus-microbiome-2018→30279332,
cordyceps-militaris-anemia-runners-2024→38931190,
ezhovik-cognition-middle-2019→31413233,
fotv-covid-vaccine-2026→41620671, mesima-immunity-2022→36042633,
mushroom-consumption-cardiometabolic-2023→36904079,
mushroom-vitamind-prediabetics-2014→25117997,
mushroom-vitamind-urbain-2011→21540874,
oyster-betaglucan-ldl-2026→42071226,
reishi-immunity-fatigue-2023→36841376,
shiitake-bge-microbiome-2021→33580297,
tamogitake-cognition-2025→40761356,
ezhovik-acute-stress-2023→38004235,
ergothioneine-mci-pilot-2024→39544014,
mushroom-diet-scfa-iga-2022→36698463,
reishi-breast-cancer-2012→22203880.

DOI не индексируется в PubMed — ссылка оставлена (проверено,
резолвится): 10.1007/BF02836405 (Chinese J Integr Med),
10.15747/jcn.2015.7.3.81, 10.4163/jnh.2019.52.3.258,
10.1016/j.jadr.2023.100544, 10.1016/j.jff.2024.106120,
10.1016/j.jff.2010.11.004.

### Исправленные неверифицируемые цитаты (2026-11-15)

Четыре карточки ссылались на несуществующие работы — заменены
реальными исследованиями по той же теме (прямой PMID):

- `cordyceps-cs4-antioxidant-2010`: «Yan et al, Phytother Res
  2010;24(9)» — в PubMed отсутствует → Sci Rep 2024,
  РКИ напитка C. militaris на иммунные маркеры, PMID 38580687.
- `reishi-shiitake-lipid-2018`: «Abidin et al, Phytomedicine
  2018» — в PubMed отсутствует → Nutrients 2025, РКИ масла
  спор рейши n=110 при дислипидемии, PMID 40077714.
  Ссылки в `stati/reishi-clinical-evidence.md` и
  `griby/shiitake.md` обновлены под новое содержание.
- `ezhovik-safety-mci-24weeks-2024`: «Nutr Neurosci 2024,
  DOI 10.1080/1028415X.2024.2348191» — DOI не резолвится
  (404) → Nutrients 2021, мыши SAMP8 + эринацин-A,
  PMID 34684662 (помечено «доклиника»).
- `ezhovik-working-memory-young-adults-2022`: «Front Pharmacol
  2022, DOI 10.3389/fphar.2022.826741» — DOI не резолвится
  (404) → Front Nutr 2025, острое кроссоверное РКИ n=18,
  PMID 40276537 (нулевой результат — сохранён как важный).

Правило: каждая цитата в карточке должна быть проверена
esummary/efetch по PMID **до** записи файла; поисковые
`?term=`-URL в `source_url` запрещены — ссылка обязана вести
на конкретную запись, а не на выдачу.

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
