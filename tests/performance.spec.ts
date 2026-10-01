import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';

test.beforeEach(async ({ context }) => {
  await context.route('**/api/visitors', route => route.fulfill({ json: { count: 0, counted: false } }));
  await context.addInitScript(() => {
    try { localStorage.setItem('khiphopmap:trailer:v1:seen', '1'); } catch { /* Map performance excludes the separately tested first-visit trailer. */ }
  });
});

type PerformanceGraph = {
  nodes: number; edges: number;
  injectTestGraph: (size: { nodes: number; edges: number }) => Promise<void>;
  restoreGraph: () => void;
  measureNavigation: (duration: number) => Promise<{ fps: number; frames: number; duration: number; nodes: number; edges: number }>;
};

test('1000 artists and 10000 ties sustain the required navigation frame rate', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/map/?artist=');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __hiphopGraph?: PerformanceGraph }).__hiphopGraph?.nodes || 0)).toBeGreaterThan(0);
  await page.evaluate(async () => {
    const graph = (window as unknown as { __hiphopGraph: PerformanceGraph }).__hiphopGraph;
    if (!graph.injectTestGraph) throw new Error('The performance fixture requires the development server; synthetic data is excluded from production.');
    await graph.injectTestGraph({ nodes: 1000, edges: 10000 });
  });
  const measurements = [];
  for (let i = 0; i < 3; i++) measurements.push(await page.evaluate(() => (window as unknown as { __hiphopGraph: PerformanceGraph }).__hiphopGraph.measureNavigation(2000)));
  const median = measurements.map(result => result.fps).sort((a,b) => a-b)[1];
  const threshold = testInfo.project.name === 'mobile' ? 30 : 45;
  const renderer = await page.evaluate(() => {
    const context = document.createElement('canvas').getContext('webgl');
    const extension = context?.getExtension('WEBGL_debug_renderer_info');
    return context && extension ? String(context.getParameter(extension.UNMASKED_RENDERER_WEBGL)) : 'WebGL renderer unavailable';
  });
  const result = { project: testInfo.project.name, viewport: page.viewportSize(), renderer, mobileHardware: false, threshold, median, measurements };
  const reportPath = testInfo.outputPath('navigation-performance.json');
  writeFileSync(reportPath, JSON.stringify(result, null, 2));
  await testInfo.attach('navigation-performance.json', { path: reportPath, contentType: 'application/json' });
  console.log(JSON.stringify(result));
  expect(measurements.every(m => m.nodes === 1000 && m.edges === 10000), JSON.stringify(result)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath(`stress-${testInfo.project.name}.png`) });
  await page.evaluate(() => (window as unknown as { __hiphopGraph: PerformanceGraph }).__hiphopGraph.restoreGraph());
  expect(median, JSON.stringify(result)).toBeGreaterThanOrEqual(threshold);
});

test('five fresh contexts expose an interactive initial map within three seconds', async ({ browser, baseURL }, testInfo) => {
  test.setTimeout(90_000);
  const samples: number[] = [];
  const navigationDetails: unknown[] = [];
  const versions: string[] = [];
  const errors: string[] = [];
  const statuses: { url: string; status: number }[] = [];
  let visibleNodes = 0;
  let renderer = '';
  for (let index = 0; index < 5; index++) {
    const use = testInfo.project.use;
    const context = await browser.newContext({ viewport: use.viewport, isMobile: use.isMobile, hasTouch: use.hasTouch, deviceScaleFactor: use.deviceScaleFactor, userAgent: use.userAgent });
    await context.route('**/api/visitors', route => route.fulfill({ json: { count: 0, counted: false } }));
    await context.addInitScript(() => {
      try { localStorage.setItem('khiphopmap:trailer:v1:seen', '1'); } catch { /* Preserve the established map-ready measurement. */ }
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(baseURL!)) statuses.push({ url: response.url(), status: response.status() }); });
    const started = performance.now();
    await page.goto(`${baseURL}/map/?artist=`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => ((window as unknown as { __hiphopGraph?: PerformanceGraph }).__hiphopGraph?.nodes || 0) > 0);
    samples.push(Math.round(performance.now() - started));
    visibleNodes = await page.evaluate(() => (window as unknown as { __hiphopGraph: PerformanceGraph }).__hiphopGraph.nodes);
    navigationDetails.push(await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).filter(resource => /\.(js|css)(\?|$)/.test(resource.name)).sort((a,b) => b.duration - a.duration).slice(0, 5);
      const mapData = (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).find(resource => new URL(resource.name).pathname === '/data/map.json');
      return { responseStartMs: Math.round(navigation.responseStart), responseEndMs: Math.round(navigation.responseEnd), domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd), encodedDocumentBytes: navigation.encodedBodySize, mapDataResource: mapData ? { durationMs: Math.round(mapData.duration), encodedBytes: mapData.encodedBodySize, decodedBytes: mapData.decodedBodySize } : null, slowestCodeResources: resources.map(resource => ({ path: new URL(resource.name).pathname, durationMs: Math.round(resource.duration), encodedBytes: resource.encodedBodySize })) };
    }));
    const manifestResponse = await page.request.get(`${baseURL}/data/manifest.json`);
    expect(manifestResponse.ok()).toBe(true);
    const manifest = await manifestResponse.json() as { version: string };
    versions.push(manifest.version);
    renderer = await page.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl');
      const extension = gl?.getExtension('WEBGL_debug_renderer_info');
      return gl && extension ? String(gl.getParameter(extension.UNMASKED_RENDERER_WEBGL)) : 'WebGL renderer unavailable';
    });
    await expect(page.locator('.graph-error')).toHaveCount(0);
    await context.close();
  }
  const sorted = [...samples].sort((a,b) => a-b);
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1];
  const result = { project: testInfo.project.name, url: baseURL, versions, renderer, samplesMs: samples, medianMs: sorted[2], empiricalP95Ms: p95, nodes: visibleNodes, targetMs: 3000, conditions: 'Five fresh HTTP-cache contexts with the trailer already marked seen, browser process reused, native network without throttling; map-ready means a positive Sigma node count after renderer initialization. Portrait completion and first-visit trailer viewing are not part of this timing.', navigationDetails, errors, failedResponses: statuses };
  const reportPath = testInfo.outputPath('initial-map-performance.json');
  writeFileSync(reportPath, JSON.stringify(result, null, 2));
  await testInfo.attach('initial-map-performance.json', { path: reportPath, contentType: 'application/json' });
  console.log(JSON.stringify(result));
  expect(errors).toEqual([]);
  expect(statuses).toEqual([]);
  expect(p95, JSON.stringify(result)).toBeLessThan(3000);
});
