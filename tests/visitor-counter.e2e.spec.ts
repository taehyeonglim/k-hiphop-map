import { test, expect, type Page } from '@playwright/test';

const API = /\/api\/visitors(?:\?.*)?$/;
const MAP = /\/data\/map\.json(?:\?.*)?$/;
const DAY_KEY = 'khiphopmap:visitors:day';
const counter = (page: Page) => page.getByTestId('visitor-counter');
const exceptions = new WeakMap<Page, string[]>();

function initialRequestMethod(page: Page) {
  return new URL(page.url()).hostname === 'k-hiphop-map.vercel.app' ? 'POST' : 'GET';
}

function currentKoreanDay() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

test.beforeEach(async ({ page, context }) => {
  await context.addInitScript(() => { try { localStorage.setItem('khiphopmap:trailer:v1:seen', '1'); } catch { /* Restricted storage is exercised separately. */ } });
  const errors: string[] = [];
  exceptions.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
});
test.afterEach(async ({ page }) => { expect(exceptions.get(page) || []).toEqual([]); });

async function graphReady(page: Page) {
  await expect.poll(() => page.evaluate(() => (window as unknown as { __hiphopGraph?: { nodes: number } }).__hiphopGraph?.nodes || 0)).toBeGreaterThan(0);
}
async function headerGeometry(page: Page, share = true) {
  await expect(page.locator('.creator-credit')).toHaveText(/임태형 a\.k\.a\. Lyricist/);
  await expect(page.getByRole('button', { name: '30초 소개 영상', exact: true })).toBeVisible();
  if (share) await expect(page.getByRole('button', { name: '지도 공유', exact: true })).toBeVisible();
  const state = await page.evaluate(({ share }) => {
    const selectors = ['.creator-credit', '.visitor-counter', '.masthead .trailer-replay', ...(share ? ['.masthead .share-button'] : [])];
    const header = document.querySelector('.masthead')!.getBoundingClientRect();
    const boxes = selectors.map(selector => {
      const element = document.querySelector<HTMLElement>(selector)!;
      const rect = element.getBoundingClientRect();
      return { selector, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height, clipped: element.scrollWidth > element.clientWidth + 1 };
    });
    return { boxes, header: { top: header.top, bottom: header.bottom }, width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth };
  }, { share });
  expect(state.documentWidth).toBeLessThanOrEqual(state.width + 1);
  for (const box of state.boxes) {
    expect(box.width, box.selector).toBeGreaterThan(0);
    expect(box.left, box.selector).toBeGreaterThanOrEqual(0);
    expect(box.right, box.selector).toBeLessThanOrEqual(state.width + 1);
    expect(box.top, box.selector).toBeGreaterThanOrEqual(0);
    expect(box.bottom, box.selector).toBeLessThanOrEqual(state.height);
    expect(box.clipped, box.selector).toBe(false);
  }
  for (let first = 0; first < state.boxes.length; first++) for (let second = first + 1; second < state.boxes.length; second++) {
    const a = state.boxes[first], b = state.boxes[second];
    expect(a.right <= b.left + 1 || b.right <= a.left + 1 || a.bottom <= b.top + 1 || b.bottom <= a.top + 1, `${a.selector} overlaps ${b.selector}`).toBe(true);
  }
  return state;
}
async function focusedCentersClear(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    const graph = (window as unknown as { __hiphopGraph: { getVisibleNodeIds: () => string[]; getPosition: (id: string) => { x: number; y: number } } }).__hiphopGraph;
    const canvas = document.querySelector('.sigma-container')!.getBoundingClientRect();
    const overlays = [...document.querySelectorAll<HTMLElement>('.network-focus, .mobile-filter-toggle, .view-switch, .canvas-controls button')]
      .filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden')
      .map(element => element.getBoundingClientRect());
    return graph.getVisibleNodeIds().filter(id => {
      const point = graph.getPosition(id), x = canvas.left + point.x, y = canvas.top + point.y;
      return x < canvas.left + 1 || x > canvas.right - 1 || y < canvas.top + 1 || y > canvas.bottom - 1
        || overlays.some(rect => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
    });
  }), { message: 'the added header row must leave fitted collaboration centers clear of the interface' }).toEqual([]);
}

test('one API request survives loading-to-map replacement and a reload reads the confirmed daily count', async ({ page }, testInfo) => {
  let releaseMap!: () => void, releaseApi!: () => void;
  const mapGate = new Promise<void>(resolve => { releaseMap = resolve; });
  const apiGate = new Promise<void>(resolve => { releaseApi = resolve; });
  const methods: string[] = [];
  await page.route(MAP, async route => { await mapGate; await route.continue(); });
  await page.route(API, async route => { methods.push(route.request().method()); await apiGate; await route.fulfill({ json: { count: 12345 } }); });
  try {
    await page.goto('/map/', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => methods.length).toBe(1);
    await expect(counter(page)).toHaveAttribute('data-state', 'loading');
    await expect(counter(page).locator('strong')).toHaveText('—');
    releaseApi();
    await expect(counter(page)).toHaveAttribute('data-state', 'ready');
    await expect(counter(page).locator('strong')).toHaveText('12,345');
    await expect(counter(page)).toHaveAttribute('title', '누적 방문 수 · 브라우저별 하루 1회 집계');
    await headerGeometry(page, false);
    await page.screenshot({ path: testInfo.outputPath(`counter-bootstrap-${testInfo.project.name}.png`), fullPage: true });
    releaseMap();
    await graphReady(page);
    await page.waitForLoadState('networkidle');
    await expect(counter(page).locator('strong')).toHaveText('12,345');
    const initialMethod = initialRequestMethod(page);
    expect(methods).toEqual([initialMethod]);
    expect(await page.evaluate(key => localStorage.getItem(key), DAY_KEY)).toBe(initialMethod === 'POST' ? currentKoreanDay() : null);
    await headerGeometry(page);
    await page.reload();
    await graphReady(page);
    await expect(counter(page)).toHaveAttribute('data-state', 'ready');
    await expect(counter(page).locator('strong')).toHaveText('12,345');
    expect(methods).toEqual([initialMethod, 'GET']);
  } finally { releaseMap(); releaseApi(); }
});

