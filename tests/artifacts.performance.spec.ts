import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

test('capture documentation images from the reviewed application', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'This task explicitly captures both viewport sizes once.');
  await page.route('**/api/visitors', route => route.fulfill({ status: 503, json: { error: 'unavailable' } }));
  await mkdir('docs/images', { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?artist=garion');
  await expect(page.getByRole('heading', { name: '가리온', exact: true })).toBeVisible();
  await page.waitForFunction(() => ((window as unknown as { __hiphopGraph?: { visibleNodes: number } }).__hiphopGraph?.visibleNodes ?? 0) > 0);
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter(image => image.getClientRects().length).map(image => image.decode().catch(() => {}))); });
  // Network idle does not guarantee that Sigma's camera animation has finished.
  await page.evaluate(() => new Promise<void>(resolve => {
    let previous = '', stable = 0;
    const frame = () => {
      const state = JSON.stringify((window as unknown as { __hiphopGraph: { getCameraState: () => unknown } }).__hiphopGraph.getCameraState());
      stable = state === previous ? stable + 1 : 0; previous = state;
      if (stable >= 15) resolve(); else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }));
  await writeFile('docs/images/map-desktop.webp', await sharp(await page.screenshot()).webp({ quality: 88 }).toBuffer());
  await page.setViewportSize({ width: 390, height: 900 });
  await page.getByRole('button', { name: '상세 펼치기' }).click();
  await expect(page.getByRole('tab', { name: '협업자' })).toBeVisible();
  await page.waitForLoadState('networkidle');
  await writeFile('docs/images/map-mobile.webp', await sharp(await page.screenshot()).webp({ quality: 88 }).toBuffer());
  await writeFile('docs/images/README.md', '# Service screenshots\n\nActual application captures, with the visitor API deliberately unavailable so no invented visitor total is displayed.\n\nPhotographs retain their individual author and license conditions; see [image audit](../image-audit.md) and [site credits](https://k-hiphop-map.vercel.app/credits/).\n');
});

test('record a throttled mobile diagnostic without claiming physical-device performance', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'mobile', 'Mobile emulation diagnostic.');
  test.setTimeout(120_000);
  await context.route('**/api/visitors', route => route.fulfill({ json: { count: 0 } }));
  const session = await context.newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const start = performance.now();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => ((window as unknown as { __hiphopGraph?: { nodes: number } }).__hiphopGraph?.nodes ?? 0) > 0);
  const readyMs = Math.round(performance.now() - start);
  const input = page.getByRole('combobox', { name: '아티스트 검색', exact: true });
  const searchStart = performance.now(); await input.fill('가리온');
  await expect(page.getByRole('option').filter({ hasText: '가리온' }).first()).toBeVisible();
  const searchMs = Math.round(performance.now() - searchStart);
  const path = info.outputPath('throttled-mobile.json');
  await writeFile(path, JSON.stringify({ readyMs, searchMs, searchIncludesAutomation: true, downloadMbps: 1.6, rttMs: 150, cpuSlowdown: 4, physicalDevice: false }, null, 2));
  await info.attach('throttled-mobile.json', { path, contentType: 'application/json' });
  await session.detach();
});
