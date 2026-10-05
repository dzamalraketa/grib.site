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
  path.join(__dirname, "..", "src", "en", "griby"),
  path.join(__dirname, "..", "src", "stati"),
  // src/issledovaniya — карточки исследований, не проходят verified-проверку.
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

// Сверка источников: карточка гриба должна опираться минимум на два
// независимых (не Wikipedia) домена. Ошибки фактов чаще всего возникают,
// когда материал основан на одном источнике.
const MIN_INDEPENDENT_DOMAINS = 2;
const weakSources = [];
for (const file of walk(CONTENT_DIRS[0])) {
  const fm = readFrontMatter(fs.readFileSync(file, "utf8")) || "";
  const domains = new Set();
  for (const m of fm.matchAll(/^\s+url:\s*['"]?(\S+?)['"]?\s*$/gm)) {
    try {
      const host = new URL(m[1]).hostname.replace(/^www\./, "");
      if (!host.endsWith("wikipedia.org")) domains.add(host);
    } catch (_) {}
  }
  if (domains.size < MIN_INDEPENDENT_DOMAINS) weakSources.push(path.relative(process.cwd(), file) + " (" + domains.size + ")");
}
if (weakSources.length > 0) {
  console.error("\n[check-verified] Недостаточно независимых источников (нужно >= " + MIN_INDEPENDENT_DOMAINS + " доменов кроме Wikipedia):\n");
  for (const f of weakSources) console.error("  - " + f);
  process.exit(1);
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
