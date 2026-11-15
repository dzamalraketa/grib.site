#!/usr/bin/env node
/**
 * optimize-images.mjs — генерация лёгких WebP-версий баннера и фото грибов.
 *
 * Создаёт:
 *  - src/assets/img/forest-magic-hero-{640,1024}.webp + оптимизированный forest-magic-hero.webp/.jpg
 *  - src/assets/img/mushrooms/<slug>-480.webp (миниатюры для каталога, полосы видов и календаря)
 *  - src/assets/img/mushrooms/<slug>.webp (полноразмерные WebP для страниц видов)
 *
 * Исходные .jpg сохраняются для fallback в <picture> и для og:image / twitter:image.
 * Использование: node scripts/optimize-images.mjs [--force]
 */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const FORCE = process.argv.includes("--force");
const MUSHROOMS_DIR = "src/assets/img/mushrooms";
const HERO_JPG = "src/assets/img/forest-magic-hero.jpg";

async function isNewerOrMissing(srcPath, destPath) {
  if (FORCE) return true;
  try {
    const [srcStat, destStat] = await Promise.all([fs.stat(srcPath), fs.stat(destPath)]);
    return srcStat.mtimeMs > destStat.mtimeMs;
  } catch {
    return true;
  }
}

async function optimizeHero() {
  const exists = await fs.stat(HERO_JPG).then(() => true).catch(() => false);
  if (!exists) {
    console.warn(`[hero] Файл ${HERO_JPG} не найден, пропуск.`);
    return;
  }

  const variants = [
    { width: 640, dest: "src/assets/img/forest-magic-hero-640.webp", quality: 76 },
    { width: 1024, dest: "src/assets/img/forest-magic-hero-1024.webp", quality: 76 },
    { width: 1600, dest: "src/assets/img/forest-magic-hero.webp", quality: 75 },
  ];

  const origBytes = (await fs.stat(HERO_JPG)).size;
  for (const v of variants) {
    if (FORCE || v.width !== 1600 || await isNewerOrMissing(HERO_JPG, v.dest)) {
      await sharp(HERO_JPG)
        .resize({ width: v.width, withoutEnlargement: true })
        .webp({ quality: v.quality, effort: 6 })
        .toFile(v.dest);
      const sz = (await fs.stat(v.dest)).size;
      console.log(`[hero] ${v.dest}: ${(sz / 1024).toFixed(1)} KB`);
    }
  }

  // Пережимаем JPEG-фоллбэк, если он тяжелее 240 KB
  if (origBytes > 240 * 1024) {
    const tmp = `${HERO_JPG}.tmp`;
    await sharp(HERO_JPG)
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(tmp);
    const newBytes = (await fs.stat(tmp)).size;
    if (newBytes < origBytes) {
      await fs.rename(tmp, HERO_JPG);
      console.log(`[hero] ${HERO_JPG}: ${(origBytes / 1024).toFixed(1)} KB → ${(newBytes / 1024).toFixed(1)} KB`);
    } else {
      await fs.unlink(tmp);
    }
  }
}

async function optimizeMushrooms() {
  const entries = await fs.readdir(MUSHROOMS_DIR, { withFileTypes: true });
  const jpgs = entries
    .filter((e) => e.isFile() && /\.jpe?g$/i.test(e.name))
    .map((e) => e.name)
    .sort();

  let created = 0;
  let skipped = 0;
  let origTotal = 0;
  let webp480Total = 0;
  let webpFullTotal = 0;

  for (const name of jpgs) {
    const srcPath = path.join(MUSHROOMS_DIR, name);
    const stem = name.replace(/\.jpe?g$/i, "");
    const thumbPath = path.join(MUSHROOMS_DIR, `${stem}-480.webp`);
    const fullPath = path.join(MUSHROOMS_DIR, `${stem}.webp`);

    const srcSize = (await fs.stat(srcPath)).size;
    origTotal += srcSize;

    const needThumb = await isNewerOrMissing(srcPath, thumbPath);
    const needFull = await isNewerOrMissing(srcPath, fullPath);

    if (needThumb || needFull) {
      const input = await fs.readFile(srcPath);
      if (needThumb) {
        await sharp(input)
          .resize({ width: 480, withoutEnlargement: true })
          .webp({ quality: 76, effort: 4 })
          .toFile(thumbPath);
      }
      if (needFull) {
        await sharp(input)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 78, effort: 4 })
          .toFile(fullPath);
      }
      created++;
    } else {
      skipped++;
    }

    webp480Total += (await fs.stat(thumbPath)).size;
    webpFullTotal += (await fs.stat(fullPath)).size;
  }

  console.log(
    `\n[mushrooms] Всего JPG: ${jpgs.length} (${(origTotal / 1024 / 1024).toFixed(2)} MB)\n` +
    `  Обработано сейчас: ${created}, уже актуальны: ${skipped}\n` +
    `  WebP 480w сумма:  ${(webp480Total / 1024 / 1024).toFixed(2)} MB (сред. ${Math.round(webp480Total / jpgs.length / 1024)} KB)\n` +
    `  WebP full сумма: ${(webpFullTotal / 1024 / 1024).toFixed(2)} MB (сред. ${Math.round(webpFullTotal / jpgs.length / 1024)} KB)`
  );
}

await optimizeHero();
await optimizeMushrooms();
