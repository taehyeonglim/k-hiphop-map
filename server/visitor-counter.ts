import { createHmac, timingSafeEqual } from 'node:crypto';

const PUBLIC_ORIGIN = 'https://k-hiphop-map.vercel.app';
const COOKIE = '__Host-khiphop-visit';
const PROVIDER = 'https://countapi.mileshilliard.com/api/v1';

interface CounterOptions {
  key?: string;
  now?: Date;
  fetch?: typeof fetch;
}

function seoulDay(now: Date) {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function receipt(day: string, key: string) {
  return `${day}.${createHmac('sha256', key).update(`khiphop-visit:${day}`).digest('hex')}`;
}

function alreadyCounted(request: Request, day: string, key: string) {
  const value = request.headers.get('cookie')?.split(';').map(part => part.trim())
    .find(part => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!value) return false;
  const expected = Buffer.from(receipt(day, key));
  const actual = Buffer.from(value);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function json(body: object, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
  });
}

async function storedCount(key: string, increment: boolean, requestFetch: typeof fetch) {
  const response = await requestFetch(`${PROVIDER}/${increment ? 'hit' : 'get'}/${encodeURIComponent(key)}`, {
    method: increment ? 'POST' : 'GET',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(7000),
    cache: 'no-store',
  });
  const value: unknown = await response.json();
  // Distinguish an empty counter from a broken/missing provider endpoint.
  if (!increment && response.status === 404 && value && typeof value === 'object'
      && 'error' in value && value.error === 'Key not found') return 0;
  if (!response.ok) throw new Error('counter-unavailable');
  const count = value && typeof value === 'object' && 'value' in value ? value.value : undefined;
  if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) throw new Error('counter-invalid');
  return count;
}

export async function handleVisitorCounter(request: Request, options: CounterOptions = {}) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return json({ error: 'method-not-allowed' }, 405, { Allow: 'GET, POST' });
  }
  if (request.method === 'POST' && (request.headers.get('origin') !== PUBLIC_ORIGIN
      || new URL(request.url).origin !== PUBLIC_ORIGIN)) {
    return json({ error: 'forbidden' }, 403);
  }

  const key = options.key ?? process.env.VISITOR_COUNTER_KEY;
  if (!key || !/^[a-f0-9]{48,64}$/.test(key)) return json({ error: 'counter-unavailable' }, 503);
  const day = seoulDay(options.now ?? new Date());
  const bot = /bot\b|crawler|spider|slurp|facebookexternalhit|headlesschrome/i.test(request.headers.get('user-agent') ?? '');
  const increment = request.method === 'POST' && !bot && !alreadyCounted(request, day, key);

  try {
    const count = await storedCount(key, increment, options.fetch ?? fetch);
    if (request.method === 'GET') {
      // A refresh after a successful visit must not return a stale CDN total.
      return json({ count });
    }
    // Only acknowledge a successful write; errors never suppress a later visit.
    const headers: Record<string, string> = !bot ? {
      'Set-Cookie': `${COOKIE}=${receipt(day, key)}; Path=/; Max-Age=172800; HttpOnly; Secure; SameSite=Lax`,
    } : {};
    return json({ count, counted: increment }, 200, headers);
  } catch {
    // Do not leak the private upstream counter key in errors or logs.
    return json({ error: 'counter-unavailable' }, 503);
  }
}
