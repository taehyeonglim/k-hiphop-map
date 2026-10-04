import { test, expect } from '@playwright/test';

test('album search finds Hanja titles and restores URL filters', async ({ page }) => {
  await page.goto('/releases/?q=대한민국&from=1995&to=2004&type=compilation');
  await expect(page.getByRole('searchbox', { name: '앨범·아티스트 검색' })).toHaveValue('대한민국');
  await expect(page.locator('.release-card')).not.toHaveCount(0);
  await expect(page.locator('.release-card h2').filter({ hasText: '2001 大韓民國' })).toBeVisible();
  await page.getByRole('searchbox', { name: '앨범·아티스트 검색' }).fill('MP 2000');
  await expect(page.locator('.release-card').filter({ hasText: 'MP Hip-Hop Project 2000' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('searchbox', { name: '앨범·아티스트 검색' })).toHaveValue('MP 2000');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('complete compilation detail exposes recovered tracks and credits', async ({ page }) => {
  await page.goto('/releases/mb-738fb14a-47bf-4126-b394-7e33cbe9b80d/');
  await expect(page.locator('.album-tracks > li')).toHaveCount(18);
  await expect(page.getByRole('heading', { name: 'Underground', exact: true })).toBeVisible();
  await page.goto('/releases/mb-cd513236-e02a-4378-a94e-f83b118e4c6c/');
  const titleTrack = page.locator('.album-tracks > li').filter({ has: page.getByRole('heading', { name: 'Change The Game', exact: true }) });
  await expect(titleTrack.locator('.track-people a')).toHaveCount(5);
  await titleTrack.getByText('트랙 출처와 크레딧 근거').click();
  await expect(titleTrack.locator('a[href="https://music.bugs.co.kr/track/519441"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('source-only early album and photo survey are discoverable', async ({ page }) => {
  await page.goto('/releases/maniadb-102257/');
  await expect(page.locator('.album-tracks > li')).toHaveCount(18);
  await page.getByRole('link', { name: '수집 현황', exact: true }).click();
  await expect(page.locator('.coverage-metrics')).toBeVisible();
  await page.getByLabel('아티스트 이름').fill('주석');
  // Joosuc is now photographed; the default missing-only view must exclude him.
  await expect(page.locator('.coverage-list')).not.toContainText('주석');
  await page.getByLabel('조사 상태').selectOption('included');
  await expect(page.locator('.coverage-list')).toContainText('주석');
  await expect(page.locator('.coverage-list')).toContainText('사진 반영');
  await expect(page.locator('.coverage-list')).toContainText('재사용 허락 미확인');
  await page.locator('.coverage-list').getByRole('link', { name: '주석', exact: true }).click();
  const photo = page.locator('.artist-document-header img');
  await expect(photo).toHaveAttribute('src', '/images/artists/joosuc.webp');
  await expect(photo).toBeVisible();
  expect(await photo.evaluate(async (image: HTMLImageElement) => { await image.decode(); return image.naturalWidth; })).toBe(256);
});

test('album index failure can be retried without inventing an empty catalog', async ({ page }) => {
  let failed = true;
  await page.route('**/data/releases.json*', route => failed ? route.fulfill({ status: 503, body: 'Unavailable' }) : route.continue());
  await page.goto('/releases/');
  await expect(page.locator('.document-note[role="alert"]')).toContainText('불러오지 못했습니다');
  failed = false;
  await page.getByRole('button', { name: '다시 시도', exact: true }).click();
  await expect(page.locator('.release-card').first()).toBeVisible();
});
