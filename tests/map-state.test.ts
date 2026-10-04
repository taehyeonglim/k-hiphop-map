import { describe, expect, it } from 'vitest';
import { initialMapState, normalizeMapState, parseMapState, reduceMapState, serializeMapState } from '../src/lib/map-state';
import { createSearchIndex, searchArtists } from '../src/lib/search';
import type { MapArtist } from '../src/lib/types';
const artist = (id: string, name: string, aliases: string[] = []): MapArtist => ({ id, name, nameEn: id, aliases, kind: 'person', core: true });
const dataset = { asOf: '2026-10-01', artists: [artist('a', '가리온'), artist('b', '버벌진트')] };
describe('map navigation contract', () => {
  it.each(['range', 'cumulative', 'year'] as const)('round-trips %s with selection, path and view', mode => {
    const state = normalizeMapState({ ...initialMapState(dataset.asOf), from: 2005, to: 2014, mode, artist: 'a', target: 'b', extended: true, minCount: 3, view: 'list' }, dataset);
    expect(parseMapState(new URLSearchParams(serializeMapState(state, dataset.asOf)), dataset)).toEqual(state);
  });
  it('omits defaults and accepts the old empty artist link', () => {
    expect(serializeMapState(initialMapState(dataset.asOf), dataset.asOf)).toBe('');
    expect(parseMapState(new URLSearchParams('artist='), dataset).artist).toBeUndefined();
  });
  it('clamps reversed years, fractional counts and discards unknown IDs', () => {
    expect(parseMapState(new URLSearchParams('from=2025&to=2005&min=100.2&artist=missing&target=b'), dataset)).toMatchObject({ from: 2005, to: 2005, minCount: 20, artist: undefined, target: undefined });
    expect(parseMapState(new URLSearchParams('from=oops&to=Infinity&min=Infinity'), dataset)).toMatchObject({ from: 1995, to: 2026, minCount: 1 });
  });
  it('restores reviewed former artist IDs in shared links', () => {
    expect(parseMapState(new URLSearchParams('artist=old-a&target=old-b'), { ...dataset, artistAliases: { 'old-a': 'a', 'old-b': 'b' } })).toMatchObject({ artist: 'a', target: 'b' });
  });
  it('clears selection separately from filters and preserves view', () => {
    const state = normalizeMapState({ from: 2000, to: 2010, minCount: 4, artist: 'a', target: 'b', view: 'list' }, dataset);
    expect(reduceMapState(state, { type: 'clear-selection' }, dataset)).toMatchObject({ from: 2000, minCount: 4, artist: undefined, target: undefined, view: 'list' });
    expect(reduceMapState(state, { type: 'reset-filters' }, dataset)).toMatchObject({ from: 1995, to: 2026, minCount: 1, artist: 'a', target: 'b', view: 'list' });
  });
});
describe('artist search', () => {
  const index = createSearchIndex([artist('prefix', '가리온과 함께'), artist('exact', '가리온', ['Garion']), artist('contains', '옛 가리온')]);
  it('ranks exact matches before visible prefixes and substrings', () => {
    expect(searchArtists(index, '가리온', new Set(['prefix'])).map(a => a.id)).toEqual(['exact', 'prefix', 'contains']);
  });
  it('normalizes whitespace, case and width, including aliases', () => {
    expect(searchArtists(index, 'ＧＡＲＩＯＮ ', new Set()).map(a => a.id)).toEqual(['exact']);
  });
  it('excludes the path origin and returns no results for blanks', () => {
    expect(searchArtists(index, 'Garion', new Set(), 'exact')).toEqual([]);
    expect(searchArtists(index, ' ', new Set())).toEqual([]);
  });
});
