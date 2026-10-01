export const TRAILER_SEEN_KEY = 'khiphopmap:trailer:v1:seen';
export const TRAILER_MEDIA_ROOT = '/media/trailer/v2';
export type TrailerVisit = 'show' | 'skip';

declare global {
  interface Window { __hiphopTrailerBoot?: TrailerVisit }
}

/** Ignore empty/default map parameters and unrelated campaign parameters. */
export function hasSharedMapState(search: string): boolean {
  const query = new URLSearchParams(search);
  if (query.get('artist')?.trim() || query.get('target')?.trim()) return true;
  if (['from', 'to'].some((key) => /^\d{4}$/.test(query.get(key) ?? '') && Number(query.get(key)) >= 1995)) return true;
  return ['year', 'cumulative'].includes(query.get('mode') ?? '')
    || Number(query.get('min')) > 1
    || query.get('extended') === '1'
    || query.get('view') === 'list';
}

export function readTrailerVisit(): TrailerVisit {
  if (typeof window === 'undefined') return 'skip';
  // The head marker only controls the first paint. Re-evaluate this mount's
  // route and storage so a client navigation from /credits can show the intro.
  try {
    if (!['/', '/map', '/map/'].includes(window.location.pathname) || hasSharedMapState(window.location.search)) return 'skip';
    if (window.localStorage.getItem(TRAILER_SEEN_KEY) === '1') return 'skip';
    // Test writes too: private or restricted storage must not repeatedly open an intro.
    const probe = `${TRAILER_SEEN_KEY}:check`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return 'show';
  } catch { return 'skip'; }
}

export function markTrailerSeen(): void {
  try { window.localStorage.setItem(TRAILER_SEEN_KEY, '1'); } catch { /* Manual playback remains available. */ }
  window.__hiphopTrailerBoot = 'skip';
  document.documentElement.dataset.trailerVisit = 'skip';
}

// An inline head script is intentional: Next's installed preventing-flash guide
// recommends correcting client storage preferences before the browser paints.
// Only the html attribute is changed; server and first client component trees agree.
export const TRAILER_BOOT_SCRIPT = `(function(){var state='skip';try{var home=['/','/map','/map/'].includes(location.pathname);var shared=(${hasSharedMapState.toString()})(location.search);if(home&&!shared&&localStorage.getItem(${JSON.stringify(TRAILER_SEEN_KEY)})!=='1'){var probe=${JSON.stringify(`${TRAILER_SEEN_KEY}:check`)};localStorage.setItem(probe,'1');localStorage.removeItem(probe);state='show'}}catch(e){}window.__hiphopTrailerBoot=state;document.documentElement.setAttribute('data-trailer-visit',state)})();`;
