import { describe, expect, it } from 'vitest';
import { fullScopeBounds, visibleNeighborhoodIds, visibleNeighborhoodEdgeIds } from '../src/lib/graph-view';
import type { Artist, GraphSnapshot } from '../src/lib/types';

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

describe('selected artist neighborhood', () => {
  const snapshot = {
    nodes: ['a', 'b', 'c', 'd', 'solo'].map((id) => ({ id })),
    edges: [
      { id: 'a__b', source: 'a', target: 'b' },
      { id: 'a__c', source: 'c', target: 'a' },
      { id: 'b__d', source: 'b', target: 'd' },
      { id: 'b__c', source: 'b', target: 'c' },
    ],
  } as GraphSnapshot;

  it('hides two-hop artists and disconnected nodes while including both edge directions', () => {
    expect([...visibleNeighborhoodIds(snapshot, 'a')].sort()).toEqual(['a', 'b', 'c']);
    expect([...visibleNeighborhoodIds(snapshot, 'b')].sort()).toEqual(['a', 'b', 'c', 'd']);
  });
  it('restores the full filtered map when selection is cleared', () => {
    expect(visibleNeighborhoodIds(snapshot)).toEqual(new Set(['a', 'b', 'c', 'd', 'solo']));
  });
  it('keeps an isolated artist and returns an empty view for an artist outside the period', () => {
    expect([...visibleNeighborhoodIds(snapshot, 'solo')]).toEqual(['solo']);
    expect(visibleNeighborhoodIds(snapshot, 'unavailable').size).toBe(0);
  });
  it('uses only the requested route while a shortest path is active', () => {
    expect([...visibleNeighborhoodIds(snapshot, 'a', ['a', 'b', 'd'])]).toEqual(['a', 'b', 'd']);
  });
  it('does not infer an absent neighbor from stale edge endpoints', () => {
    const current = { ...snapshot, nodes: snapshot.nodes.filter((node) => node.id !== 'c') };
    expect([...visibleNeighborhoodIds(current, 'a')]).toEqual(['a', 'b']);
  });
  it('shows center ties without unrelated neighbor ties and keeps only consecutive route steps', () => {
    expect([...visibleNeighborhoodEdgeIds(snapshot, 'a')]).toEqual(['a__b', 'a__c']);
    expect([...visibleNeighborhoodEdgeIds(snapshot, 'a', ['a', 'b', 'c'])]).toEqual(['a__b', 'b__c']);
    expect(visibleNeighborhoodEdgeIds(snapshot).size).toBe(4);
  });
});
