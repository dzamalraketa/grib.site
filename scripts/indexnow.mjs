// IndexNow: уведомляет Bing/Seznam/Naver об обновлённых URL.
// Ключ не секретный — файл ключа лежит в корне сайта по правилам протокола.
// Запуск: node scripts/indexnow.mjs  (после деплоя, читает _site/sitemap.xml)
import { readFileSync } from "node:fs";

const HOST = "grib.site";
const KEY = "c6038185ae24d92845b4bff322cf385b";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const sitemap = readFileSync("_site/sitemap.xml", "utf8");
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urlList.length === 0) {
  console.error("[indexnow] sitemap.xml пуст или не найден");
  process.exit(1);
}
console.log(`[indexnow] URL в отправке: ${urlList.length}`);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  }),
});
console.log(`[indexnow] ответ: ${res.status}`);
// 200/202 = принято; 422 = формат не прошёл валидацию
if (!res.ok && res.status !== 202) {
  console.error("[indexnow] ошибка:", await res.text());
  process.exit(1);
}
