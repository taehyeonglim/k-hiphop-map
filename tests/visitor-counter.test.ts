import { describe, expect, it, vi } from 'vitest';
import { handleVisitorCounter } from '../server/visitor-counter';

const key = 'a'.repeat(64);
const origin = 'https://k-hiphop-map.vercel.app';
const morning = new Date('2026-10-02T00:00:00Z');
function request(method = 'GET', headers: Record<string, string> = {}, url = `${origin}/api/visitors`) {
  return new Request(url, { method, headers: { ...(method === 'POST' ? { origin } : {}), ...headers } });
}
function provider(value = 12) {
  return vi.fn<typeof fetch>().mockImplementation(async () => Response.json({ value }));
}

describe('persistent visitor counter', () => {
  it('reads the real global total without incrementing and allows short public caching', async () => {
    const upstream = provider(214);
    const response = await handleVisitorCounter(request(), { key, fetch: upstream });
    expect(await response.json()).toEqual({ count: 214 });
    expect(upstream.mock.calls[0][0]).toContain('/get/');
    expect(upstream.mock.calls[0][1]?.method).toBe('GET');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.has('set-cookie')).toBe(false);
  });

  it('records a first visit and suppresses refreshes with a signed HttpOnly receipt', async () => {
    const upstream = provider();
    const first = await handleVisitorCounter(request('POST'), { key, now: morning, fetch: upstream });
    expect(await first.json()).toEqual({ count: 12, counted: true });
    expect(upstream.mock.calls[0][0]).toContain('/hit/');
    expect(upstream.mock.calls[0][1]?.method).toBe('POST');
    expect(first.headers.get('cache-control')).toBe('no-store');
    const cookie = first.headers.get('set-cookie')!;
    expect(cookie).toMatch(/HttpOnly; Secure; SameSite=Lax/);
    const second = await handleVisitorCounter(request('POST', { cookie: cookie.split(';')[0] }), { key, now: morning, fetch: upstream });
    expect(await second.json()).toEqual({ count: 12, counted: false });
    expect(upstream.mock.calls[1][0]).toContain('/get/');
  });

  it('starts a new visit at Korean midnight rather than UTC midnight', async () => {
    const upstream = provider();
    const beforeMidnight = new Date('2026-10-02T14:59:59Z');
    const first = await handleVisitorCounter(request('POST'), { key, now: beforeMidnight, fetch: upstream });
    const cookie = first.headers.get('set-cookie')!.split(';')[0];
    const next = await handleVisitorCounter(request('POST', { cookie }), { key, now: new Date('2026-10-02T15:00:00Z'), fetch: upstream });
    expect(await next.json()).toEqual({ count: 12, counted: true });
    expect(upstream.mock.calls[1][0]).toContain('/hit/');
  });

  it('does not let an unsigned date suppress a real visit', async () => {
    const upstream = provider();
    const response = await handleVisitorCounter(request('POST', { cookie: '__Host-khiphop-visit=2026-10-02.fake' }), { key, now: morning, fetch: upstream });
    expect((await response.json()).counted).toBe(true);
  });

  it.each([
    ['foreign-origin', request('POST', { origin: 'https://unrelated.example' })],
    ['missing-origin', new Request(`${origin}/api/visitors`, { method: 'POST' })],
    ['preview-host', request('POST', {}, 'https://preview.vercel.app/api/visitors')],
  ])('rejects %s writes before contacting storage', async (_name, incoming) => {
    const upstream = provider();
    const response = await handleVisitorCounter(incoming, { key, fetch: upstream });
    expect(response.status).toBe(403);
    expect(upstream).not.toHaveBeenCalled();
  });

  it('treats a missing stored counter as zero before the first visit', async () => {
    const upstream = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ error: 'Key not found' }, { status: 404 }));
    const response = await handleVisitorCounter(request(), { key, fetch: upstream });
    expect(await response.json()).toEqual({ count: 0 });
  });

  it('does not mistake a missing provider endpoint for an empty total', async () => {
    const upstream = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ error: 'Endpoint not found' }, { status: 404 }));
    const response = await handleVisitorCounter(request(), { key, fetch: upstream });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'counter-unavailable' });
  });

  it.each([null, { value: -1 }, { value: '42' }, { value: 1.5 }])('never fabricates a count or receipt for invalid storage data %j', async data => {
    const upstream = vi.fn<typeof fetch>().mockResolvedValue(Response.json(data));
    const response = await handleVisitorCounter(request('POST'), { key, fetch: upstream });
    expect(response.status).toBe(503);
    expect(response.headers.has('set-cookie')).toBe(false);
    expect(await response.text()).not.toContain(key);
  });

  it('keeps storage failures retriable without acknowledging the visit', async () => {
    const upstream = vi.fn<typeof fetch>().mockRejectedValue(new Error(`upstream failure ${key}`));
    const response = await handleVisitorCounter(request('POST'), { key, fetch: upstream });
    expect(response.status).toBe(503);
    expect(response.headers.has('set-cookie')).toBe(false);
    expect(await response.text()).toBe('{"error":"counter-unavailable"}');
  });

  it('does not count identifiable crawlers', async () => {
    const upstream = provider();
    const response = await handleVisitorCounter(request('POST', { 'user-agent': 'Googlebot' }), { key, fetch: upstream });
    expect(await response.json()).toEqual({ count: 12, counted: false });
    expect(upstream.mock.calls[0][0]).toContain('/get/');
    expect(response.headers.has('set-cookie')).toBe(false);
  });

  it('rejects unsupported methods and absent secrets without storage access', async () => {
    const upstream = provider();
    expect((await handleVisitorCounter(request('DELETE'), { key, fetch: upstream })).status).toBe(405);
    expect((await handleVisitorCounter(request(), { key: '', fetch: upstream })).status).toBe(503);
    expect(upstream).not.toHaveBeenCalled();
  });
});
