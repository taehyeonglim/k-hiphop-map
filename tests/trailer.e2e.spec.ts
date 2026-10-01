import { test, expect, type Page, type Locator } from '@playwright/test';

const SEEN = 'khiphopmap:trailer:v1:seen';
const MEDIA_REQUEST = /\/media\/trailer\/v2\/(?:landscape|portrait)\.mp4(?:\?.*)?$/;
const MAP_REQUEST = /\/data\/map\.json(?:\?.*)?$/;
const dialog = (page: Page) => page.getByRole('dialog', { name: '한국힙합 연결고리', exact: true });
const video = (page: Page) => page.getByTestId('trailer-video');
const errors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const collected: string[] = [];
  errors.set(page, collected);
  page.on('pageerror', error => collected.push(error.message));
});
test.afterEach(async ({ page }) => { expect(errors.get(page) || [], 'the trailer must not raise an uncaught browser error').toEqual([]); });

async function graphReady(page: Page) {
  await expect.poll(() => page.evaluate(() => (window as unknown as { __hiphopGraph?: { nodes: number } }).__hiphopGraph?.nodes || 0)).toBeGreaterThan(0);
  await expect(page.locator('.graph-error[role="alert"]')).toHaveCount(0);
}
async function playing(media: Locator) {
  await expect.poll(() => media.evaluate(element => {
    const elementVideo = element as HTMLVideoElement;
    return elementVideo.readyState >= 2 && !elementVideo.paused && elementVideo.currentTime > .2;
  }), { message: 'the downloaded MP4 must decode and actually advance in the browser' }).toBe(true);
  const time = await media.evaluate(element => (element as HTMLVideoElement).currentTime);
  await expect.poll(() => media.evaluate(element => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(time + .1);
}
async function seen(page: Page) {
  await page.addInitScript(key => localStorage.setItem(key, '1'), SEEN);
}
async function frames(page: Page, count = 3) {
  await page.evaluate(async count => {
    for (let index = 0; index < count; index++) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }, count);
}
async function creatorFits(page: Page, scope: Locator) {
  const creator = scope.getByRole('link', { name: '임태형 a.k.a. Lyricist', exact: true });
  await expect(creator).toBeVisible();
  await expect(creator).toHaveAttribute('href', 'https://github.com/taehyeonglim');
  await expect(creator).toHaveAttribute('target', '_blank');
  await expect(creator).toHaveAttribute('rel', /noopener/);
  await expect(creator).toHaveAttribute('rel', /noreferrer/);
  const geometry = await creator.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, viewport: innerWidth, viewportHeight: innerHeight, clipped: element.scrollWidth > element.clientWidth + 1 };
  });
  expect(geometry.left).toBeGreaterThanOrEqual(0);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewport);
  expect(geometry.top).toBeGreaterThanOrEqual(0);
  expect(geometry.bottom).toBeLessThan(Math.min(180, geometry.viewportHeight));
  expect(geometry.width).toBeGreaterThan(90);
  expect(geometry.clipped).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}
async function closeAndConfirmPaused(page: Page, name = '트레일러 닫고 지도 보기') {
  await page.getByRole('button', { name, exact: true }).click();
  await expect(dialog(page)).toBeHidden();
  await expect.poll(() => video(page).evaluate(element => ({ paused: (element as HTMLVideoElement).paused, source: element.getAttribute('src') }))).toEqual({ paused: true, source: null });
  await expect(page.locator('.map-background')).not.toHaveAttribute('inert', '');
  expect(await page.evaluate(key => localStorage.getItem(key), SEEN)).toBe('1');
}
async function mapState(page: Page) {
  return page.evaluate(() => {
    const graph = (window as unknown as { __hiphopGraph: {
      nodes: number; edges: number; getVisibleNodeIds: () => string[]; getVisibleEdgeIds: () => string[];
      getWorldPosition: (id: string) => { x: number; y: number };
      getCameraState: () => { x: number; y: number; ratio: number; angle: number };
    } }).__hiphopGraph;
    const nodes = graph.getVisibleNodeIds().sort();
    return { url: location.href, nodes, edges: graph.getVisibleEdgeIds().sort(), camera: graph.getCameraState(), positions: nodes.map(id => [id, graph.getWorldPosition(id)]) };
  });
}

