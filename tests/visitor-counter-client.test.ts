import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const canonicalHost = 'k-hiphop-map.vercel.app';
const dayKey = 'khiphopmap:visitors:day';
const seoulDay = '2026-10-03';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
    removeItem: vi.fn((key: string) => { values.delete(key); }),
  };
}

type BrowserStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type BrowserLocks = { request: (name: string, callback: () => Promise<void>) => Promise<void> };

function browser(hostname = canonicalHost, storage: BrowserStorage = memoryStorage(), locks?: BrowserLocks) {
  vi.stubGlobal('window', { location: { hostname }, localStorage: storage, navigator: { locks }, setTimeout, clearTimeout });
  return storage;
}

async function client() { return import('../src/lib/visitor-counter'); }
async function flushMicrotasks() { for (let index = 0; index < 6; index++) await Promise.resolve(); }
function network(count = 214) {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () => Response.json({ count }));
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('NODE_ENV', 'production');
  vi.useFakeTimers();
  // UTC is still October 2; the visitor's calendar day in Korea is October 3.
  vi.setSystemTime(new Date('2026-10-02T15:30:00Z'));
});
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('visitor counter browser requests', () => {
  it('records production visits only after a valid response and stores the Seoul calendar day', async () => {
    const storage = browser();
    let confirm!: (response: Response) => void;
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(() => new Promise((resolve) => { confirm = resolve; }));
    vi.stubGlobal('fetch', fetch);
    const counter = await client();
    const request = counter.loadVisitorCounter();
    await flushMicrotasks();
    expect(storage.getItem(dayKey)).toBeNull();
    expect(counter.getVisitorCounterState()).toEqual({ status: 'loading' });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe('/api/visitors');
    expect(fetch.mock.calls[0][1]).toMatchObject({ method: 'POST', credentials: 'same-origin' });
    confirm(Response.json({ count: 214, counted: true }));
    await request;
    expect(storage.getItem(dayKey)).toBe(seoulDay);
    expect(counter.getVisitorCounterState()).toEqual({ status: 'ready', count: 214 });
  });

  it('reads the actual updated total on a same-day browser reload without incrementing again', async () => {
    const storage = browser();
    const fetch = network();
    await (await client()).loadVisitorCounter();
    expect(storage.getItem(dayKey)).toBe(seoulDay);
    vi.resetModules(); // A new document has a new module store, but retains browser storage.
    fetch.mockImplementation(async () => Response.json({ count: 219 }));
    const reloaded = await client();
    await reloaded.loadVisitorCounter();
    expect(fetch.mock.calls.map((call) => call[1]?.method)).toEqual(['POST', 'GET']);
    expect(reloaded.getVisitorCounterState()).toEqual({ status: 'ready', count: 219 });
  });

  it.each([
    ['development', canonicalHost],
    ['test', canonicalHost],
    ['production', 'localhost'],
    ['production', '127.0.0.1'],
    ['production', 'k-hiphop-map-preview.vercel.app'],
  ])('uses GET without a daily receipt for %s on %s', async (environment, hostname) => {
    vi.stubEnv('NODE_ENV', environment);
    const storage = browser(hostname);
    const fetch = network(32);
    const counter = await client();
    await counter.loadVisitorCounter();
    expect(fetch.mock.calls[0][1]?.method).toBe('GET');
    expect(storage.getItem(dayKey)).toBeNull();
    expect(counter.getVisitorCounterState()).toEqual({ status: 'ready', count: 32 });
  });

  it('shares one pending request through concurrent effects and loading-to-map subscription changes', async () => {
    browser();
    let confirm!: (response: Response) => void;
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(() => new Promise((resolve) => { confirm = resolve; }));
    vi.stubGlobal('fetch', fetch);
    const counter = await client();
    const loaderListener = vi.fn();
    const unsubscribeLoader = counter.subscribeVisitorCounter(loaderListener);
    const first = counter.loadVisitorCounter();
    const strictModeSecondEffect = counter.loadVisitorCounter();
    unsubscribeLoader();
    const mapListener = vi.fn();
    const unsubscribeMap = counter.subscribeVisitorCounter(mapListener);
    const mapMount = counter.loadVisitorCounter();
    await flushMicrotasks();
    expect(fetch).toHaveBeenCalledTimes(1);
    confirm(Response.json({ count: 817 }));
    await Promise.all([first, strictModeSecondEffect, mapMount]);
    expect(mapListener).toHaveBeenCalled();
    expect(counter.getVisitorCounterState()).toEqual({ status: 'ready', count: 817 });
    await counter.loadVisitorCounter();
    expect(fetch).toHaveBeenCalledTimes(1);
    unsubscribeMap();
  });

  it.each([
    ['service unavailable', new Response(null, { status: 503 })],
    ['invalid count type', Response.json({ count: '214' })],
    ['negative count', Response.json({ count: -1 })],
    ['fractional count', Response.json({ count: 2.5 })],
    ['unsafe integer', Response.json({ count: Number.MAX_SAFE_INTEGER + 1 })],
    ['invalid acknowledgement', Response.json({ count: 214, counted: 'yes' })],
    ['empty payload', Response.json(null)],
  ])('leaves %s unacknowledged until an explicit retry succeeds', async (_reason, failure) => {
    const storage = browser();
    const fetch = network();
    fetch.mockResolvedValueOnce(failure);
    const counter = await client();
    await counter.loadVisitorCounter();
    expect(counter.getVisitorCounterState()).toEqual({ status: 'error' });
    expect(storage.getItem(dayKey)).toBeNull();
    await counter.loadVisitorCounter(); // A remount must not cause an automatic retry loop.
    expect(fetch).toHaveBeenCalledTimes(1);
    await counter.loadVisitorCounter(true);
    expect(fetch.mock.calls.map((call) => call[1]?.method)).toEqual(['POST', 'POST']);
    expect(counter.getVisitorCounterState()).toEqual({ status: 'ready', count: 214 });
    expect(storage.getItem(dayKey)).toBe(seoulDay);
  });

  it('accepts the server cookie acknowledgement without a second increment', async () => {
    const storage = browser();
    const fetch = network();
    fetch.mockImplementation(async () => Response.json({ count: 214, counted: false }));
    const counter = await client();
    await counter.loadVisitorCounter();
    expect(storage.getItem(dayKey)).toBe(seoulDay);
    vi.resetModules();
    await (await client()).loadVisitorCounter();
    expect(fetch.mock.calls.map((call) => call[1]?.method)).toEqual(['POST', 'GET']);
  });

  it('registers again at Korean midnight while the browser module remains mounted', async () => {
    const storage = browser();
    const fetch = network();
    vi.setSystemTime(new Date('2026-10-02T14:59:59Z'));
    const counter = await client();
    await counter.loadVisitorCounter();
    expect(storage.getItem(dayKey)).toBe('2026-10-02');
    vi.setSystemTime(new Date('2026-10-02T15:00:00Z'));
    await counter.loadVisitorCounter();
    expect(fetch.mock.calls.map((call) => call[1]?.method)).toEqual(['POST', 'POST']);
    expect(storage.getItem(dayKey)).toBe('2026-10-03');
  });

  it('rechecks the daily receipt after acquiring a cross-tab lock', async () => {
    let queue = Promise.resolve();
    const locks: BrowserLocks = { request: vi.fn((_name, callback) => {
      const next = queue.then(callback);
      queue = next.catch(() => undefined);
      return next;
    }) };
    const storage = browser(canonicalHost, memoryStorage(), locks);
    let confirm!: (response: Response) => void;
    const fetch = network(214);
    fetch.mockImplementationOnce(() => new Promise((resolve) => { confirm = resolve; }));
    const tabOne = await client();
    vi.resetModules();
    const tabTwo = await client(); // Independent stores share origin storage and Web Locks.
    const first = tabOne.loadVisitorCounter();
    const second = tabTwo.loadVisitorCounter();
    await flushMicrotasks();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(storage.getItem(dayKey)).toBeNull();
    confirm(Response.json({ count: 214, counted: true }));
    await Promise.all([first, second]);
    expect(fetch.mock.calls.map((call) => call[1]?.method)).toEqual(['POST', 'GET']);
    expect(tabOne.getVisitorCounterState()).toEqual({ status: 'ready', count: 214 });
    expect(tabTwo.getVisitorCounterState()).toEqual({ status: 'ready', count: 214 });
  });

  it('falls back to the server cookie when browser storage is restricted', async () => {
    const blocked = () => { throw new DOMException('Storage unavailable', 'SecurityError'); };
    browser(canonicalHost, { getItem: blocked, setItem: blocked, removeItem: blocked });
    const fetch = network(12);
    fetch.mockImplementation(async () => Response.json({ count: 12, counted: false }));
    const counter = await client();
    await expect(counter.loadVisitorCounter()).resolves.toBeUndefined();
    expect(counter.getVisitorCounterState()).toEqual({ status: 'ready', count: 12 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not repeat a failed network write merely because it was made inside a lock', async () => {
    browser(canonicalHost, memoryStorage(), { request: async (_name, callback) => callback() });
    const fetch = network();
    fetch.mockRejectedValueOnce(new Error('Connection unavailable'));
    const counter = await client();
    await counter.loadVisitorCounter();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(counter.getVisitorCounterState()).toEqual({ status: 'error' });
    await counter.loadVisitorCounter(true);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(counter.getVisitorCounterState()).toEqual({ status: 'ready', count: 214 });
  });
});
