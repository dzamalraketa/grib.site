#!/usr/bin/env node
/**
 * Скрипт проверки верификации контента.
 * Запускается перед сборкой. Падает с ненулевым кодом, если найден
 * хотя бы один файл в src/griby/ или src/stati/ с verified: false.
 *
 * Использование: node scripts/check-verified.js
 */

const fs = require("fs");
const path = require("path");

const CONTENT_DIRS = [
  path.join(__dirname, "..", "src", "griby"),
  path.join(__dirname, "..", "src", "stati"),
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith(".md"))
    .map((d) => path.join(dir, d.name));
}

function readFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  return match[1];
}

function isVerified(fm) {
  if (!fm) return false;
  return /^verified:\s*true\s*$/m.test(fm);
}

const offenders = [];

for (const dir of CONTENT_DIRS) {
  for (const file of walk(dir)) {
    const fm = readFrontMatter(fs.readFileSync(file, "utf8"));
    if (!isVerified(fm)) {
      offenders.push(path.relative(process.cwd(), file));
    }
  }
}

if (offenders.length > 0) {
  console.error(
    "\n[check-verified] Сборка остановлена. Следующие файлы не прошли факт-чекинг (verified: false):\n"
  );
  for (const f of offenders) console.error("  - " + f);
  console.error(
    "\nУстановите verified: true после проверки фактов или удалите файл.\n"
  );
  process.exit(1);
}

console.log(
  `[check-verified] OK — проверено файлов: ${
    CONTENT_DIRS.reduce((acc, d) => acc + walk(d).length, 0)
  }`
);
