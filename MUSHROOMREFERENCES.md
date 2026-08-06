# MushroomReferences.com — рабочие заметки источника

**URL:** https://mushroomreferences.com

Каталог научных публикаций о лекарственных и съедобных грибах с
кураторскими аннотациями. Используется как **источник метаданных** для
наполнения каталога исследований и блога. Сайт-первоисточник (PubMed,
medRxiv, DOI) указывается в `source_url` — ссылка на
MushroomReferences.com в карточках не используется.

## Политика отбора публикаций

- **Псилоцибин и психоделики в карточки не публикуем.** Категория
  Psilocybin на MushroomReferences.com (179 публикаций) — самая
  многочисленная на сайте, но в `src/issledovaniya/` мы её не
  представляем: терапевтический контекст (сопровождение психотерапевта,
  статус регулируемого препарата, юридические ограничения) делает
  формат «карточка с дизайном и ссылкой на оригинал» неадекватным.
  Карточка `psilocybin-depression-2022.md` существовала в
  промежуточной версии каталога и удалена.
- **Только исследования с явным дизайном на людях** (РКИ,
  мета-анализ, плацебо-контроль). In-vitro и животные — пропускаем.
- **Не дублировать уже существующие карточки** в `src/issledovaniya/`
  (проверять по списку).
- **`source_url` ведёт на PubMed/medRxiv/DOI**, **не** на
  MushroomReferences.com.
