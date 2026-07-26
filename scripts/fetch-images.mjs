#!/usr/bin/env node
/**
 * fetch-images.mjs — автоматическая загрузка изображений грибов с Wikimedia Commons.
 *
 * Логика (раздел 7 ТЗ):
 *  1. Поиск сущности в Wikidata по латинскому названию.
 *  2. Получение claim P18 (изображение).
 *  3. Получение метаданных лицензии через Commons imageinfo.
 *  4. Скачивание, оптимизация через sharp (resize → 1200px, JPEG quality 82).
 *  5. Запись файла в src/assets/img/mushrooms/<slug>.jpg.
 *  6. Обновление front matter (image, image_author, image_license, image_source_url).
 *
 * Если для вида изображение не найдено — файл front matter остаётся как есть,
 * и в шаблоне будет использован fallback-illustration.svg.
 *
 * Использование: npm run fetch-images
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const GRIBY_DIR = "src/griby";
const IMG_DIR = "src/assets/img/mushrooms";

const WD_API = "https://www.wikidata.org/w/api.php";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

/* ---------- сетевые утилиты ---------- */

async function getJSON(url) {
  const r = await fetch(url, {
    headers: { "User-Agent": "griby-site-fetch/1.0 (contact: dev@grib.site)" },
  });
  if (!r.ok) throw new Error(`HTTP ${r} для ${url}`);
  return r.json();
}

function stripHtml(str) {
  return String(str || "").replace(/<[^>]*>/g, "").trim();
}

/* ---------- поиск изображения ---------- */

async function findWikidataImage(latinName) {
  // 1. Поиск сущности по латинскому названию
  const searchUrl = `${WD_API}?action=wbsearchentities&search=${encodeURIComponent(latinName)}&language=en&format=json`;
  const searchRes = await getJSON(searchUrl);
  const qid = searchRes.search?.[0]?.id;
  if (!qid) return null;

  // 2. Получаем claim P18 (изображение)
  const entityUrl = `${WD_API}?action=wbgetentities&ids=${qid}&props=claims&format=json`;
  const entity = await getJSON(entityUrl);
  const filename = entity.entities[qid]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  if (!filename) return null;

  // 3. Метаданные лицензии через Commons imageinfo
  const infoUrl = `${COMMONS_API}?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url%7Cextmetadata&format=json`;
  const info = await getJSON(infoUrl);
  const page = Object.values(info.query?.pages || {})[0];
  const ii = page?.imageinfo?.[0];
  if (!ii?.url) return null;

  return {
    imageUrl: ii.url,
    author: stripHtml(ii.extmetadata?.Artist?.value) || "неизвестен",
    license: stripHtml(ii.extmetadata?.LicenseShortName?.value) || "уточнить лицензию вручную",
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename)}`,
  };
}

/* ---------- обработка одного файла ---------- */

async function processMushroom(file) {
  const filePath = path.join(GRIBY_DIR, file);
  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(raw);

  if (data.image_source_url) {
    return { skipped: true, reason: "уже загружено" };
  }
  if (!data.latin_name) {
    return { skipped: true, reason: "нет latin_name" };
  }

  const found = await findWikidataImage(data.latin_name);
  if (!found) {
    console.warn(`  [warn] ${data.latin_name} — изображение не найдено, будет использован fallback`);
    return { skipped: true, reason: "не найдено в Wikidata" };
  }

  // Скачиваем и оптимизируем
  const imgRes = await fetch(found.imageUrl, {
    headers: { "User-Agent": "griby-site-fetch/1.0 (contact: dev@grib.site)" },
  });
  if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status} при скачивании ${found.imageUrl}`);
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  await fs.mkdir(IMG_DIR, { recursive: true });
  const outPath = path.join(IMG_DIR, `${data.slug}.jpg`);
  await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outPath);

  // Обновляем front matter
  data.image = `/assets/img/mushrooms/${data.slug}.jpg`;
  data.image_author = found.author;
  data.image_license = found.license;
  data.image_source_url = found.sourceUrl;

  const updated = matter.stringify(content, data);
  await fs.writeFile(filePath, updated);

  return { skipped: false, path: outPath, license: found.license };
}

/* ---------- main ---------- */

async function main() {
  const exists = await fs.stat(GRIBY_DIR).then(() => true).catch(() => false);
  if (!exists) {
    console.error(`Каталог ${GRIBY_DIR} не найден.`);
    process.exit(1);
  }

  const files = (await fs.readdir(GRIBY_DIR)).filter((f) => f.endsWith(".md"));
  console.log(`Найдено ${files.length} файлов в ${GRIBY_DIR}.\n`);

  let loaded = 0;
  let skipped = 0;

  for (const file of files) {
    process.stdout.write(`  ${file} ... `);
    try {
      const res = await processMushroom(file);
      if (res.skipped) {
        console.log(`пропущено (${res.reason})`);
        skipped++;
      } else {
        console.log(`OK → ${res.path} [${res.license}]`);
        loaded++;
      }
    } catch (err) {
      console.log(`ОШИБКА: ${err.message}`);
    }
  }

  console.log(`\nГотово. Загружено: ${loaded}, пропущено: ${skipped}.`);
}

main();