test('a clean first visit plays a muted real trailer while map data loads and exposes an unclipped creator credit', async ({ page }, testInfo) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let requested = false;
  await page.route(MAP_REQUEST, async route => { requested = true; await gate; await route.continue(); });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(dialog(page)).toBeVisible();
    await expect.poll(() => requested).toBe(true);
    expect(await page.evaluate(() => Boolean((window as unknown as { __hiphopGraph?: unknown }).__hiphopGraph))).toBe(false);
    await expect(page.locator('.map-background')).toHaveAttribute('inert', '');
    await playing(video(page));
    expect(await video(page).evaluate(element => ({ muted: (element as HTMLVideoElement).muted, defaultMuted: (element as HTMLVideoElement).defaultMuted }))).toEqual({ muted: true, defaultMuted: true });
    const orientation = await page.evaluate(() => matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape');
    await expect.poll(() => video(page).evaluate(element => (element as HTMLVideoElement).currentSrc)).toContain(`/${orientation}.mp4`);
    await creatorFits(page, dialog(page));
    await page.screenshot({ path: testInfo.outputPath(`trailer-playing-${testInfo.project.name}.png`), fullPage: true });
    release();
    await graphReady(page);
    await expect(dialog(page)).toBeVisible();
    await closeAndConfirmPaused(page);
    await creatorFits(page, page.locator('.masthead'));
    await page.screenshot({ path: testInfo.outputPath(`trailer-closed-map-${testInfo.project.name}.png`), fullPage: true });
  } finally { release(); }
});

test('closing immediately works before map download and a subsequent visit makes no MP4 request', async ({ page, context }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route(MAP_REQUEST, async route => { await gate; await route.continue(); });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(dialog(page)).toBeVisible();
    await closeAndConfirmPaused(page);
    expect(await page.evaluate(() => Boolean((window as unknown as { __hiphopGraph?: unknown }).__hiphopGraph))).toBe(false);
    release();
    await graphReady(page);
    const fresh = await context.newPage();
    let mp4Requests = 0;
    await fresh.route(MEDIA_REQUEST, async route => { mp4Requests++; await route.continue(); });
    try {
      await fresh.goto('/map/?artist=', { waitUntil: 'domcontentloaded' });
      await graphReady(fresh);
      await fresh.waitForLoadState('networkidle');
      await expect(dialog(fresh)).toBeHidden();
      expect(mp4Requests).toBe(0);
      await expect(fresh.getByRole('button', { name: '트레일러 다시 보기' })).toBeVisible();
    } finally { await fresh.close(); }
  } finally { release(); }
});

test('replay traps keyboard focus, makes the map inert, and Escape restores the replay control', async ({ page }) => {
  await seen(page);
  await page.goto('/map/');
  await graphReady(page);
  const replay = page.getByRole('button', { name: '트레일러 다시 보기', exact: true });
  await replay.click();
  await expect(dialog(page)).toBeVisible();
  await expect(page.getByRole('button', { name: '트레일러 닫고 지도 보기' })).toBeFocused();
  await expect(page.locator('.map-background')).toHaveAttribute('inert', '');
  await page.locator('.map-background button').first().evaluate(element => (element as HTMLElement).focus());
  expect(await dialog(page).evaluate(element => element.contains(document.activeElement))).toBe(true);
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press(index < 8 ? 'Tab' : 'Shift+Tab');
    expect(await dialog(page).evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
  await expect(page.locator('.map-background')).not.toHaveAttribute('inert', '');
  await expect(replay).toBeFocused();
  await expect.poll(() => video(page).evaluate(element => (element as HTMLVideoElement).paused)).toBe(true);
});

test('the real media ended event closes the introduction and remembers the visit', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(dialog(page)).toBeVisible();
  await playing(video(page));
  const duration = await video(page).evaluate(element => (element as HTMLVideoElement).duration);
  expect(duration).toBeGreaterThan(29);
  expect(duration).toBeLessThan(31);
  await video(page).evaluate(async element => {
    const media = element as HTMLVideoElement;
    (window as unknown as { __trailerEndedEvents: number }).__trailerEndedEvents = 0;
    media.addEventListener('ended', () => { (window as unknown as { __trailerEndedEvents: number }).__trailerEndedEvents++; }, { once: true });
    media.currentTime = media.duration - .2;
    await media.play();
  });
  await expect.poll(() => page.evaluate(() => (window as unknown as { __trailerEndedEvents: number }).__trailerEndedEvents)).toBe(1);
  await expect(dialog(page)).toBeHidden();
  expect(await page.evaluate(key => localStorage.getItem(key), SEEN)).toBe('1');
  await graphReady(page);
});

