import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { Artist, Dataset } from '../src/lib/types';

type GraphMetrics = {
  nodes: number; edges: number;
  getPosition: (id: string) => { x: number; y: number } | undefined;
  getWorldPosition: (id: string) => { x: number; y: number } | undefined;
};

function catalog(): Dataset { return JSON.parse(readFileSync('data/catalog.enriched.json', 'utf8')); }
function voices(recording: Dataset['recordings'][number], core: Set<string>): string[] {
  return [...new Set(recording.credits.filter(c => ['main', 'featured', 'rap', 'vocal'].includes(c.role) && c.verification !== 'pending' && core.has(c.artistId)).map(c => c.artistId))];
}
function adjacency(data: Dataset): Map<string, Set<string>> {
  const core = new Set(data.artists.filter(a => a.core).map(a => a.id));
  const result = new Map<string, Set<string>>();
  for (const recording of data.recordings.filter(r => r.verification !== 'pending')) {
    const ids = voices(recording, core);
    for (const a of ids) for (const b of ids) if (a !== b) {
      if (!result.has(a)) result.set(a, new Set());
      result.get(a)!.add(b);
    }
  }
  return result;
}
function connectedArtist(data: Dataset): Artist {
  const neighbors = adjacency(data);
  const candidate = [...neighbors].sort((a,b) => b[1].size - a[1].size)[0]?.[0];
  if (!candidate) throw new Error('The real catalog contains no core collaboration to test.');
  return data.artists.find(a => a.id === candidate)!;
}
async function graphReady(page: Page) {
  await expect.poll(() => page.evaluate(() => (window as unknown as { __hiphopGraph?: GraphMetrics }).__hiphopGraph?.nodes || 0)).toBeGreaterThan(0);
  await expect(page.locator('.graph-error[role="alert"]')).toHaveCount(0);
}
async function openFilters(page: Page) {
  const toggle = page.getByRole('button', { name: '검색 · 필터' });
  if (await toggle.isVisible() && await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click();
}
async function searchSelect(page: Page, artist: Artist, query = artist.nameEn) {
  await openFilters(page);
  await page.getByRole('textbox', { name: '아티스트 검색' }).fill(query);
  await page.getByRole('region', { name: '검색 결과' }).getByRole('button').filter({ has: page.getByText(artist.name, { exact: true }) }).first().click();
  await expect(page.getByRole('complementary', { name: `${artist.name} 상세 정보` })).toBeVisible();
}

test('the real source-backed graph renders, supports zoom, and fits the viewport', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/map/');
  await graphReady(page);
  expect(catalog().artists.filter(a => a.core).length).toBeGreaterThanOrEqual(150);
  await expect(page.locator('.sigma-container canvas')).not.toHaveCount(0);
  await page.getByRole('button', { name: '확대', exact: true }).click();
  await page.getByRole('button', { name: '축소', exact: true }).click();
  await page.getByRole('button', { name: '지도 전체 보기' }).click();
  const dimensions = await page.evaluate(() => ({ pageWidth: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(dimensions.pageWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath(`map-${testInfo.project.name}.png`), fullPage: true });
});

test('alias search selects a person while group identities remain distinct', async ({ page }) => {
  const data = catalog();
  const group = data.artists.find(a => a.id === 'garion')!;
  const person = data.artists.find(a => a.id === 'mc-meta')!;
  expect(group.kind).toBe('group'); expect(person.kind).toBe('person');
  await page.goto('/map/?artist=garion');
  await graphReady(page);
  await expect(page.getByRole('complementary', { name: `${group.name} 상세 정보` }).locator('.artist-main-portrait .group-badge')).toBeVisible();
  await searchSelect(page, person, person.aliases.find(a => a !== person.name) || person.nameEn);
  await expect(page).toHaveURL(new RegExp(`artist=${person.id}`));
  await expect(page.getByRole('complementary', { name: `${person.name} 상세 정보` }).locator('.artist-main-portrait .group-badge')).toHaveCount(0);
  await openFilters(page);
  await page.getByRole('textbox', { name: '아티스트 검색' }).fill('없는아티스트-zzzz');
  await expect(page.getByRole('region', { name: '검색 결과' })).toContainText('일치하는 아티스트가 없습니다.');
});

test('canvas node selection opens the matching artist', async ({ page }) => {
  await page.goto('/map/?artist=');
  await graphReady(page);
  const bounds = await page.locator('.sigma-container').boundingBox();
  expect(bounds).not.toBeNull();
  const data = catalog(), neighbors = adjacency(data);
  const candidates = data.artists.filter(a => a.core).sort((a,b) => (neighbors.get(b.id)?.size || 0) - (neighbors.get(a.id)?.size || 0));
  const node = await page.evaluate(({ ids, width, height }) => {
    const graph = (window as unknown as { __hiphopGraph: GraphMetrics }).__hiphopGraph;
    for (const id of ids) {
      const p = graph.getPosition(id);
      // The discovery panel covers the left edge, and the caption covers the bottom.
      if (p && p.x > Math.min(340, width * 0.5) && p.x < width - 60 && p.y > 85 && p.y < height - 85) return { id, ...p };
    }
    return null;
  }, { ids: candidates.map(a => a.id), width: bounds!.width, height: bounds!.height });
  expect(node, 'a real node must be visible in the interactive graph region').not.toBeNull();
  await page.mouse.click(bounds!.x + node!.x, bounds!.y + node!.y);
  const artist = candidates.find(a => a.id === node!.id)!;
  await expect(page.getByRole('complementary', { name: `${artist.name} 상세 정보` })).toBeVisible();
});

test('a collaboration exposes actual recordings, credits, and external sources', async ({ page }) => {
  const artist = connectedArtist(catalog());
  await page.goto(`/map/?artist=${artist.id}`);
  await graphReady(page);
  const panel = page.getByRole('complementary', { name: `${artist.name} 상세 정보` });
  await panel.getByRole('button', { name: /와 공동 작업 \d+곡 보기/ }).first().click();
  const edgePanel = page.getByRole('complementary', { name: '공동 작업곡 상세' });
  await expect(edgePanel).toBeVisible();
  const rows = edgePanel.locator('.recording-row');
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThan(0);
  await rows.first().locator('summary').click();
  const sources = rows.first().locator('.source-details a');
  await expect.poll(() => sources.count()).toBeGreaterThan(0);
  await expect(sources.first()).toHaveAttribute('href', /^https:\/\//);
  await expect(rows.first().locator('.recording-artists')).not.toBeEmpty();
  await expect(rows.first().getByRole('link', { name: /듣기/ })).toHaveAttribute('href', /^https:\/\//);
});

test('period, single-year and minimum-song filters agree with the visible catalog', async ({ page }) => {
  const data = catalog();
  const core = new Set(data.artists.filter(a => a.core).map(a => a.id));
  const expectedIds = new Set(data.recordings.filter(r => r.verification !== 'pending' && r.year >= 2005 && r.year <= 2014).flatMap(r => voices(r, core)));
  await page.goto('/map/?artist=');
  await graphReady(page);
  await page.getByRole('spinbutton', { name: '시작 연도 직접 입력' }).fill('2005');
  await page.getByRole('spinbutton', { name: '끝 연도 직접 입력' }).fill('2014');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __hiphopGraph: GraphMetrics }).__hiphopGraph.nodes)).toBe(expectedIds.size);
  await expect(page).toHaveURL(/from=2005/);
  await expect(page).toHaveURL(/to=2014/);
  await page.getByRole('button', { name: '한 해', exact: true }).click();
  await expect(page.getByRole('slider', { name: '시작 연도', exact: true })).toHaveCount(0);
  await expect(page).toHaveURL(/mode=year/);
  await page.getByRole('button', { name: '누적', exact: true }).click();
  await expect(page).toHaveURL(/mode=cumulative/);
  await openFilters(page);
  const beforeEdges = await page.evaluate(() => (window as unknown as { __hiphopGraph: GraphMetrics }).__hiphopGraph.edges);
  await page.getByRole('slider', { name: '최소 공동 작업곡' }).fill('5');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __hiphopGraph: GraphMetrics }).__hiphopGraph.edges)).toBeLessThanOrEqual(beforeEdges);
  await expect(page).toHaveURL(/min=5/);
});

