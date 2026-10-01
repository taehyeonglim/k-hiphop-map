import type { Dataset, GraphEdge, GraphSnapshot, MapFilters, Recording } from './types';

const PERFORMER_ROLES = new Set(['main', 'featured', 'vocal', 'rap']);
export const COMMUNITY_COLORS = ['#c5f445', '#ef766d', '#6ac7d6', '#cda2f1', '#eeb969', '#8dba93', '#829cf0', '#db99b4'];
export function edgeThickness(count: number): number { return Math.min(6, 0.7 + 1.3 * Math.log2(1 + Math.max(0, count))); }
export function nodeRadius(degree: number): number { return Math.min(20, 6 + 1.5 * Math.sqrt(Math.max(0, degree))); }
export function edgeId(a: string, b: string): string { return [a, b].sort().join('__'); }
export function performerIds(recording: Recording): string[] {
  return [...new Set(recording.credits.filter(c => PERFORMER_ROLES.has(c.role) && c.verification !== 'pending').map(c => c.artistId))].sort();
}
export function defaultFilters(asOf: string): MapFilters {
  return { from: 1995, to: Number(asOf.slice(0, 4)), cumulative: false, extended: false, minCount: 1 };
}
export function deriveGraph(dataset: Dataset, filters: MapFilters): GraphSnapshot {
  const from = filters.cumulative ? 1995 : filters.from;
  const to = Math.max(from, filters.to);
  const coreIds = new Set(dataset.artists.filter(a => a.core).map(a => a.id));
  const scoped = new Set(coreIds);
  if (filters.extended) for (const recording of dataset.recordings) {
    if (recording.verification === 'pending' || recording.year < from || recording.year > to) continue;
    const participants = performerIds(recording);
    if (participants.some(id => coreIds.has(id))) participants.forEach(id => scoped.add(id));
  }
  const counts = new Map<string, number>();
  const pairs = new Map<string, GraphEdge>();
  const strength = new Map<string, number>();
  let collaborations = 0;
  const recordings = dataset.recordings.filter(r => r.verification !== 'pending' && r.year >= from && r.year <= to && performerIds(r).some(id => scoped.has(id)));
  for (const r of recordings) {
    const participants = performerIds(r).filter(id => scoped.has(id));
    participants.forEach(id => counts.set(id, (counts.get(id) ?? 0) + 1));
    // Normalize by the full credited ensemble, even if some collaborators are hidden.
    const ensembleSize = performerIds(r).length;
    if (participants.length < 2) continue;
    collaborations++;
    const contribution = 1 / Math.max(1, ensembleSize - 1);
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const source = participants[i], target = participants[j], id = edgeId(source, target);
        const edge = pairs.get(id) ?? { id, source, target, count: 0, recordingIds: [], weight: 0, affinity: 0, years: [] };
        edge.count++; edge.recordingIds.push(r.id); edge.weight += contribution;
        if (!edge.years.includes(r.year)) edge.years.push(r.year);
        pairs.set(id, edge);
        strength.set(source, (strength.get(source) ?? 0) + contribution);
        strength.set(target, (strength.get(target) ?? 0) + contribution);
      }
    }
  }
  const edges = [...pairs.values()].filter(e => e.count >= filters.minCount);
  const degree = new Map<string, number>();
  for (const e of edges) {
    e.affinity = e.weight / Math.sqrt((strength.get(e.source) ?? 1) * (strength.get(e.target) ?? 1));
    e.years.sort((a, b) => a - b);
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
  }
  const fullPeriod = from === 1995 && to >= Number(dataset.asOf.slice(0, 4));
  const artists = dataset.artists.filter(a => scoped.has(a.id) && (counts.has(a.id) || (fullPeriod && a.core)));
  const nodes = artists.map(a => ({ id: a.id, degree: degree.get(a.id) ?? 0, count: counts.get(a.id) ?? 0, community: a.community ?? 0, x: a.x ?? 0, y: a.y ?? 0 }));
  const visibleIds = new Set(nodes.map(n => n.id));
  const visibleEdges = edges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target));
  return { version: dataset.version, asOf: dataset.asOf, nodes, edges: visibleEdges, stats: { artists: nodes.length, coreArtists: artists.filter(a => a.core).length, recordings: recordings.length, collaborations, releases: dataset.releases.filter(r => r.year >= from && r.year <= to && r.artistIds.some(id => visibleIds.has(id))).length, portraits: artists.filter(a => a.image).length } };
}
export function shortestPath(snapshot: GraphSnapshot, source: string, target: string): string[] {
  const nodes = new Set(snapshot.nodes.map(n => n.id));
  if (!nodes.has(source) || !nodes.has(target)) return [];
  if (source === target) return [source];
  const adjacency = new Map<string, string[]>();
  for (const e of snapshot.edges) {
    adjacency.set(e.source, [...(adjacency.get(e.source) ?? []), e.target]);
    adjacency.set(e.target, [...(adjacency.get(e.target) ?? []), e.source]);
  }
  const queue = [source], parent = new Map<string, string | null>([[source, null]]);
  for (let index = 0; index < queue.length; index++) {
    for (const next of (adjacency.get(queue[index]) ?? []).sort()) {
      if (parent.has(next)) continue;
      parent.set(next, queue[index]); queue.push(next);
      if (next === target) {
        const result: string[] = []; let id: string | null = target;
        while (id !== null) { result.push(id); id = parent.get(id) ?? null; }
        return result.reverse();
      }
    }
  }
  return [];
}
export function parseFilters(search: URLSearchParams, dataset: Dataset): MapFilters {
  const defaults = defaultFilters(dataset.asOf), lastYear = defaults.to;
  const year = (value: string | null, fallback: number) => { const n = Number(value); return value && Number.isFinite(n) ? Math.min(lastYear, Math.max(1995, Math.floor(n))) : fallback; };
  const from = year(search.get('from'), defaults.from), to = Math.max(from, year(search.get('to'), defaults.to));
  const ids = new Set(dataset.artists.map(a => a.id));
  return { from, to, cumulative: search.get('mode') === 'cumulative', extended: search.get('extended') === '1', minCount: Math.min(100, Math.max(1, Math.floor(Number(search.get('min')) || 1))), artist: ids.has(search.get('artist') ?? '') ? search.get('artist')! : undefined, target: ids.has(search.get('target') ?? '') ? search.get('target')! : undefined };
}
export function serializeFilters(filters: MapFilters): string {
  const search = new URLSearchParams({ from: String(filters.from), to: String(filters.to) });
  if (filters.cumulative) search.set('mode', 'cumulative');
  if (filters.extended) search.set('extended', '1');
  if (filters.minCount > 1) search.set('min', String(filters.minCount));
  if (filters.artist) search.set('artist', filters.artist);
  if (filters.target) search.set('target', filters.target);
  return search.toString();
}