test('replaying the trailer supports sound and pause without changing the selected map, filters, or camera', async ({ page }) => {
  await seen(page);
  await page.goto('/map/?artist=garion&from=2005&to=2014');
  await graphReady(page);
  await expect(page.getByRole('complementary', { name: '가리온 상세 정보' })).toBeVisible();
  await expect.poll(async () => {
    const before = (await mapState(page)).camera;
    await frames(page);
    return JSON.stringify((await mapState(page)).camera) === JSON.stringify(before);
  }).toBe(true);
  const before = await mapState(page);
  await page.getByRole('button', { name: '트레일러 다시 보기' }).click();
  await playing(video(page));
  await page.getByRole('button', { name: '소리 켜기', exact: true }).click();
  expect(await video(page).evaluate(element => (element as HTMLVideoElement).muted)).toBe(false);
  await page.getByRole('button', { name: '소리 끄기', exact: true }).click();
  expect(await video(page).evaluate(element => (element as HTMLVideoElement).muted)).toBe(true);
  await page.getByRole('button', { name: '영상 일시정지', exact: true }).click();
  await expect.poll(() => video(page).evaluate(element => (element as HTMLVideoElement).paused)).toBe(true);
  const pausedTime = await video(page).evaluate(element => (element as HTMLVideoElement).currentTime);
  await frames(page, 8);
  expect(await video(page).evaluate(element => (element as HTMLVideoElement).currentTime)).toBe(pausedTime);
  await page.getByRole('button', { name: '영상 재생', exact: true }).click();
  await playing(video(page));
  await closeAndConfirmPaused(page, '지도 탐험하기');
  expect(await mapState(page)).toEqual(before);
  await expect(page.getByRole('complementary', { name: '가리온 상세 정보' })).toBeVisible();
});

test('meaningful shared artist, period, and list URLs go directly to their map with no trailer media', async ({ page }) => {
  let mp4Requests = 0;
  await page.route(MEDIA_REQUEST, async route => { mp4Requests++; await route.continue(); });
  for (const query of ['artist=garion', 'from=2005&to=2014', 'view=list&min=2']) {
    await page.goto(`/map/?${query}`, { waitUntil: 'domcontentloaded' });
    if (query.includes('view=list')) {
      await expect(page.locator('.artist-grid-view')).toBeVisible();
      await expect(page.locator('.artist-grid-card').first()).toBeVisible();
      await expect(page.getByRole('button', { name: '목록 보기', exact: true })).toHaveAttribute('aria-pressed', 'true');
    }
    else await graphReady(page);
    await expect(dialog(page)).toBeHidden();
    if (query === 'artist=garion') await expect(page.getByRole('complementary', { name: '가리온 상세 정보' })).toBeVisible();
    await page.waitForLoadState('networkidle');
  }
  expect(mp4Requests).toBe(0);
  expect(await page.evaluate(key => localStorage.getItem(key), SEEN)).toBeNull();
});

test('an empty artist and unrelated campaign query still show the first-visit introduction', async ({ page }) => {
  await page.goto('/map/?artist=&utm_source=trailer-test', { waitUntil: 'domcontentloaded' });
  await expect(dialog(page)).toBeVisible();
  await closeAndConfirmPaused(page);
  await graphReady(page);
});

test('a first client-side return from credits opens the unseen introduction', async ({ page }) => {
  await page.goto('/credits/');
  expect(await page.evaluate(key => localStorage.getItem(key), SEEN)).toBeNull();
  await page.evaluate(() => { (window as unknown as { __trailerNavigationMarker: string }).__trailerNavigationMarker = 'same-document'; });
  await page.getByRole('link', { name: /지도로 돌아가기/ }).click();
  await expect(dialog(page)).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __trailerNavigationMarker?: string }).__trailerNavigationMarker)).toBe('same-document');
  await playing(video(page));
  await closeAndConfirmPaused(page);
  await graphReady(page);
});