test('shortest-path selection and shared URL survive a fresh browser page', async ({ page, context }) => {
  const data = catalog(), neighbors = adjacency(data), source = connectedArtist(data);
  const direct = neighbors.get(source.id)!;
  const target = [...direct].flatMap(id => [...(neighbors.get(id) || [])]).find(id => id !== source.id && !direct.has(id));
  expect(target, 'real data should contain a two-step connection').toBeTruthy();
  await page.goto(`/map/?artist=${source.id}`);
  await graphReady(page);
  await openFilters(page);
  await page.locator('.path-tools > summary').click();
  await page.getByRole('combobox', { name: '연결 경로 대상 아티스트' }).selectOption(target!);
  await expect(page.locator('.path-result')).toContainText('2단계로 연결');
  await page.getByRole('spinbutton', { name: '시작 연도 직접 입력' }).fill('2000');
  await page.getByRole('button', { name: '목록 보기', exact: true }).click();
  const shared = page.url();
  expect(shared).toContain(`artist=${source.id}`); expect(shared).toContain(`target=${target}`); expect(shared).toContain('view=list');
  await page.getByRole('button', { name: '지도 공유' }).click();
  await expect(page.locator('.share-toast')).toContainText(/링크를 복사했습니다|URL로 현재 지도를 공유/);
  const fresh = await context.newPage();
  await fresh.goto(shared);
  await expect(fresh.getByRole('complementary', { name: `${source.name} 상세 정보` })).toBeVisible();
  await expect(fresh.getByRole('button', { name: '목록 보기', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(fresh.getByRole('spinbutton', { name: '시작 연도 직접 입력' })).toHaveValue('2000');
  await openFilters(fresh);
  await fresh.locator('.path-tools > summary').click();
  await expect(fresh.getByRole('combobox', { name: '연결 경로 대상 아티스트' })).toHaveValue(target!);
  await fresh.close();
});

test('period relayout completes while search stays responsive and filters restore the baseline', async ({ page }) => {
  await page.goto('/map/?artist=&from=2005&to=2014');
  await graphReady(page);
  const data = catalog(), core = new Set(data.artists.filter(a => a.core).map(a => a.id));
  const probes = [...new Set(data.recordings.filter(r => r.verification !== 'pending' && r.year >= 2005 && r.year <= 2014).flatMap(r => voices(r, core)).slice(0, 20))];
  const before = await page.evaluate(ids => ids.map(id => (window as unknown as { __hiphopGraph: GraphMetrics }).__hiphopGraph.getWorldPosition(id)), probes);
  let workerCreated = false;
  page.on('worker', () => { workerCreated = true; });
  const button = page.getByRole('button', { name: '기간으로 재배치' });
  await button.click();
  await expect(page.locator('.layout-status')).toContainText('배치하고 있어요');
  await openFilters(page);
  await page.getByRole('textbox', { name: '아티스트 검색' }).fill('Garion');
  await expect(page.getByRole('region', { name: '검색 결과' })).toContainText('가리온');
  await page.getByRole('textbox', { name: '아티스트 검색' }).press('Escape');
  await expect(page.locator('.layout-status')).toContainText('선택한 기간으로 배치했어요');
  await expect(button).toBeEnabled();
  const after = await page.evaluate(ids => ids.map(id => (window as unknown as { __hiphopGraph: GraphMetrics }).__hiphopGraph.getWorldPosition(id)), probes);
  expect(workerCreated, 'ForceAtlas2 must execute in a browser worker').toBe(true);
  expect(after.some((position, index) => position && before[index] && Math.hypot(position.x - before[index]!.x, position.y - before[index]!.y) > 0.001), 'worker output must change actual graph coordinates').toBe(true);
  const mobileClose = page.getByRole('button', { name: '필터 닫기' });
  if (await mobileClose.isVisible()) await mobileClose.click();
  await page.getByRole('spinbutton', { name: '끝 연도 직접 입력' }).fill('2013');
  await expect(page.locator('.layout-status')).toHaveCount(0);
  await expect(page.locator('.graph-error')).toHaveCount(0);
});

test('WebGL failure preserves artist exploration through the list view', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (/webgl/.test(type)) return null;
      return (getContext as (...args: unknown[]) => unknown).call(this, type, ...args);
    } as typeof getContext;
  });
  await page.goto('/map/?artist=');
  await expect(page.locator('.graph-error[role="alert"]')).toContainText('이 환경에서는 지도를 표시할 수 없어요');
  await page.getByRole('button', { name: '목록 보기', exact: true }).click();
  await expect(page.locator('.artist-grid-card').first()).toBeVisible();
  await page.locator('.artist-grid-card').first().click();
  await expect(page.locator('.artist-panel')).toBeVisible();
});

