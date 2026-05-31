/**
 * Renders Expo app icons from SVG sources.
 * Run: node scripts/generate-icons.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');

async function renderSvg(name, outputName, size) {
  const svg = readFileSync(join(assetsDir, name));
  await sharp(svg).resize(size, size).png().toFile(join(assetsDir, outputName));
  console.log(`Wrote ${outputName} (${size}x${size})`);
}

async function renderSolid(name, color, size) {
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: color,
    },
  })
    .png()
    .toFile(join(assetsDir, name));
  console.log(`Wrote ${name} (${size}x${size})`);
}

await renderSvg('icon-source.svg', 'icon.png', 1024);
await renderSvg('icon-source.svg', 'splash-icon.png', 512);
await renderSvg('android-foreground-source.svg', 'android-icon-foreground.png', 1024);
await renderSolid('android-icon-background.png', '#E8672A', 1024);
await renderSvg('android-monochrome-source.svg', 'android-icon-monochrome.png', 1024);
await renderSvg('icon-source.svg', 'favicon.png', 48);

console.log('App icons generated.');
