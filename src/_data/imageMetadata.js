// Read dimensions from the actual local assets, never infer them by extension.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
module.exports = async function () {
  const root = path.join(__dirname, '..', 'assets', 'img');
  const result = {};
  async function walk(dir) {
    await Promise.all((await fs.readdir(dir, { withFileTypes: true })).map(async (entry) => {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(file);
      if (!/\.(png|jpe?g|webp|gif|svg)$/i.test(file)) return;
      const meta = await sharp(file).metadata();
      result['/assets/img/' + path.relative(root, file).split(path.sep).join('/')] = {
        width: meta.width, height: meta.height,
        type: meta.format === 'svg' ? 'image/svg+xml' : `image/${meta.format}`,
      };
    }));
  }
  await walk(root);
  return result;
};
