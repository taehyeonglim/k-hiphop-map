import type { ReleaseIndexEntry } from './types';

export const releaseTypes = { album: '정규·앨범', ep: 'EP', single: '싱글', compilation: '컴필레이션', mixtape: '믹스테이프' } as const;
export interface ReleaseFilters { q: string; from: number; to: number; type: string; label: string }
export const defaultReleaseFilters: ReleaseFilters = { q: '', from: 1995, to: 2009, type: '', label: '' };
export function normalizeReleaseQuery(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().replaceAll('大韓民國', '대한민국').replaceAll('風流', '풍류').replaceAll('大舶', '대박').replaceAll('超', '초').replace(/[^\p{L}\p{N}]/gu, '');
}
export function parseReleaseFilters(params: URLSearchParams, asOf: string): ReleaseFilters {
  const max = Number(asOf.slice(0, 4));
  const year = (key: string, fallback: number) => { const value = params.get(key); return value && /^\d{4}$/.test(value) ? Math.max(1995, Math.min(max, Number(value))) : fallback; };
  const from = year('from', 1995), to = year('to', 2009);
  const type = params.get('type') ?? '';
  return { q: (params.get('q') ?? '').slice(0, 200), from: Math.min(from, to), to: Math.max(from, to), type: type in releaseTypes ? type : '', label: params.get('label') ?? '' };
}
export function filterReleases(rows: ReleaseIndexEntry[], filters: ReleaseFilters) {
  const queries = filters.q.trim().split(/\s+/).map(normalizeReleaseQuery).filter(Boolean);
  return rows.filter(row => row.year >= filters.from && row.year <= filters.to && (!filters.type || row.type === filters.type) && (!filters.label || row.labels?.includes(filters.label)) &&
    queries.every(query => [row.title, ...(row.aliases ?? []), row.series ?? '', ...row.artists].some(text => normalizeReleaseQuery(text).includes(query))))
    .sort((a, b) => a.year - b.year || a.title.localeCompare(b.title, 'ko') || a.id.localeCompare(b.id));
}
