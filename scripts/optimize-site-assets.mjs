import sharp from 'sharp';
import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';

// Keep originals intact. These outputs are reproducible, web-sized derivatives.
const assets = [
  ['hero-bg.jpg', 'hero-istanbul.webp', 1440, 80],
  ['university-campus-1.webp', 'istanbul-campus.webp', 760, 78],
  ['classroom.webp', 'classroom-optimized.webp', 1000, 78],
  ['graduation-students.jpg', 'graduates-optimized.webp', 1050, 80],
  ['logo.png', 'horizon-logo.webp', 160, 88],
];

for (const [source, target, width, quality] of assets) {
  const input = resolve('public/images', source);
  const output = resolve('public/images', target);
  await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(output);
  const before = (await stat(input)).size;
  const after = (await stat(output)).size;
  console.log(`${target}: ${Math.round(before / 1024)} KB → ${Math.round(after / 1024)} KB (${Math.round((1 - after / before) * 100)}% smaller)`);
}