test('changing orientation preserves a paused trailer position and sound preference', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(dialog(page)).toBeVisible();
  await playing(video(page));
  await page.getByRole('button', { name: '소리 켜기', exact: true }).click();
  await page.getByRole('button', { name: '영상 일시정지', exact: true }).click();
  await video(page).evaluate(element => new Promise<void>(resolve => {
    const media = element as HTMLVideoElement;
    media.addEventListener('seeked', () => resolve(), { once: true });
    media.currentTime = 7;
  }));
  const originalViewport = page.viewportSize()!;
  const nextOrientation = originalViewport.width > originalViewport.height ? 'portrait' : 'landscape';
  await page.setViewportSize({ width: originalViewport.height, height: originalViewport.width });
  await expect.poll(() => video(page).evaluate(element => {
    const media = element as HTMLVideoElement;
    return { variant: media.currentSrc.includes('/portrait.mp4') ? 'portrait' : media.currentSrc.includes('/landscape.mp4') ? 'landscape' : '', ready: media.readyState >= 2, paused: media.paused, muted: media.muted, restored: Math.abs(media.currentTime - 7) < .05 };
  })).toEqual({ variant: nextOrientation, ready: true, paused: true, muted: false, restored: true });
  const pausedTime = await video(page).evaluate(element => (element as HTMLVideoElement).currentTime);
  await frames(page, 8);
  expect(await video(page).evaluate(element => (element as HTMLVideoElement).currentTime)).toBe(pausedTime);
  await creatorFits(page, dialog(page));
  await page.screenshot({ path: testInfo.outputPath(`trailer-rotated-paused-${testInfo.project.name}.png`), fullPage: true });
  await page.getByRole('button', { name: '영상 재생', exact: true }).click();
  await playing(video(page));
  expect(await video(page).evaluate(element => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(7);
  await closeAndConfirmPaused(page);
});

for (const failure of ['read', 'write'] as const) test(`restricted storage ${failure} failures skip automatic playback and keep manual replay usable`, async ({ page }) => {
  await page.addInitScript(({ key, failure }) => {
    const originalGet = Storage.prototype.getItem, originalSet = Storage.prototype.setItem;
    Storage.prototype.getItem = function(storageKey: string) {
      if (storageKey.startsWith(key)) { if (failure === 'read') throw new DOMException('Storage disabled for this test', 'SecurityError'); return null; }
      return originalGet.call(this, storageKey);
    };
    Storage.prototype.setItem = function(storageKey: string, value: string) {
      if (storageKey.startsWith(key)) throw new DOMException('Storage disabled for this test', 'SecurityError');
      return originalSet.call(this, storageKey, value);
    };
  }, { key: SEEN, failure });
  let mp4Requests = 0;
  await page.route(MEDIA_REQUEST, async route => { mp4Requests++; await route.continue(); });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await graphReady(page);
  await page.waitForLoadState('networkidle');
  await expect(dialog(page)).toBeHidden();
  expect(mp4Requests).toBe(0);
  await page.getByRole('button', { name: '트레일러 다시 보기' }).click();
  await expect(dialog(page)).toBeVisible();
  await playing(video(page));
  await page.getByRole('button', { name: '지도 탐험하기' }).click();
  await expect(dialog(page)).toBeHidden();
  await expect(page.getByRole('button', { name: '확대', exact: true })).toBeEnabled();
});

test('reduced motion shows a manual poster without a media download until playback is requested', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let mp4Requests = 0;
  await page.route(MEDIA_REQUEST, async route => { mp4Requests++; await route.continue(); });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(dialog(page)).toBeVisible();
  await expect(page.getByRole('button', { name: '영상 재생', exact: true })).toBeVisible();
  await expect(page.locator('.trailer-poster img')).toBeVisible();
  await expect.poll(() => page.locator('.trailer-poster img').evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.waitForLoadState('networkidle');
  expect(mp4Requests).toBe(0);
  expect(await video(page).evaluate(element => ({ paused: (element as HTMLVideoElement).paused, time: (element as HTMLVideoElement).currentTime }))).toEqual({ paused: true, time: 0 });
  await creatorFits(page, dialog(page));
  await page.screenshot({ path: testInfo.outputPath(`trailer-manual-${testInfo.project.name}.png`), fullPage: true });
  await page.getByRole('button', { name: '영상 재생', exact: true }).click();
  await playing(video(page));
  expect(mp4Requests).toBeGreaterThan(0);
  await closeAndConfirmPaused(page);
  await graphReady(page);
});

test('a real media download failure keeps the map exit available and retry recovers playback', async ({ page }, testInfo) => {
  let failing = true, attempts = 0;
  await page.route(MEDIA_REQUEST, async route => { attempts++; await (failing ? route.abort('failed') : route.continue()); });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(dialog(page)).toBeVisible();
  await expect(page.getByRole('button', { name: '영상 다시 재생', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '지도 탐험하기' })).toBeEnabled();
  await expect(page.getByRole('button', { name: '트레일러 닫고 지도 보기' })).toBeEnabled();
  await creatorFits(page, dialog(page));
  await page.screenshot({ path: testInfo.outputPath(`trailer-media-failure-${testInfo.project.name}.png`), fullPage: true });
  const failedAttempts = attempts;
  expect(failedAttempts).toBeGreaterThan(0);
  failing = false;
  await page.getByRole('button', { name: '영상 다시 재생', exact: true }).click();
  await playing(video(page));
  expect(attempts).toBeGreaterThan(failedAttempts);
  await closeAndConfirmPaused(page, '지도 탐험하기');
  await graphReady(page);
});