- **Соблюдать формат front matter** из существующих карточек
  (`design` с указанием n, `category` из [categories.json](file:///home/sky/Documents/N/src/_data/categories.json)).
- **Без повторов по смыслу** — каждая новая карточка должна покрывать
  отдельный аспект (свой гриб, свой дизайн, свою конечную точку),
  иначе дублировать уже имеющуюся в каталоге.
- После добавления — `npm run build` → коммит → `git push origin main`.

## Структура сайта

Категории с количеством публикаций (на июль 2026):

- Psilocybin — 179
- Lion's Mane — 67
- Reishi — 58
- Cordyceps — 41
- Mesima — 31
- Chaga — 25
- Turkey Tail — 25
- Agarikon — 22
- Oyster — 21
- Hispolon — 14
- Shiitake — 13
- Cosmeceuticals — 11
- Safety/Adverse Reactions — 10
- Maitake — 8
- Microbiome — 8
- Species Blends — 6
- Beta-glucan — 3
- Ergothioneine — 3
- Amadou — 3
- Split Gill Polypore — 2
- Lovastatin — 2
- Other Species — 26
- Miscellaneous — 30

Архивы по месяцам с октября 2015 по июнь 2026.

## Какие категории дают качественные РКИ на людях

По состоянию на июль 2026 (по результатам прохода):

| Категория | РКИ на людях | Пригодность для issledovaniya/ |
|-----------|--------------|--------------------------------|
| Lion's Mane | много | ✅ основной источник |
| Turkey Tail | есть (PSK, FoTv) | ✅ |
| Cordyceps | единично | ⚠ преимущественно in-vitro/животные |
| Reishi | почти нет | ⚠ преимущественно in-vitro |
| Chaga | почти нет | ⚠ |
| Maitake | почти нет | ⚠ |
| Mesima | нет | ❌ |
| Oyster | нет | ❌ |
| Miscellaneous | обзоры (cardiometabolic) | ✅ для систематических обзоров |
| Safety/Adverse | побочные эффекты | ✅ для раздела «безопасность» |

## Уже использовано в каталоге исследований (issledovaniya/)

Из MushroomReferences.com взяты следующие карточки (публиковано в `src/issledovaniya/`):

**Прямые импорты из списка задачи 2 (коммит `14cd654`):
1. `fotv-covid-active-2026.md` — Saxe 2026, medRxiv ✅
2. `fotv-covid-vaccine-2026.md` — Saxe 2026, BMC Immunology ✅
3. `cordyceps-militaris-anemia-runners-2024.md` — Nakamura 2024, Nutrients ✅
4. `ezhovik-erinacine-cognition-2024.md` — Černelič Bizjak 2024, J Functional Foods ✅
5. `mushroom-consumption-cardiometabolic-2023.md` — Uffelman 2023, Nutrients (обзор) ✅

**Добавлено позже, тоже по ссылкам из сайта:

| Файл | Публикация / Дизайн | Категория
|---|---|---|
| `chaga-ibd-2007.md` | Chaga / Язв. колит (in-vitro) | Chaga
| `cordyceps-bailing-ckd-2024.md` | Bailing / ХБП, n=68 | Cordyceps
| `cordyceps-cs4-antioxidant-2010.md` | Cordyceps CS4 / антиокисл. стресс | Cordyceps
| `cordyceps-cs4-elderly-2004.md` | CS4 / пожилые, n=28 | Cordyceps
| `cordyceps-cs4-exercise-elderly-2010.md` | CS4 / выносливость, n=20 | Cordyceps
| `cordyceps-militaris-vo2max-2017.md` | C. militaris / VO2max бегунов | Cordyceps
| `cordyceps-stem-cells-2024.md` | Cordyceps / гемопоэз | Cordyceps
| `ezhovik-acute-stress-2023.md` | Ежовик / острый стресс | Lion's Mane
| `ezhovik-alzheimer-2020.md` | Ежовик / БА, n=41 | Lion's Mane
| `ezhovik-anxiety-2010.md` | Ежовик / тревога, n=30 | Lion's Mane
| `ezhovik-cognition-middle-2019.md` | Ежовик / когниция, n=77 РКИ | Lion's Mane
| `ezhovik-depression-anxiety-2023.md` | Ежовик / депр.+тревога | Lion's Mane
| `ezhovik-mci-2009.md` | Ежовик / MCI, n=50 Mori 6 мес | Lion's Mane
| `ezhovik-overweight-bdnf-2019.md` | Ежовик / лишний вес+BDNF | Lion's Mane
| `ezhovik-safety-mci-24weeks-2024.md` | Ежовик / безоп., MCI 24 нед | Safety
| `ezhovik-working-memory-young-adults-2022.md` | Ежовик / раб. память, n=86 | Lion's Mane
| `fotv-breast-cancer-2012.md` | FoTv / РМЖ, n=17 | Turkey Tail
| `maitake-dfraction-2009.md` | Maitake D-fraction / онко | Maitake
| `maitake-reishi-mix-2019.md` | Maitake+Reishi / иммунитет | Species Blends
| `psk-colorectal-meta-2006.md` | PSK / колоректальный, метаанализ | Turkey Tail
| `psk-oncology-meta-2006.md` | PSK / онко метаанализ | Turkey Tail
| `reishi-breast-cancer-2012.md` | Reishi / РМЖ, n=17 | Reishi
| `reishi-immunity-fatigue-2023.md` | Reishi / иммунитет+усталость | Reishi
| `reishi-shiitake-lipid-2018.md` | Reishi+Shiitake / липиды | Species Blends
| `reishi-sleep-2012.md` | Reishi / сон n=10 | Reishi
| `shiitake-chemotherapy-2011.md` | Shiitake / ХТ, n=20 | Shiitake
| `shiitake-immune-2015.md` | Shiitake / иммунитет n=52 | Shiitake
| `shiitake-immunotherapy-2016.md` | Shiitake / иммунотерапия | Shiitake
| `shiitake-interferon-2014.md` | Shiitake / интерферон | Shiitake
| `turkey-tail-breast-cancer-hormonal-2012.md` | Trametes / РМЖ+гормоны | Turkey Tail

## Контент для блога (stati/) — УЖЕ ИСПОЛЬЗОВАНО

Все 5 featured-обзоров из MushroomReferences.com **уже опубликованы** в `src/stati/`:

| Файл в stati/ | Статья на MushroomReferences |
|---|---|
| `lion-s-mane-brain-and-body.md` | [Lion's Mane for Your Brain and Body (2025/03)](https://mushroomreferences.com/2025/03/27/lions-mane-for-your-brain-and-body/) |
| `mushroom-supplements-italy.md` | [Mushroom-Based Supplements in Italy (2023/02)](https://mushroomreferences.com/2023/02/27/mushroom-based-supplements-in-italy-lets-open-pandoras-box/) |
| `maitake-lechebnye-svoystva.md` | [Maitake, the Dancing Mushroom (2025/09)](https://mushroomreferences.com/2025/09/10/maitake-the-dancing-mushroom-for-your-kitchen-and-health/) |
| `chaga-health-overview.md` | [How Chaga Can Change Your Health (2025/01)](https://mushroomreferences.com/2025/01/09/how-chaga-can-change-your-health/) |
| `griby-covid-immunomodulyatory.md` | [COVID, Mushrooms, & Immune Modulators (2025/01)](https://mushroomreferences.com/2025/01/16/covid-mushrooms-immune-modulators/) |

## Кандидаты на следующую волну добавления (ещё не опубликованы)

Приоритет по категориям с РКИ на людях (из таблицы выше):

1. **Lion's Mane** — ещё ~57 неиспользованных публикаций (67 − 10 уже использовано):
   - Повторные РКИ Ежовика по депрессии/когниции с большим n, долгосрочные.
2. **Safety/Adverse Reactions (10) — отдельная карточка «Безопасность: побочные эффекты», обзор по 10 публикаций.
3. **Ergothioneine (3)** — эрготионеин, кардиометаболические эффекты.
4. **Beta-glucan (3)** — общие систематические обзоры по бета-глюканам.
5. **Amadou (3)** — Фомес настоящий (трутовик).
6. **Chaga (25 − 1 = 24)** — поиски РКИ на людях (в основном in-vitro, ищем исключения).

Правило фильтра **при добавлении новых карточек**:
- Только люди, РКИ/мета-анализ, n ≥ 20, плацебо или активный контроль.
- Вести первоисточник (PubMed/DOI/medRxiv), не ссылку на MushroomReferences.
- Не дублировать уже существующие по конечной точке.
- `verified: false` до ручной проверки. После фактчекинга → `true`.

## Особенности сайта

- Много работ с участием Пола Стаметса (Paul Stamets) — Fungi Perfecti
  финансирует часть РКИ, особенно по FoTv (Fomitopsis + Trametes).
- Featured-раздел обновляется регулярно — есть свежие публикации 2026
  года (preprint-стадии).
- Аннотации дают достаточно информации, чтобы сразу понять: in-vitro,
  животные или человек; дизайн; n.
- Полный текст брать из PubMed/medRxiv/DOI (страница на
  MushroomReferences всегда содержит ссылку на оригинал).
- Не всё пригодно для сайта: категории вроде Cosmeceuticals, Mesima,
  Hispolon — преимущественно доклинические данные.
