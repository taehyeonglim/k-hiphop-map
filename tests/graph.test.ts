import { describe, expect, it } from 'vitest';
import { deriveGraph, shortestPath, edgeThickness, parseFilters, serializeFilters } from '../src/lib/graph';
import type { Dataset, Artist, Recording } from '../src/lib/types';
const artist = (id: string, core = true): Artist => ({ id, name: id, nameEn: id, aliases: [], kind: 'person', core, externalIds: {}, sources: [], coverage: { releaseCount: 0, recordingCount: 0, pendingCount: 0, checkedAt: '2026-10-01', note: 'test fixture' }, x: 1, y: 2 });
const song = (id: string, ids: string[], year = 2010): Recording => ({ id, title: id, year, releaseIds: [], credits: ids.map(artistId => ({ artistId, role: 'main', verification: 'reviewed', sourceIds: [] })), sources: [], isrcs: [], kind: 'official', verification: 'reviewed' });
const data = (recordings: Recording[]): Dataset => ({ version: 'test', asOf: '2026-10-01', artists: [artist('a'), artist('b'), artist('c'), artist('guest', false), artist('solo')], releases: [], recordings, memberships: [], notes: [] });
const filters = { from: 1995, to: 2026, cumulative: false, extended: false, minCount: 1 };
describe('source-derived collaboration graph', () => {
  it('counts credited performer pairs once, regardless of duplicated participant credits', () => {
    const snapshot = deriveGraph(data([song('one', ['a', 'a', 'b']), song('two', ['a', 'b'])]), filters);
    expect(snapshot.edges).toHaveLength(1); expect(snapshot.edges[0].count).toBe(2); expect(snapshot.edges[0].recordingIds).toEqual(['one', 'two']);
  });
  it('excludes producer-only and pending credits, and does not infer group membership', () => {
    const recording = song('one', ['a', 'b']); recording.credits[1].role = 'producer';
    recording.credits.push({ artistId: 'c', role: 'vocal', verification: 'pending', sourceIds: [] });
    expect(deriveGraph(data([recording]), filters).edges).toHaveLength(0);
  });
  it('uses recording first-release year and applies cumulative and minimum-count filters', () => {
    const dataset = data([song('old', ['a', 'b'], 1998), song('new', ['a', 'b'], 2024)]);
    expect(deriveGraph(dataset, { ...filters, from: 2020, to: 2024 }).edges[0].count).toBe(1);
    expect(deriveGraph(dataset, { ...filters, from: 2020, to: 2024, cumulative: true }).edges[0].count).toBe(2);
    expect(deriveGraph(dataset, { ...filters, from: 2020, to: 2024, minCount: 2 }).edges).toHaveLength(0);
  });
  it('corrects large ensembles without changing displayed song count', () => {
    const snapshot = deriveGraph(data([song('pair', ['a', 'b']), song('ensemble', ['a', 'b', 'c', 'guest'])]), filters);
    const edge = snapshot.edges.find(e => e.source === 'a' && e.target === 'b')!;
    expect(edge.count).toBe(2); expect(edge.weight).toBeCloseTo(1 + 1 / 3);
    expect(edge.affinity).toBeGreaterThan(0); expect(edge.affinity).toBeLessThanOrEqual(1);
    expect(snapshot.nodes.some(n => n.id === 'guest')).toBe(false);
    expect(deriveGraph(data([song('ensemble', ['a', 'b', 'c', 'guest'])]), { ...filters, extended: true }).nodes.some(n => n.id === 'guest')).toBe(true);
  });
  it('limits expansion to direct credited collaborators of core artists', () => {
    const dataset = data([song('core-guest', ['a', 'guest']), song('guest-far', ['guest', 'far'])]);
    dataset.artists.push(artist('far', false));
    const snapshot = deriveGraph(dataset, { ...filters, extended: true });
    expect(snapshot.nodes.some(n => n.id === 'guest')).toBe(true);
    expect(snapshot.nodes.some(n => n.id === 'far')).toBe(false);
    expect(snapshot.edges).toHaveLength(1);
  });
  it('finds a minimum-hop path from actual visible edges and reports disconnection', () => {
    const snapshot = deriveGraph(data([song('ab', ['a', 'b']), song('bc', ['b', 'c'])]), filters);
    expect(shortestPath(snapshot, 'a', 'c')).toEqual(['a', 'b', 'c']); expect(shortestPath(snapshot, 'a', 'solo')).toEqual([]);
    expect(shortestPath(snapshot, 'a', 'missing')).toEqual([]);
  });
  it('keeps logarithmic widths stable and caps extreme values', () => { expect(edgeThickness(1)).toBeCloseTo(2); expect(edgeThickness(100)).toBe(6); });
  it('round-trips share state and sanitizes invalid input', () => {
    const state = { ...filters, from: 2005, to: 2024, artist: 'a', target: 'c', extended: true, minCount: 3, cumulative: true };
    expect(parseFilters(new URLSearchParams(serializeFilters(state)), data([]))).toEqual(state);
    expect(parseFilters(new URLSearchParams('from=1900&to=3000&min=-2&artist=nope'), data([]))).toMatchObject({ from: 1995, to: 2026, minCount: 1, artist: undefined });
  });
});
