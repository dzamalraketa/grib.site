# MushroomReferences.com — рабочие заметки источника

**URL:** https://mushroomreferences.com

Каталог научных публикаций о лекарственных и съедобных грибах с
кураторскими аннотациями. Используется как **источник метаданных** для
наполнения каталога исследований и блога. Сайт-первоисточник (PubMed,
medRxiv, DOI) указывается в `source_url` — ссылка на
MushroomReferences.com в карточках не используется.

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

## Уже использовано в каталоге исследований

Из MushroomReferences.com взяты следующие 5 карточек (задача 2,
коммит `14cd654`):

1. `fotv-covid-active-2026.md` — Saxe 2026, medRxiv
2. `fotv-covid-vaccine-2026.md` — Saxe 2026, BMC Immunology
3. `cordyceps-militaris-anemia-runners-2024.md` — Nakamura 2024, Nutrients
4. `ezhovik-erinacine-cognition-2024.md` — Černelič Bizjak 2024, J Functional Foods
5. `mushroom-consumption-cardiometabolic-2023.md` — Uffelman 2023, Nutrients (обзор)

## Контент для будущих статей блога (stati/)

Стоит отслеживать featured-публикации — там встречаются редакционные
обзоры, пригодные как сырьё для блог-постов:

- [Lion's Mane for Your Brain and Body (2025/03)](https://mushroomreferences.com/2025/03/27/lions-mane-for-your-brain-and-body/)
- [Mushroom-Based Supplements in Italy: Let's Open Pandora's Box (2023/02)](https://mushroomreferences.com/2023/02/27/mushroom-based-supplements-in-italy-lets-open-pandoras-box/)
- [Maitake, the Dancing Mushroom: For your Kitchen and Health (2025/09)](https://mushroomreferences.com/2025/09/10/maitake-the-dancing-mushroom-for-your-kitchen-and-health/)
- [How Chaga Can Change Your Health (2025/01)](https://mushroomreferences.com/2025/01/09/how-chaga-can-change-your-health/)
- [COVID, Mushrooms, & Immune Modulators (2025/01)](https://mushroomreferences.com/2025/01/16/covid-mushrooms-immune-modulators/)

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

## Правила импорта

1. Использовать только исследования с явным дизайном на людях
   (РКИ, мета-анализ, плацебо-контроль). In-vitro и животные — пропускать.
2. Не дублировать уже существующие карточки в `src/issledovaniya/`
   (проверять по списку).
3. `source_url` ведёт на PubMed/medRxiv/DOI, **не** на
   MushroomReferences.com.
4. Соблюдать формат front matter из существующих карточек
   (`design` с указанием n, `category` из [categories.json](file:///home/sky/Documents/N/src/_data/categories.json)).
5. После добавления — `npm run build` → коммит → `git push origin main`.
