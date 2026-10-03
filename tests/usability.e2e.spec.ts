import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.beforeEach(async ({ context }) => {
  await context.route('**/api/visitors', route => route.fulfill({ json: { count: 44 } }));
});
test('search supports keyboard selection, composition and browser history', async ({ page }) => {
  await page.goto('/');
  const input = page.getByRole('combobox', { name: '아티스트 검색', exact: true });
  await input.fill('가리온');
  await input.dispatchEvent('compositionstart'); await input.press('Enter');
  await expect(page).not.toHaveURL(/artist=/);
  await input.dispatchEvent('compositionend'); await input.press('Enter');
  await expect(page).toHaveURL(/artist=garion/);
  await input.fill('버벌진트'); await input.press('Enter');
  await expect(page).toHaveURL(/artist=verbal-jint/);
  await page.goBack(); await expect(page).toHaveURL(/artist=garion/);
  await expect(page.getByRole('heading', { name: '가리온', exact: true })).toBeVisible();
  await page.goForward(); await expect(page.getByRole('heading', { name: '버벌진트', exact: true })).toBeVisible();
  await input.fill('a');
  await expect(page.getByRole('option')).toHaveCount(9);
  for (let index = 0; index < 8; index++) await input.press('ArrowDown');
  const list = page.getByRole('region', { name: '검색 결과', exact: true });
  await expect.poll(() => list.evaluate(element => {
    const selected = element.querySelector('[aria-selected="true"]')!.getBoundingClientRect();
    const bounds = element.getBoundingClientRect();
    return selected.top >= bounds.top - 1 && selected.bottom <= bounds.bottom + 1;
  })).toBe(true);
  await input.press('Escape'); await expect(page.getByRole('option')).toHaveCount(0);
});
test('stale artist data offers refresh and loads matching evidence after reload', async ({ page }) => {
  let stale = true;
  await page.route('**/data/artists/garion.json*', async route => {
    const response = await route.fetch(); const data = await response.json();
    await route.fulfill({ json: { ...data, version: stale ? 'old-dataset' : data.version } });
  });
  await page.goto('/?artist=garion');
  await expect(page.getByRole('heading', { name: '가리온', exact: true })).toBeVisible();
  const expand = page.getByRole('button', { name: '상세 펼치기' }); if (await expand.isVisible()) await expand.click();
  await page.getByRole('tab', { name: '참여곡' }).click();
  await expect(page.getByRole('button', { name: '페이지 새로고침' })).toBeVisible();
  stale = false;
  await page.getByRole('button', { name: '페이지 새로고침' }).click();
  await expect(page.getByRole('heading', { name: '가리온', exact: true })).toBeVisible();
  if (await expand.isVisible()) await expand.click();
  await page.getByRole('tab', { name: '참여곡' }).click();
  await expect(page.locator('.recording-row').first()).toBeVisible();
});
test('failed artist evidence can be retried without losing the selected artist', async ({ page }) => {
  let unavailable = true;
  await page.route('**/data/artists/garion.json*', route => unavailable ? route.fulfill({ status: 503, json: { error: 'unavailable' } }) : route.continue());
  await page.goto('/?artist=garion');
  await expect(page.getByRole('heading', { name: '가리온', exact: true })).toBeVisible();
  const expand = page.getByRole('button', { name: '상세 펼치기' }); if (await expand.isVisible()) await expand.click();
  await page.getByRole('tab', { name: '참여곡' }).click();
  await expect(page.getByRole('button', { name: '다시 불러오기' })).toBeVisible();
  unavailable = false;
  await page.getByRole('button', { name: '다시 불러오기' }).click();
  await expect(page.locator('.recording-row').first()).toBeVisible();
  await expect(page).toHaveURL(/artist=garion/);
});
test('responsive layouts and expanded detail expose readable controls without overflow', async ({ page }, info) => {
  test.setTimeout(90_000);
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto('/?artist=garion');
    await expect(page.getByRole('heading', { name: '가리온', exact: true })).toBeVisible();
    const expand = page.getByRole('button', { name: '상세 펼치기' }); if (await expand.isVisible()) await expand.click();
    await expect(page.getByRole('tab', { name: '협업자', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: info.outputPath(`selected-${width}.png`), fullPage: true });
  }
});
test('map, expanded artist details and filters pass automated accessibility checks', async ({ page }, info) => {
  await page.goto('/?artist=garion');
  await expect(page.getByRole('heading', { name: '가리온', exact: true })).toBeVisible();
  const expand = page.getByRole('button', { name: '상세 펼치기' }); if (await expand.isVisible()) await expand.click();
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  await info.attach('axe-detail.json', { body: JSON.stringify(result.violations, null, 2), contentType: 'application/json' });
  expect(result.violations).toEqual([]);
  await page.getByRole('button', { name: '기간 설정', exact: true }).click();
  const filters = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(filters.violations).toEqual([]);
  await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: '기간 설정', exact: true })).toBeFocused();
});
