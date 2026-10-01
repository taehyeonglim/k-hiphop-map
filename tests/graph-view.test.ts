import { describe, expect, it } from 'vitest';
import { fullScopeBounds } from '../src/lib/graph-view';
import type { Artist } from '../src/lib/types';

const artists = [
  { id: 'first', core: true, x: -100, y: -20 },
  { id: 'second', core: true, x: 100, y: 40 },
  { id: 'external', core: false, x: 10000, y: 20000 },
  { id: 'pending', core: true, x: undefined, y: undefined },
] as Artist[];

describe('stable full-period graph camera bounds', () => {
  it('excludes hidden external artists and unknown positions from the default view', () => {
    expect(fullScopeBounds(artists, false)).toEqual({ x: [-100, 100], y: [-20, 40] });
  });
  it('includes external collaborators only when the user expands the map', () => {
    expect(fullScopeBounds(artists, true)).toEqual({ x: [-100, 10000], y: [-20, 20000] });
  });
  it('returns no custom bounds when the catalog has no positioned artists', () => {
    expect(fullScopeBounds([], false)).toBeNull();
  });
});
