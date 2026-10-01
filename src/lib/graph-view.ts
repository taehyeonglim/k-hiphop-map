import type { Artist } from './types';

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
