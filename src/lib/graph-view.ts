import type { Artist, GraphSnapshot } from './types';

/** Selection is a one-hop view of the currently filtered, credited graph.
 * An explicitly requested shortest path has its own smaller view. */
export function visibleNeighborhoodIds(snapshot: GraphSnapshot, selectedArtistId?: string, path: string[] = []): Set<string> {
  const available = new Set(snapshot.nodes.map((node) => node.id));
  if (!selectedArtistId) return available;
  if (!available.has(selectedArtistId)) return new Set();
  if (path.length) return new Set(path.filter((id) => available.has(id)));
  const visible = new Set([selectedArtistId]);
  for (const edge of snapshot.edges) {
    if (edge.source === selectedArtistId && available.has(edge.target)) visible.add(edge.target);
    if (edge.target === selectedArtistId && available.has(edge.source)) visible.add(edge.source);
  }
  return visible;
}

/** Keep focus ties readable; routes show only consecutive steps. */
export function visibleNeighborhoodEdgeIds(snapshot: GraphSnapshot, selectedArtistId?: string, path: string[] = []): Set<string> {
  const visible = visibleNeighborhoodIds(snapshot, selectedArtistId, path);
  const routePairs = new Set(path.slice(1).map((id, index) => [path[index], id].sort().join('__')));
  return new Set(snapshot.edges.filter((edge) => {
    if (!visible.has(edge.source) || !visible.has(edge.target)) return false;
    if (!selectedArtistId) return true;
    if (path.length) return routePairs.has([edge.source, edge.target].sort().join('__'));
    return edge.source === selectedArtistId || edge.target === selectedArtistId;
  }).map((edge) => edge.id));
}

/** Bounds use the complete catalog scope, never the selected year. This keeps
 * annual filtering stable while keeping hidden external artists out of the
 * initial camera frame. */
export function fullScopeBounds(artists: Artist[], extended: boolean): { x: [number, number]; y: [number, number] } | null {
  const points = artists.filter((artist) => (extended || artist.core) && Number.isFinite(artist.x) && Number.isFinite(artist.y));
  if (!points.length) return null;
  return {
    x: [Math.min(...points.map((artist) => artist.x!)), Math.max(...points.map((artist) => artist.x!))],
    y: [Math.min(...points.map((artist) => artist.y!)), Math.max(...points.map((artist) => artist.y!))],
  };
}
