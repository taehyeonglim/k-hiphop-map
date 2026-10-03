import { test, expect, type Page } from '@playwright/test';
const MEDIA = /\/media\/trailer\/v\d+\/(?:landscape|portrait)\.mp4(?:\?.*)?$/;
const dialog = (page: Page) => page.getByRole('dialog', { name: '한국힙합 연결고리', exact: true });
const video = (page: Page) => page.getByTestId('trailer-video');
const failures = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page, context }) => {
  await context.route('**/api/visitors', route => route.fulfill({ json: { count: 0, counted: false } }));
  const errors: string[] = []; failures.set(page, errors); page.on('pageerror', error => errors.push(error.message));
});
test.afterEach(async ({ page }) => expect(failures.get(page)).toEqual([]));
async function open(page: Page) { await page.getByRole('button', { name: '30초 소개 영상', exact: true }).click(); await expect(dialog(page)).toBeVisible(); }
async function playing(page: Page) {
  await expect.poll(() => video(page).evaluate(element => { const media = element as HTMLVideoElement; return media.readyState >= 2 && !media.paused && media.currentTime > .2; })).toBe(true);
}
async function close(page: Page) {
  await page.getByRole('button', { name: '트레일러 닫고 지도 보기' }).click();
  await expect(dialog(page)).toBeHidden();
  await expect.poll(() => video(page).evaluate(element => ({ paused: (element as HTMLVideoElement).paused, src: element.getAttribute('src') }))).toEqual({ paused: true, src: null });
  await expect(page.getByRole('button', { name: '30초 소개 영상' })).toBeFocused();
}
test('first, shared and previously-seen visits load no trailer assets before an explicit request', async ({ page }) => {
  const requested: string[] = []; page.on('request', request => { if (request.url().includes('/media/trailer/')) requested.push(request.url()); });
  for (const path of ['/', '/?artist=garion&from=2005&to=2014', '/map/']) {
    await page.goto(path); await page.waitForLoadState('networkidle');
    await expect(page.getByRole('combobox', { name: '아티스트 검색', exact: true })).toBeVisible();
    await expect(dialog(page)).toHaveCount(0);
  }
  expect(requested).toEqual([]);
});
test('manual introduction plays muted real media, controls sound and restores focus', async ({ page }, info) => {
  await page.goto('/?artist=garion');
  const before = page.url();
  await open(page); await playing(page);
  expect(await video(page).evaluate(element => (element as HTMLVideoElement).muted)).toBe(true);
  await expect(page.locator('.map-background')).toHaveAttribute('inert', '');
  await page.getByRole('button', { name: '소리 켜기' }).click();
  expect(await video(page).evaluate(element => (element as HTMLVideoElement).muted)).toBe(false);
  await page.getByRole('button', { name: '영상 일시정지' }).click();
  expect(await video(page).evaluate(element => (element as HTMLVideoElement).paused)).toBe(true);
  await page.screenshot({ path: info.outputPath('manual-trailer.png') });
  await close(page); await expect(page).toHaveURL(before);
  await expect(page.locator('.map-background')).not.toHaveAttribute('inert', '');
});
test('reduced motion waits for play and Escape closes the dialog', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let requests = 0; page.on('request', request => { if (MEDIA.test(request.url())) requests++; });
  await page.goto('/'); await open(page);
  await expect(page.getByRole('button', { name: '영상 재생', exact: true })).toBeVisible();
  expect(requests).toBe(0);
  await page.getByRole('button', { name: '영상 재생', exact: true }).click(); await playing(page);
  expect(requests).toBeGreaterThan(0);
  await page.keyboard.press('Escape'); await expect(dialog(page)).toBeHidden();
});
test('failed media can be retried and the map always remains reachable', async ({ page }) => {
  let fail = true;
  await page.route(MEDIA, route => fail ? route.abort() : route.continue());
  await page.goto('/'); await open(page);
  await expect(page.getByRole('button', { name: '영상 다시 재생' })).toBeVisible();
  fail = false; await page.getByRole('button', { name: '영상 다시 재생' }).click(); await playing(page);
  await close(page);
});
test('restricted storage does not affect optional playback and dialog focus is contained', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error('Storage unavailable'); }; Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); }; });
  await page.goto('/'); await open(page);
  await expect(page.getByRole('button', { name: '트레일러 닫고 지도 보기' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await dialog(page).evaluate(element => element.contains(document.activeElement))).toBe(true);
  await close(page);
});
test('ending the real video returns to the unchanged selected network', async ({ page }) => {
  await page.goto('/?artist=garion'); await open(page); await playing(page);
  await video(page).evaluate(element => { const media = element as HTMLVideoElement; media.currentTime = media.duration - .4; });
  await expect(dialog(page)).toBeHidden();
  await expect(page).toHaveURL(/artist=garion/);
});
test('orientation changes use the corresponding film and preserve the sound preference', async ({ page }) => {
  await page.goto('/'); await open(page); await playing(page);
  await page.getByRole('button', { name: '소리 켜기' }).click();
  const size = page.viewportSize()!;
  await page.setViewportSize(size.width < size.height ? { width: 1000, height: 600 } : { width: 390, height: 844 });
  await playing(page);
  const orientation = await page.evaluate(() => matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape');
  await expect.poll(() => video(page).evaluate(element => (element as HTMLVideoElement).currentSrc)).toContain(`/${orientation}.mp4`);
  expect(await video(page).evaluate(element => (element as HTMLVideoElement).muted)).toBe(false);
});
