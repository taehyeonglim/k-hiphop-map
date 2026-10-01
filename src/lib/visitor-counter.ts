export const VISITOR_DAY_KEY = 'khiphopmap:visitors:day';
export const VISITOR_COUNTER_DESCRIPTION = '누적 방문 수 · 브라우저별 하루 1회 집계';
const PRODUCTION_HOST = 'k-hiphop-map.vercel.app';
const LOCK_NAME = 'khiphopmap:visitors:daily';

export interface VisitorCounterState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  count?: number;
}

const initialState: VisitorCounterState = { status: 'idle' };
let state = initialState;
let attemptedDay: string | undefined;
let inFlight: Promise<void> | undefined;
const listeners = new Set<() => void>();

export function visitorCalendarDay(date = new Date()): string {
  // A numeric UTC offset avoids depending on the viewer's locale/time zone.
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function shouldRegisterVisitor(hostname: string, environment: string | undefined): boolean {
  return environment === 'production' && hostname === PRODUCTION_HOST;
}

export function subscribeVisitorCounter(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getVisitorCounterState(): VisitorCounterState { return state; }
export function getServerVisitorCounterState(): VisitorCounterState { return initialState; }

function publish(next: VisitorCounterState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

function confirmedDay(): string | undefined {
  try { return window.localStorage.getItem(VISITOR_DAY_KEY) ?? undefined; }
  catch { return undefined; }
}

function rememberConfirmedDay(day: string): void {
  try { window.localStorage.setItem(VISITOR_DAY_KEY, day); }
  catch { /* The server's HttpOnly cookie also deduplicates restricted storage. */ }
}

/** One browser-module request survives StrictMode and loading→map remounts. */
export function loadVisitorCounter(retry = false): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (inFlight) return inFlight;
  const day = visitorCalendarDay();
  if (!retry && attemptedDay === day && state.status !== 'idle') return Promise.resolve();
  attemptedDay = day;
  publish({ status: 'loading' });

  // Start on the next microtask so even a synchronously rejected fetch cannot
  // leave a completed promise installed as the shared in-flight request.
  inFlight = Promise.resolve().then(async () => {
    const registrationAllowed = shouldRegisterVisitor(window.location.hostname, process.env.NODE_ENV);
    const request = async () => {
      // Re-read after acquiring the cross-tab lock: another tab may have just
      // completed today's POST and stored the confirmation while we waited.
      const method = registrationAllowed && confirmedDay() !== day ? 'POST' : 'GET';
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10_000);
      try {
        const response = await fetch('/api/visitors', { method, credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' }, signal: controller.signal });
        if (!response.ok) throw new Error('visitor-counter-unavailable');
        const value: unknown = await response.json();
        if (!value || typeof value !== 'object') throw new Error('visitor-counter-invalid');
        const result = value as { count?: unknown; counted?: unknown };
        if (!Number.isSafeInteger(result.count) || (result.count as number) < 0 || (result.counted !== undefined && typeof result.counted !== 'boolean')) throw new Error('visitor-counter-invalid');
        if (method === 'POST') rememberConfirmedDay(day);
        publish({ status: 'ready', count: result.count as number });
      } finally { window.clearTimeout(timeout); }
    };
    try {
      if (registrationAllowed && window.navigator.locks?.request) {
        let acquired = false;
        try { await window.navigator.locks.request(LOCK_NAME, async () => { acquired = true; await request(); }); }
        catch (error) {
          // A denied/unsupported lock falls back to the shared request and
          // server cookie. A failed request inside a lock waits for user retry.
          if (acquired) throw error;
          await request();
        }
      } else await request();
    } catch { publish({ status: 'error' }); }
    finally { inFlight = undefined; }
  });
  return inFlight;
}