test('portrait failure falls back to a named node and a readable artist panel', async ({ page }) => {
  const artist = catalog().artists.find(a => a.core && a.image);
  expect(artist, 'the catalog must contain reusable actual artist portraits').toBeTruthy();
  await page.route(`**${artist!.image!.src}`, route => route.abort());
  await page.goto(`/map/?artist=${artist!.id}`);
  await graphReady(page);
  const panel = page.getByRole('complementary', { name: `${artist!.name} 상세 정보` });
  await expect(panel.locator('.artist-main-portrait .portrait-initial')).toBeVisible();
  await expect(panel.getByRole('heading', { name: artist!.name, exact: true })).toBeVisible();
});

test('legend, methodology, credits and standalone discography remain accessible', async ({ page }) => {
  await page.goto('/map/');
  await graphReady(page);
  await page.getByRole('button', { name: '지도 범례 보기' }).click();
  await expect(page.getByRole('dialog')).toContainText('친분이나 음악적 유사성의 수치는 아닙니다');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/methodology/');
  await expect(page.locator('main')).toContainText('1995');
  await page.goto('/credits/');
  await expect(page.locator('.credit-card').first()).toBeVisible();
  await expect(page.locator('.credit-card').first().getByRole('link', { name: /CC/ }).first()).toHaveAttribute('href', /^https:\/\//);
  const artist = connectedArtist(catalog());
  await page.goto(`/artists/${artist.id}/`);
  await expect(page.getByRole('heading', { name: artist.name, exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '확인된 참여곡' })).toBeVisible();
  await expect(page.locator('.archive-table a[href^="https://musicbrainz.org/recording/"]').first()).toBeVisible();
});