test('an unavailable counter stays unknown and a user retry shows the API genuine zero', async ({ page }) => {
  let unavailable = true;
  const methods: string[] = [];
  await page.route(API, async route => {
    methods.push(route.request().method());
    await route.fulfill({ status: unavailable ? 503 : 200, json: unavailable ? { error: 'counter-unavailable' } : { count: 0 } });
  });
  await page.goto('/map/');
  await graphReady(page);
  await expect(counter(page)).toHaveAttribute('data-state', 'error');
  await expect(counter(page).locator('strong')).toHaveText('—');
  await expect(counter(page)).toHaveAttribute('aria-label', /현재 확인할 수 없음/);
  expect(await page.evaluate(key => localStorage.getItem(key), DAY_KEY)).toBeNull();
  const failedAttempts = methods.length;
  unavailable = false;
  await page.getByRole('button', { name: '방문 수 다시 불러오기' }).click();
  await expect(counter(page)).toHaveAttribute('data-state', 'ready');
  await expect(counter(page).locator('strong')).toHaveText('0');
  expect(methods.length).toBe(failedAttempts + 1);
  expect(methods).toEqual(Array(failedAttempts + 1).fill(initialRequestMethod(page)));
  expect(await page.evaluate(key => localStorage.getItem(key), DAY_KEY)).toBe(initialRequestMethod(page) === 'POST' ? currentKoreanDay() : null);
});

test('malformed totals preserve the prior daily receipt until a valid response', async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, '1995-01-01'), DAY_KEY);
  let payload: unknown = { count: '12345' };
  const methods: string[] = [];
  await page.route(API, async route => { methods.push(route.request().method()); await route.fulfill({ json: payload }); });
  await page.goto('/map/');
  await graphReady(page);
  for (const invalid of [{ count: '12345' }, { count: -1 }, { count: 1.5 }, { count: 12345, counted: 'yes' }]) {
    payload = invalid;
    if (methods.length) await page.getByRole('button', { name: '방문 수 다시 불러오기' }).click();
    await expect(counter(page)).toHaveAttribute('data-state', 'error');
    await expect(counter(page).locator('strong')).toHaveText('—');
    expect(await page.evaluate(key => localStorage.getItem(key), DAY_KEY)).toBe('1995-01-01');
  }
  payload = { count: 4321 };
  await page.getByRole('button', { name: '방문 수 다시 불러오기' }).click();
  await expect(counter(page).locator('strong')).toHaveText('4,321');
  expect(await page.evaluate(key => localStorage.getItem(key), DAY_KEY)).toBe(initialRequestMethod(page) === 'POST' ? currentKoreanDay() : '1995-01-01');
  expect(methods.every(method => method === initialRequestMethod(page))).toBe(true);
});

test('unavailable browser storage still displays the valid API count', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = function() { throw new DOMException('Restricted storage', 'SecurityError'); };
    Storage.prototype.setItem = function() { throw new DOMException('Restricted storage', 'SecurityError'); };
  });
  const methods: string[] = [];
  await page.route(API, async route => { methods.push(route.request().method()); await route.fulfill({ json: { count: 4321 } }); });
  await page.goto('/map/');
  await graphReady(page);
  await expect(counter(page)).toHaveAttribute('data-state', 'ready');
  await expect(counter(page).locator('strong')).toHaveText('4,321');
  await expect(page.getByRole('dialog', { name: '한국힙합 연결고리', exact: true })).toBeHidden();
  expect(methods).toEqual([initialRequestMethod(page)]);
});

test('confirmed five-digit and ten-million totals fit utility and header controls at desktop, mobile and breakpoints', async ({ page }, testInfo) => {
  test.setTimeout(90_000); // Eight real-map navigations also run on software-WebGL CI workers.
  let count = 12345;
  await page.route(API, route => route.fulfill({ json: { count } }));
  const height = page.viewportSize()!.height;
  const widths = [...new Set([page.viewportSize()!.width, 320, 760, 1000])];
  const geometry = [];
  for (const [total, formatted] of [[12345, '12,345'], [10000000, '10,000,000']] as const) {
    count = total;
    for (const width of widths) {
      await page.setViewportSize({ width, height });
      await page.goto('/map/?artist=garion');
      await graphReady(page);
      await expect(counter(page).locator('strong')).toHaveText(formatted);
      geometry.push({ total, width, state: await headerGeometry(page) });
      await focusedCentersClear(page);
      await page.screenshot({ path: testInfo.outputPath(`counter-${total}-${width}-${testInfo.project.name}.png`), fullPage: true });
    }
  }
  await testInfo.attach('header-geometry.json', { body: JSON.stringify(geometry, null, 2), contentType: 'application/json' });
});
