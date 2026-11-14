// Rebuild the committed share cards: node scripts/generate-social-images.mjs
// SVG is the editable source; JPEG is the crawler-facing image.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const output = new URL('../src/assets/img/social/', import.meta.url);
await mkdir(output, { recursive: true });
const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const cards = [
  ['site-ru-v2', 'ГРИБЫ БЕЗ МИФОВ', ['Мир грибов'], ['Виды · наука · экология', 'Понятно. С опорой на источники.']],
  ['site-en-v2', 'THE WORLD OF FUNGI', ['Mushroom', 'World'], ['Species · science · ecology', 'Clear explanations. Primary sources.']],
  ['ai-ru-v2', 'ПОНЯТНО ОБ ИИ', ['От мицелия', 'к нейросетям'], ['Как устроен искусственный интеллект', 'Справочник для начинающих']],
  ['catalog-ru-v2', 'МИР ГРИБОВ / КАТАЛОГ', ['Узнать гриб'], ['Виды, признаки и двойники', 'Описание · сезон · источники']],
  ['articles-ru-v2', 'МИР ГРИБОВ / СТАТЬИ', ['Грибы крупным', 'планом'], ['Обзоры, объяснения и открытия', 'От мицелия до экологии']],
  ['research-ru-v2', 'МИР ГРИБОВ / ИССЛЕДОВАНИЯ', ['Что говорит', 'наука'], ['Исследования грибов', 'Данные · ограничения · первоисточники']],
  ['topics-ru-v2', 'МИР ГРИБОВ / ТЕМЫ', ['Больше, чем', 'шляпка и ножка'], ['Микориза, мицелий и экология', 'Путеводитель по миру грибов']],
  ['season-ru-v2', 'МИР ГРИБОВ / КАЛЕНДАРЬ', ['В лес', 'по сезону'], ['Когда и какие грибы встречаются', 'Сезоны · виды · опасные двойники']],
];
const forest = (await readFile(new URL('../src/assets/img/forest-magic-hero.jpg', import.meta.url))).toString('base64');
const logo = (await readFile(new URL('../src/assets/img/logo.svg', import.meta.url))).toString('base64');
const hero = await readFile(new URL('../src/pro-ii.njk', import.meta.url), 'utf8');
const network = hero.match(/<svg viewBox="0 0 360 380"[\s\S]*?<\/svg>/)[0]
  .replace(/<svg[^>]*>/, '<g transform="translate(745 105) scale(.97)">')
  .replace('</svg>', '</g>').replace(/<title[^>]*>[\s\S]*?<\/title>|<desc[^>]*>[\s\S]*?<\/desc>/g,'');
const fungi = `<g transform="translate(785 130)">
<ellipse cx="140" cy="360" rx="150" ry="24" fill="#10291f" opacity=".6"/>
<g stroke="#a7bf85" stroke-width="2" fill="none" stroke-linecap="round" opacity=".75"><path d="M140 310L140 360L82 386M140 349L210 384M140 330L80 350L32 340M80 350L45 377M140 346L200 345L245 318M200 345L248 366M140 360L132 400M82 386L45 397M210 384L250 400"/></g>
<path d="M110 140C113 203 101 245 101 290Q140 324 177 290C173 231 159 197 163 140" fill="#f0e2bf"/>
<path d="M24 151C24 58 89 10 141 10C208 10 268 72 268 151Q155 198 24 151" fill="#bc623f"/>
<path d="M24 151Q145 121 268 151Q151 190 24 151" fill="#e6c99a"/>
<path d="M46 129C71 66 100 45 140 38" fill="none" stroke="#edb47e" stroke-width="4" opacity=".6"/>
<g stroke="#856046" opacity=".45"><path d="M45 153L115 170M69 146L127 174M96 143L137 176M170 143L150 176M203 144L161 171M239 150L168 168"/></g>
<path d="M-12 266C-5 221 28 191 63 197C100 204 112 241 111 266Q53 287-12 266" fill="#dfb66e"/>
<path d="M40 278L31 328Q51 344 68 328L62 278" fill="#f0e2bf"/>
<g fill="#e7d6a4" opacity=".8"><circle cx="285" cy="45" r="3"/><circle cx="0" cy="77" r="2"/><circle cx="302" cy="198" r="3"/><circle cx="210" cy="0" r="2"/></g>
</g>`;
for (const [name, eyebrow, lines, sub] of cards) {
  const size = name.startsWith('site-ru') ? 82 : 64;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="background" x2="1" y2="1"><stop stop-color="#142c22"/><stop offset="1" stop-color="#345344"/></linearGradient><radialGradient id="glow"><stop stop-color="#c1ce92" stop-opacity=".2"/><stop offset="1" stop-color="#c1ce92" stop-opacity="0"/></radialGradient></defs>
<rect width="1200" height="630" fill="url(#background)"/><circle cx="960" cy="260" r="330" fill="url(#glow)"/>
${name.startsWith('site-') ? `<image href="data:image/jpeg;base64,${forest}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/><defs><linearGradient id="shade"><stop stop-color="#081c19" stop-opacity=".97"/><stop offset=".6" stop-color="#081c19" stop-opacity=".75"/><stop offset="1" stop-color="#081c19" stop-opacity=".1"/></linearGradient></defs><rect width="1200" height="630" fill="url(#shade)"/>` : ''}
<image href="data:image/svg+xml;base64,${logo}" x="1066" y="82" width="64" height="64"/>
<path d="M64 64H1136M64 566H1136" stroke="#d6c399" opacity=".3"/>
<text x="68" y="113" fill="#d9c596" font-family="Noto Sans, sans-serif" font-size="17" letter-spacing="3">${escape(eyebrow)}</text>
${lines.map((line, i) => `<text x="64" y="${251 + i * 83}" fill="#faf4e5" font-family="Noto Serif, serif" font-size="${size}" font-weight="700" letter-spacing="-2">${escape(line)}</text>`).join('')}
${sub.map((line, i) => `<text x="68" y="${lines.length === 1 ? 338 + i * 40 : 403 + i * 40}" fill="#d7dfce" font-family="Noto Sans, sans-serif" font-size="24">${escape(line)}</text>`).join('')}
${name.startsWith('ai-') ? network : (name.startsWith('site-') ? '' : fungi)}
<text x="68" y="535" fill="#e5ce9d" font-family="Noto Sans, sans-serif" font-size="22" font-weight="600" letter-spacing="3">GRIB.SITE</text>
<text x="1134" y="535" text-anchor="end" fill="#d7dfce" font-family="Noto Sans, sans-serif" font-size="16">${name.includes('-en-') ? 'MUSHROOM WORLD' : 'МИР ГРИБОВ'}</text>
</svg>`;
  await writeFile(new URL(`${name}.svg`, output), svg);
  await sharp(Buffer.from(svg)).jpeg({ quality: 90, mozjpeg: true }).toFile(fileURLToPath(new URL(`${name}.jpg`, output)));
  console.log(`${name}: 1200×630`);
}
