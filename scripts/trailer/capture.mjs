import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

// Film actual public UI interactions; no synthetic graph or fabricated ties.
const baseURL = process.env.TRAILER_BASE_URL || 'http://127.0.0.1:3000';
const output = path.resolve('.cache/trailer/captures');
await mkdir(output, { recursive: true });
const chromePath = process.env.PLAYWRIGHT_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({
  headless: true,
  ...(existsSync(chromePath) ? { executablePath: chromePath } : {}),
  args: ['--enable-webgl', '--enable-gpu', ...(process.platform === 'darwin' ? ['--use-angle=metal'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])],
});
const shots = [];
try {
  for (const portrait of [false, true]) {
    const label = portrait ? 'portrait-demo' : 'demo';
    const viewport = portrait ? { width: 540, height: 960 } : { width: 1600, height: 900 };
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, recordVideo: { dir: output, size: viewport } });
    await context.addInitScript(() => localStorage.setItem('khiphopmap:trailer:v1:seen', '1'));
    const page = await context.newPage();
    await page.goto(`${baseURL}/map/`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__hiphopGraph?.nodes > 0);
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter(image => image.complete && image.getClientRects().length > 0).map(image => image.decode().catch(() => {}))); });
    await page.screenshot({ path: path.join(output, `${label}-full.png`) });
    const filters = page.getByRole('button', { name: '검색 · 필터' });
    if (await filters.isVisible() && await filters.getAttribute('aria-expanded') !== 'true') await filters.click();
    const search = page.getByRole('textbox', { name: '아티스트 검색' });
    await search.fill('가리온');
    const artist = page.getByRole('region', { name: '검색 결과' }).getByRole('button').filter({ has: page.getByText('가리온', { exact: true }) }).first();
    await artist.waitFor();
    // Pointer halo is a filming aid. Selection and spring motion remain native.
    await page.addStyleTag({ content: '.trailer-pointer{position:fixed;z-index:90;pointer-events:none;width:28px;height:28px;border:2px solid #d5f765;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 7px #d5f76525;opacity:0;transition:opacity .1s}.trailer-pointer.down{background:#d5f76565;box-shadow:0 0 0 12px #d5f76530}' });
    await page.evaluate(() => {
      const halo = document.createElement('div'); halo.className = 'trailer-pointer'; document.body.appendChild(halo);
      document.addEventListener('mousemove', event => { halo.style.left = `${event.clientX}px`; halo.style.top = `${event.clientY}px`; halo.style.opacity = '1'; });
      document.addEventListener('mousedown', () => halo.classList.add('down'));
      document.addEventListener('mouseup', () => halo.classList.remove('down'));
    });
    const started = Date.now();
    const at = async seconds => { const remaining = started + seconds * 1000 - Date.now(); if (remaining > 0) await page.waitForTimeout(remaining); };
    await at(0.5);
    await artist.click();
    if (portrait && await filters.isVisible() && await filters.getAttribute('aria-expanded') === 'true') await filters.click();
    await at(3.3);
    const stage = await page.locator('.sigma-container').boundingBox();
    const node = await page.evaluate(() => window.__hiphopGraph.getPosition('garion'));
    if (!stage || !node) throw new Error('Garion graph node unavailable for actual interaction capture');
    const origin = { x: stage.x + node.x, y: stage.y + node.y };
    const dx = portrait ? 48 : 88, dy = portrait ? 35 : 55;
    const target = { x: Math.min(stage.x + stage.width - 24, origin.x + dx), y: Math.min(stage.y + stage.height - 24, origin.y + dy) };
    await page.mouse.move(origin.x, origin.y);
    await at(3.5); await page.mouse.down();
    for (let step = 1; step <= 12; step++) { await page.mouse.move(origin.x + (target.x - origin.x) * step / 12, origin.y + (target.y - origin.y) * step / 12); await page.waitForTimeout(32); }
    const held = await page.evaluate(() => window.__hiphopGraph.getInteractionState());
    if (!held.isDragging) throw new Error('The product capture did not pick the real node');
    await page.screenshot({ path: path.join(output, `${label}-held.png`) });
    await at(5.2); await page.mouse.up();
    await at(8.1);
    await page.screenshot({ path: path.join(output, `${label}-settled.png`) });
    await at(10);
    const video = page.video();
    await context.close();
    const raw = await video.path();
    const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', raw], { encoding: 'utf8' }));
    const duration = Number(probe.format.duration);
    const destination = path.join(output, `${label}.webm`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(Math.max(0, duration - 10)), '-i', raw, '-t', '10', '-an', '-vf', portrait ? 'scale=720:1280' : 'scale=1280:720', '-c:v', 'libvpx-vp9', '-crf', '24', '-b:v', '0', destination]);
    shots.push({ orientation: portrait ? 'portrait' : 'landscape', source: '/map/', artist: 'garion', duration: 10, selectionAt: 0.5, dragAt: 3.5, releaseAt: 5.2, file: destination, realInteraction: held.isDragging });
    process.stdout.write(`Captured ${label}: native selection and elastic drag\n`);
  }
  await writeFile(path.join(output, 'manifest.json'), JSON.stringify({ capturedAt: new Date().toISOString(), baseURL, shots }, null, 2));
} finally { await browser.close(); }
