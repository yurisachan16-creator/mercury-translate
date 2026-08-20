#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const sourceDir = path.join(root, 'store-assets/chrome-web-store/source');
const outputDir = path.join(root, 'store-assets/chrome-web-store');
const renderHtml = path.join(sourceDir, 'render.html');
const iconSvg = path.join(sourceDir, 'icon-128.svg');
const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');

const assets = [
  { name: 'icon', width: 128, height: 128, out: 'icon-128.png', type: 'svg' },
  { name: 'promo', width: 440, height: 280, out: 'small-promo-tile.png', type: 'html' },
  { name: 'webpage', width: 1280, height: 800, out: 'screenshots/01-webpage-bilingual.png', type: 'html' },
  { name: 'youtube', width: 1280, height: 800, out: 'screenshots/02-youtube-subtitles.png', type: 'html' },
  { name: 'pdf', width: 1280, height: 800, out: 'screenshots/03-pdf-reader.png', type: 'html' },
  { name: 'ocr', width: 1280, height: 800, out: 'screenshots/04-image-ocr.png', type: 'html' },
  { name: 'services', width: 1280, height: 800, out: 'screenshots/05-services-privacy.png', type: 'html' },
];

if (checkOnly) {
  for (const asset of assets) {
    const pngPath = path.join(outputDir, asset.out);
    if (!fs.existsSync(pngPath)) {
      fail(`missing asset: ${path.relative(root, pngPath)}`);
    }
    const actual = readPngSize(pngPath);
    if (actual.width !== asset.width || actual.height !== asset.height) {
      fail(`${path.relative(root, pngPath)} is ${actual.width}x${actual.height}, expected ${asset.width}x${asset.height}`);
    }
  }
  console.log(`Chrome Web Store asset check passed (${assets.length} PNGs)`);
  process.exit(0);
}

const { chromium } = loadPlaywright();
const browser = await chromium.launch({ headless: true });

try {
  for (const asset of assets) {
    const pngPath = path.join(outputDir, asset.out);
    fs.mkdirSync(path.dirname(pngPath), { recursive: true });
    const page = await browser.newPage({
      viewport: { width: asset.width, height: asset.height },
      deviceScaleFactor: 1,
    });
    if (asset.type === 'svg') {
      const svg = fs.readFileSync(iconSvg, 'utf8');
      await page.setContent(`<body style="margin:0;width:${asset.width}px;height:${asset.height}px;overflow:hidden">${svg}</body>`);
    } else {
      const url = `${pathToFileURL(renderHtml).href}?asset=${encodeURIComponent(asset.name)}`;
      await page.goto(url);
    }
    await page.screenshot({ path: pngPath, omitBackground: false });
    await page.close();
    const actual = readPngSize(pngPath);
    if (actual.width !== asset.width || actual.height !== asset.height) {
      fail(`${path.relative(root, pngPath)} rendered as ${actual.width}x${actual.height}, expected ${asset.width}x${asset.height}`);
    }
    console.log(`wrote ${path.relative(root, pngPath)} ${asset.width}x${asset.height}`);
  }
} finally {
  await browser.close();
}

function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_REQUIRE_BASE,
    path.join(root, 'node_modules'),
    '/Users/aitwo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules',
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return createRequire(path.join(candidate, 'noop.js'))('playwright');
    } catch {
      // Try the next local installation.
    }
  }

  fail('Playwright is required to render PNG assets. Set PLAYWRIGHT_REQUIRE_BASE to a node_modules directory containing playwright.');
}

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (
    buffer.length < 24 ||
    buffer.readUInt32BE(0) !== 0x89504e47 ||
    buffer.readUInt32BE(4) !== 0x0d0a1a0a ||
    buffer.toString('ascii', 12, 16) !== 'IHDR'
  ) {
    fail(`${path.relative(root, filePath)} is not a readable PNG`);
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
