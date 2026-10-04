import { describe, expect, it } from 'vitest';
import { filterReleases, parseReleaseFilters, defaultReleaseFilters } from '../src/lib/releases';
import type { ReleaseIndexEntry } from '../src/lib/types';
const rows: ReleaseIndexEntry[] = [
  { id: 'a', title: '2001 大韓民國', year: 2001, type: 'compilation', artists: [], labels: ['천리안'], trackCount: 14, linkedCount: 10, pendingCount: 2, complete: true },
  { id: 'b', title: 'MP Hiphop 2002 風流 Part1', year: 2002, type: 'compilation', artists: [], labels: ['Master Plan'], trackCount: 16, linkedCount: 15, pendingCount: 0, complete: true },
  { id: 'c', title: 'Modern Rhymes', year: 2001, type: 'ep', artists: ['버벌진트'], trackCount: null, linkedCount: 3, pendingCount: 0, complete: false },
];
describe('release discovery', () => {
  it('finds Hanja editions with Hangul without merging editions', () => {
    expect(filterReleases(rows, { ...defaultReleaseFilters, q: '대한민국' }).map(r => r.id)).toEqual(['a']);
    expect(filterReleases(rows, { ...defaultReleaseFilters, q: 'mp 힙합' })).toEqual([]);
    expect(filterReleases(rows, { ...defaultReleaseFilters, q: '풍류' }).map(r => r.id)).toEqual(['b']);
  });
  it('combines type, label, year and performer queries', () => {
    expect(filterReleases(rows, { ...defaultReleaseFilters, label: 'Master Plan', type: 'compilation' }).map(r => r.id)).toEqual(['b']);
    expect(filterReleases(rows, { ...defaultReleaseFilters, q: '버벌진트', to: 2000 })).toEqual([]);
  });
  it('bounds deep-link years and rejects malformed filters', () => {
    expect(parseReleaseFilters(new URLSearchParams('from=2025&to=1999&type=invalid'), '2026-10-04')).toMatchObject({ from: 1999, to: 2025, type: '' });
    expect(parseReleaseFilters(new URLSearchParams('from=NaN&to=9999'), '2026-10-04')).toMatchObject({ from: 1995, to: 2026 });
  });
});
