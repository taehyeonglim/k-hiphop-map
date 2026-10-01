import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { Artist, Dataset } from '../src/lib/types';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try { localStorage.setItem('khiphopmap:trailer:v1:seen', '1'); } catch { /* Map behavior remains testable when storage is unavailable. */ }
  });
});

type GraphMetrics = {
  nodes: number; edges: number;
  visibleNodes: number; visibleEdges: number;
  getVisibleNodeIds: () => string[];
  getVisibleEdgeIds: () => string[];
  getPosition: (id: string) => { x: number; y: number } | undefined;
  getWorldPosition: (id: string) => { x: number; y: number } | undefined;
  getCameraState: () => { x: number; y: number; ratio: number; angle: number };
  getInteractionState: () => { isDragging: boolean; isSettling: boolean; hoveredId?: string };
};

function catalog(): Dataset { return JSON.parse(readFileSync('data/catalog.enriched.json', 'utf8')); }
function voices(recording: Dataset['recordings'][number], core: Set<string>): string[] {
  return [...new Set(recording.credits.filter(c => ['main', 'featured', 'rap', 'vocal'].includes(c.role) && c.verification !== 'pending' && core.has(c.artistId)).map(c => c.artistId))];
}
function adjacency(data: Dataset, from = 1995, to = Number(data.asOf.slice(0, 4)), minCount = 1): Map<string, Set<string>> {
  const core = new Set(data.artists.filter(a => a.core).map(a => a.id));
  const result = new Map<string, Set<string>>();
  const pairs = new Map<string, { first: string; second: string; count: number }>();
  for (const recording of data.recordings.filter(r => r.verification !== 'pending' && r.year >= from && r.year <= to)) {
    const ids = voices(recording, core);
    for (let first = 0; first < ids.length; first++) for (let second = first + 1; second < ids.length; second++) {
      const key = [ids[first], ids[second]].sort().join('__');
      const pair = pairs.get(key) || { first: ids[first], second: ids[second], count: 0 };
      pair.count++; pairs.set(key, pair);
    }
  }
  for (const pair of pairs.values()) if (pair.count >= minCount) {
    if (!result.has(pair.first)) result.set(pair.first, new Set());
    if (!result.has(pair.second)) result.set(pair.second, new Set());
    result.get(pair.first)!.add(pair.second); result.get(pair.second)!.add(pair.first);
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
const tieId = (first: string, second: string) => [first, second].sort().join('__');
async function visibleIds(page: Page) {
  return page.evaluate(() => (window as unknown as { __hiphopGraph: GraphMetrics }).__hiphopGraph.getVisibleNodeIds().sort());
}
async function expectNeighborhood(page: Page, source: string, neighbors: Map<string, Set<string>>) {
  const direct = [...(neighbors.get(source) || [])];
  await expect.poll(() => visibleIds(page)).toEqual([source, ...direct].sort());
  await expect.poll(() => page.evaluate(() => (window as unknown as { __hiphopGraph: GraphMetrics }).__hiphopGraph.getVisibleEdgeIds().sort())).toEqual(direct.map(id => tieId(source, id)).sort());
  const counts = await page.evaluate(() => {
    const metrics = (window as unknown as { __hiphopGraph: GraphMetrics }).__hiphopGraph;
    return { nodes: metrics.visibleNodes, edges: metrics.visibleEdges };
  });
  expect(counts).toEqual({ nodes: direct.length + 1, edges: direct.length });
}
async function expectFocusedNodesClear(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    const metrics = (window as unknown as { __hiphopGraph: GraphMetrics }).__hiphopGraph;
    const canvas = document.querySelector('.sigma-container')!.getBoundingClientRect();
    const overlays = [...document.querySelectorAll<HTMLElement>('.network-focus, .mobile-filter-toggle, .view-switch, .canvas-controls button')].filter(element => {
      const style = getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
    }).map(element => ({ className: element.className, rect: element.getBoundingClientRect() }));
    return metrics.getVisibleNodeIds().flatMap(id => {
      const point = metrics.getPosition(id);
      if (!point) return [{ id, blockedBy: 'missing projected position' }];
      const x = canvas.left + point.x, y = canvas.top + point.y;
      if (x < canvas.left + 1 || x > canvas.right - 1 || y < canvas.top + 1 || y > canvas.bottom - 1) return [{ id, blockedBy: 'outside canvas' }];
      const overlay = overlays.find(({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
      return overlay ? [{ id, blockedBy: overlay.className }] : [];
    });
  }), { message: 'fitted artist centers must be visible outside opaque interface overlays' }).toEqual([]);
}
async function frames(page: Page, count = 3) {
  await page.evaluate(async count => {
    for (let index = 0; index < count; index++) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }, count);
}
async function interactiveNode(page: Page, ids: string[]) {
  const bounds = await page.locator('.sigma-container').boundingBox();
  expect(bounds).not.toBeNull();
  const node = await page.evaluate(({ ids, width, height, left, top }) => {
    const metrics = (window as unknown as { __hiphopGraph: GraphMetrics }).__hiphopGraph;
    for (const id of ids) {
      const point = metrics.getPosition(id);
      if (!point || point.x < 18 || point.x > width - 18 || point.y < 18 || point.y > height - 18) continue;
      const element = document.elementFromPoint(left + point.x, top + point.y);
      if (element?.closest('.sigma-container')) return { id, ...point };
    }
    return null;
  }, { ids, width: bounds!.width, height: bounds!.height, left: bounds!.x, top: bounds!.y });
  expect(node, 'an actual node must be clear of search, caption, and map controls').not.toBeNull();
  return { id: node!.id, x: bounds!.x + node!.x, y: bounds!.y + node!.y };
}
async function graphState(page: Page, ids: string[]) {
  return page.evaluate(ids => {
    const metrics = (window as unknown as { __hiphopGraph: GraphMetrics }).__hiphopGraph;
    const positions = Object.fromEntries(ids.map(id => {
      const point = metrics.getWorldPosition(id);
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) throw new Error(`Non-finite or missing graph position for ${id}`);
      return [id, point];
    })) as Record<string, { x: number; y: number }>;
    return { positions, camera: metrics.getCameraState(), interaction: metrics.getInteractionState() };
  }, ids);
}
async function dragTarget(page: Page, point: { x: number; y: number }, dx = 44, dy = 28) {
  const bounds = (await page.locator('.sigma-container').boundingBox())!;
  return { x: point.x + (point.x + dx < bounds.x + bounds.width - 20 ? dx : -dx), y: point.y + (point.y + dy < bounds.y + bounds.height - 20 ? dy : -dy) };
}
type CapturedGraphState = Awaited<ReturnType<typeof graphState>>;
function motionDistance(before: CapturedGraphState, after: CapturedGraphState, ids: string[]) {
  return Math.max(0, ...ids.map(id => Math.hypot(after.positions[id].x - before.positions[id].x, after.positions[id].y - before.positions[id].y)));
}
function cameraDistance(before: CapturedGraphState, after: CapturedGraphState) {
  return Math.max(...(['x', 'y', 'ratio', 'angle'] as const).map(key => Math.abs(before.camera[key] - after.camera[key])));
}
async function stableCamera(page: Page) {
  await expect.poll(async () => {
    const before = await graphState(page, []); await frames(page);
    return cameraDistance(before, await graphState(page, []));
  }).toBeLessThan(0.000001);
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

test('a failed map download exposes a retry that loads the real graph', async ({ page }) => {
  let failing = true;
  let attempts = 0;
  await page.route(/\/data\/map\.json(?:\?.*)?$/, route => {
    attempts++;
    return failing ? route.abort() : route.continue();
  });
  await page.goto('/map/?artist=');
  await expect(page.locator('.bootstrap-error[role="alert"]')).toContainText('지도를 불러오지 못했습니다.');
  await expect(page.locator('.bootstrap-error')).toContainText('연결 상태를 확인한 뒤 다시 불러와 주세요.');
  expect(attempts).toBeGreaterThan(0);
  const failedAttempts = attempts;
  failing = false;
  await page.getByRole('button', { name: '다시 불러오기', exact: true }).click();
  await graphReady(page);
  expect(attempts).toBeGreaterThan(failedAttempts);
  await expect(page.locator('.bootstrap-error')).toHaveCount(0);
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

test('selected neighborhoods contain only credited direct collaborators and reset to the overview', async ({ page }, testInfo) => {
  const data = catalog(), neighbors = adjacency(data), source = data.artists.find(artist => artist.id === 'garion')!;
  const errors: string[] = [], failedResponses: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`); });
  const allIds = data.artists.filter(artist => artist.core).map(artist => artist.id).sort();
  expect(neighbors.get(source.id)!.size).toBeGreaterThan(1);
  expect(neighbors.get(source.id)!.size).toBeLessThan(allIds.length - 1);
  await page.goto('/map/?artist=');
  await graphReady(page);
  await expect.poll(() => visibleIds(page)).toEqual(allIds);
  const selected = await interactiveNode(page, [source.id]);
  await page.mouse.click(selected.x, selected.y);
  await expectNeighborhood(page, source.id, neighbors);
  await stableCamera(page);
  const strangers = allIds.filter(id => id !== source.id && !neighbors.get(source.id)!.has(id));
  const stranger = await interactiveNode(page, strangers);
  await page.mouse.move(stranger.x, stranger.y);
  await frames(page);
  await expectNeighborhood(page, source.id, neighbors);
  const hovered = (await graphState(page, [])).interaction.hoveredId;
  expect(hovered === undefined || hovered === source.id || neighbors.get(source.id)!.has(hovered), 'hover must not make an unconnected hidden artist pickable').toBe(true);
  const allowedNames = new Set([source.id, ...neighbors.get(source.id)!].map(id => data.artists.find(artist => artist.id === id)!.name));
  const tooltip = page.locator('.canvas-tooltip strong');
  if (await tooltip.isVisible()) expect(allowedNames.has((await tooltip.textContent())!)).toBe(true);
  await page.mouse.move(0, 0);
  await expectFocusedNodesClear(page);
  await page.waitForLoadState('networkidle');
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport + 1);
  await page.screenshot({ path: testInfo.outputPath(`neighborhood-${testInfo.project.name}.png`), fullPage: true });
  const neighbor = await interactiveNode(page, [...neighbors.get(source.id)!]);
  await page.mouse.click(neighbor.x, neighbor.y);
  await expectNeighborhood(page, neighbor.id, neighbors);
  await expect(page).toHaveURL(new RegExp(`artist=${neighbor.id}`));
  await stableCamera(page);
  const bounds = (await page.locator('.sigma-container').boundingBox())!;
  await page.mouse.click(bounds.x + 8, bounds.y + bounds.height * 0.5);
  await expect.poll(() => visibleIds(page)).toEqual(allIds);
  await expect(page.locator('.artist-panel')).toHaveCount(0);
  await searchSelect(page, source);
  await expectNeighborhood(page, source.id, neighbors);
  await page.getByRole('button', { name: '지도 전체 보기', exact: true }).click();
  await expect.poll(() => visibleIds(page)).toEqual(allIds);
  await searchSelect(page, source);
  await expectNeighborhood(page, source.id, neighbors);
  await page.getByRole('button', { name: '전체 네트워크 보기', exact: true }).click();
  await expect.poll(() => visibleIds(page)).toEqual(allIds);
  expect(errors).toEqual([]); expect(failedResponses).toEqual([]);
});

test('a shared filtered URL restores the same source-backed neighborhood', async ({ page, context }) => {
  const data = catalog(), initialNeighbors = adjacency(data, 2005, 2014), neighbors = adjacency(data, 2005, 2014, 2);
  expect(initialNeighbors.get('garion')?.size, 'the real selected period must contain Garion collaborations').toBeGreaterThan(0);
  await page.goto('/map/?artist=garion&from=2005&to=2014');
  await graphReady(page);
  await expectNeighborhood(page, 'garion', initialNeighbors);
  await openFilters(page);
  await page.getByRole('slider', { name: '최소 공동 작업곡' }).fill('2');
  await expectNeighborhood(page, 'garion', neighbors);
  await page.getByRole('button', { name: '지도 공유' }).click();
  const fresh = await context.newPage();
  try {
    await fresh.goto(page.url());
    await graphReady(fresh);
    await expectNeighborhood(fresh, 'garion', neighbors);
    await expect(fresh.getByRole('spinbutton', { name: '시작 연도 직접 입력' })).toHaveValue('2005');
    await expect(fresh.getByRole('spinbutton', { name: '끝 연도 직접 입력' })).toHaveValue('2014');
    await openFilters(fresh);
    await expect(fresh.getByRole('slider', { name: '최소 공동 작업곡' })).toHaveValue('2');
  } finally { await fresh.close(); }
});

test('dragging a collaborator ripples its neighborhood without moving the camera and settles finitely', async ({ page }, testInfo) => {
  const data = catalog(), neighbors = adjacency(data), ids = data.artists.filter(artist => artist.core).map(artist => artist.id);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/map/?artist=garion');
  await graphReady(page);
  await expectNeighborhood(page, 'garion', neighbors);
  await stableCamera(page);
  const candidates = [...neighbors.get('garion')!].filter(id => (neighbors.get(id)?.size || 0) >= 2).sort((a,b) => neighbors.get(a)!.size - neighbors.get(b)!.size);
  const dragged = await interactiveNode(page, candidates);
  const before = await graphState(page, ids);
  const target = await dragTarget(page, dragged);
  await page.mouse.move(dragged.x, dragged.y);
  await page.mouse.down();
  await frames(page, 2);
  for (let step = 1; step <= 12; step++) {
    await page.mouse.move(dragged.x + (target.x - dragged.x) * step / 12, dragged.y + (target.y - dragged.y) * step / 12);
    await frames(page, 1);
  }
  await expectNeighborhood(page, dragged.id, neighbors);
  const during = await graphState(page, ids);
  expect(during.interaction.isDragging).toBe(true);
  expect(motionDistance(before, during, [dragged.id])).toBeGreaterThan(0.1);
  expect(motionDistance(before, during, [...neighbors.get(dragged.id)!]), 'real connected artists must react to the held-node displacement').toBeGreaterThan(0.01);
  expect(cameraDistance(before, during), 'node dragging must not pan or animate the camera').toBeLessThan(0.000001);
  const held = await page.evaluate(id => (window as unknown as { __hiphopGraph: GraphMetrics }).__hiphopGraph.getPosition(id), dragged.id);
  const stage = (await page.locator('.sigma-container').boundingBox())!;
  expect(held).toBeTruthy();
  expect(Math.hypot(stage.x + held!.x - target.x, stage.y + held!.y - target.y), 'the held node must follow the actual pointer').toBeLessThan(8);
  await page.screenshot({ path: testInfo.outputPath(`drag-held-${testInfo.project.name}.png`), fullPage: true });
  await page.mouse.up();
  await expect.poll(async () => (await graphState(page, [])).interaction.isDragging).toBe(false);
  await expect.poll(async () => (await graphState(page, [])).interaction.isSettling).toBe(true);
  await frames(page, 3);
  const released = await graphState(page, ids);
  expect(motionDistance(during, released, [dragged.id, ...neighbors.get(dragged.id)!]), 'release must continue the elastic response').toBeGreaterThan(0.001);
  await expect.poll(async () => (await graphState(page, ids)).interaction.isSettling, { timeout: 6_000 }).toBe(false);
  const settled = await graphState(page, ids);
  expect(motionDistance(before, settled, ids), 'the bounded spring system must return to its pre-gesture layout').toBeLessThan(0.05);
  expect(cameraDistance(before, released)).toBeLessThan(0.000001);
  expect(cameraDistance(before, settled)).toBeLessThan(0.000001);
  expect(errors).toEqual([]);
  await expect(page).toHaveURL(new RegExp(`artist=${dragged.id}`));
});

test('reduced motion permits direct dragging without neighbor oscillation after release', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const data = catalog(), neighbors = adjacency(data), ids = data.artists.filter(artist => artist.core).map(artist => artist.id);
  await page.goto('/map/?artist=garion');
  await graphReady(page);
  await expectNeighborhood(page, 'garion', neighbors);
  await stableCamera(page);
  const dragged = await interactiveNode(page, ['garion']);
  const before = await graphState(page, ids);
  const target = await dragTarget(page, dragged, 32, 24);
  await page.mouse.move(dragged.x, dragged.y); await page.mouse.down();
  for (let step = 1; step <= 8; step++) { await page.mouse.move(dragged.x + (target.x - dragged.x) * step / 8, dragged.y + (target.y - dragged.y) * step / 8); await frames(page, 1); }
  const during = await graphState(page, ids);
  expect(during.interaction.isDragging).toBe(true);
  expect(motionDistance(before, during, [dragged.id])).toBeGreaterThan(0.1);
  expect(motionDistance(before, during, [...neighbors.get(dragged.id)!])).toBeLessThan(0.001);
  expect(cameraDistance(before, during)).toBeLessThan(0.000001);
  await page.mouse.up();
  await frames(page, 2);
  const released = await graphState(page, ids);
  expect(released.interaction).toMatchObject({ isDragging: false, isSettling: false });
  await frames(page, 8);
  const later = await graphState(page, ids);
  expect(motionDistance(released, later, ids)).toBeLessThan(0.001);
  expect(motionDistance(during, later, [dragged.id]), 'reduced motion retains the released position without a snap or oscillator').toBeLessThan(0.001);
  expect(motionDistance(before, later, ids.filter(id => id !== dragged.id))).toBeLessThan(0.001);
  expect(cameraDistance(before, later)).toBeLessThan(0.000001);
  await expectNeighborhood(page, 'garion', neighbors);
  const repeated = await interactiveNode(page, ['garion']);
  await page.mouse.click(repeated.x, repeated.y);
  await frames(page, 4);
  const tappedAgain = await graphState(page, ids);
  expect(motionDistance(later, tappedAgain, ids), 'a repeat tap must retain reduced-motion positions').toBeLessThan(0.001);
  expect(tappedAgain.interaction).toMatchObject({ isDragging: false, isSettling: false });
  await page.getByRole('button', { name: '지도 전체 보기', exact: true }).click();
  await expect.poll(async () => motionDistance(before, await graphState(page, ids), ids)).toBeLessThan(0.05);
});

test('a real touch gesture drags a node and releases its neighborhood without panning', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Touch dispatch belongs to the mobile browser project.');
  const data = catalog(), neighbors = adjacency(data), ids = data.artists.filter(artist => artist.core).map(artist => artist.id);
  await page.goto('/map/?artist=garion');
  await graphReady(page);
  await expectNeighborhood(page, 'garion', neighbors);
  await stableCamera(page);
  const dragged = await interactiveNode(page, ['garion']);
  const before = await graphState(page, ids);
  const target = await dragTarget(page, dragged, 32, 24);
  const session = await page.context().newCDPSession(page);
  try {
    const point = { x: dragged.x, y: dragged.y, id: 0, radiusX: 2, radiusY: 2, force: 1 };
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    for (let step = 1; step <= 8; step++) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...point, x: point.x + (target.x - point.x) * step / 8, y: point.y + (target.y - point.y) * step / 8 }] });
      await frames(page, 1);
    }
    const held = await graphState(page, ids);
    expect(held.interaction.isDragging).toBe(true);
    expect(motionDistance(before, held, ['garion'])).toBeGreaterThan(0.1);
    expect(motionDistance(before, held, [...neighbors.get('garion')!])).toBeGreaterThan(0.01);
    expect(cameraDistance(before, held)).toBeLessThan(0.000001);
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(async () => (await graphState(page, ids)).interaction.isSettling, { timeout: 6_000 }).toBe(false);
    const settled = await graphState(page, ids);
    expect(settled.interaction.isDragging).toBe(false);
    expect(cameraDistance(before, settled)).toBeLessThan(0.000001);
    expect(motionDistance(before, settled, ids)).toBeLessThan(0.05);
    await expectNeighborhood(page, 'garion', neighbors);
    await expect(page).toHaveURL(/artist=garion/);
  } finally { await session.detach(); }
});

test('cancelled mouse and touch drags cannot resume camera movement or leave displaced nodes', async ({ page }, testInfo) => {
  const data = catalog(), source = data.artists.find(artist => artist.id === 'garion')!, neighbors = adjacency(data);
  const ids = data.artists.filter(artist => artist.core).map(artist => artist.id);
  await page.goto('/map/?artist=garion');
  await graphReady(page);
  for (const signal of ['blur', 'pointercancel'] as const) {
    await searchSelect(page, source); await expectNeighborhood(page, source.id, neighbors); await stableCamera(page);
    const node = await interactiveNode(page, [source.id]), target = await dragTarget(page, node, 32, 24);
    const before = await graphState(page, ids);
    await page.mouse.move(node.x, node.y); await page.mouse.down();
    try {
      for (let step = 1; step <= 6; step++) { await page.mouse.move(node.x + (target.x - node.x) * step / 6, node.y + (target.y - node.y) * step / 6); await frames(page, 1); }
      expect((await graphState(page, ids)).interaction.isDragging).toBe(true);
      await page.evaluate(signal => window.dispatchEvent(signal === 'blur' ? new Event('blur') : new PointerEvent('pointercancel', { pointerType: 'mouse', pointerId: 1 })), signal);
      await frames(page, 2);
      const cancelled = await graphState(page, ids);
      expect(cancelled.interaction).toMatchObject({ isDragging: false, isSettling: false });
      expect(motionDistance(before, cancelled, ids)).toBeLessThan(0.05);
      // Keep the physical mouse button held after cancellation. These trusted
      // moves expose stale captor activation that an early mouseup would hide.
      for (let step = 1; step <= 5; step++) { await page.mouse.move(target.x + (node.x - target.x) * step / 5, target.y + (node.y - target.y) * step / 5); await frames(page, 1); }
      const later = await graphState(page, ids);
      expect(later.interaction).toMatchObject({ isDragging: false, isSettling: false });
      expect(cameraDistance(before, later), `${signal} must release captor state before a normal mouseup`).toBeLessThan(0.000001);
      expect(motionDistance(before, later, ids)).toBeLessThan(0.05);
    } finally { await page.mouse.up(); }
  }
  if (testInfo.project.name === 'mobile') {
    await searchSelect(page, source); await expectNeighborhood(page, source.id, neighbors); await stableCamera(page);
    const node = await interactiveNode(page, [source.id]), target = await dragTarget(page, node, 32, 24);
    const before = await graphState(page, ids), session = await page.context().newCDPSession(page);
    try {
      const point = { x: node.x, y: node.y, id: 0, radiusX: 2, radiusY: 2, force: 1 };
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...point, ...target }] });
      await frames(page, 3);
      expect((await graphState(page, ids)).interaction.isDragging).toBe(true);
      await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
      await frames(page, 3);
      const cancelled = await graphState(page, ids);
      expect(cancelled.interaction).toMatchObject({ isDragging: false, isSettling: false });
      expect(motionDistance(before, cancelled, ids)).toBeLessThan(0.05);
      expect(cameraDistance(before, cancelled)).toBeLessThan(0.000001);
    } finally { await session.detach(); }
  }
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
  const data = catalog(), neighbors = adjacency(data), periodNeighbors = adjacency(data, 2000), source = connectedArtist(data);
  const direct = neighbors.get(source.id)!;
  const target = [...periodNeighbors.get(source.id)!].flatMap(id => [...(periodNeighbors.get(id) || [])]).find(id => id !== source.id && !direct.has(id));
  expect(target, 'real data should contain a two-step connection').toBeTruthy();
  await page.goto(`/map/?artist=${source.id}`);
  await graphReady(page);
  await openFilters(page);
  await page.locator('.path-tools > summary').click();
  await page.getByRole('combobox', { name: '연결 경로 대상 아티스트' }).selectOption(target!);
  await expect(page.locator('.path-result')).toContainText('2단계로 연결');
  const pathNodes = await visibleIds(page);
  expect(pathNodes).toHaveLength(3);
  expect(pathNodes).toEqual(expect.arrayContaining([source.id, target!]));
  const middle = pathNodes.find(id => id !== source.id && id !== target)!;
  expect(direct.has(middle) && neighbors.get(middle)!.has(target!), 'every visible route step must be supported by real credited recordings').toBe(true);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __hiphopGraph: GraphMetrics }).__hiphopGraph.getVisibleEdgeIds().sort())).toEqual([tieId(source.id, middle), tieId(middle, target!)].sort());
  await page.getByRole('spinbutton', { name: '시작 연도 직접 입력' }).fill('2000');
  await expect(page.locator('.path-result')).toContainText('2단계로 연결');
  const sharedPathNodes = await visibleIds(page);
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
  const mobileClose = fresh.getByRole('button', { name: '필터 닫기' });
  if (await mobileClose.isVisible()) await mobileClose.click();
  await fresh.getByRole('button', { name: '지도 보기', exact: true }).click();
  await graphReady(fresh);
  await expect.poll(() => visibleIds(fresh)).toEqual(sharedPathNodes);
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
