import { describe, expect, it } from 'vitest';
import Graph from 'graphology';
import { populateBenchmarkGraph } from '../src/lib/graph-benchmark';
import { nodeRadius } from '../src/lib/graph';

describe('development graph performance fixture', () => {
  it('creates the requested simple graph without changing an external dataset', () => {
    const graph = new Graph({ type: 'undirected' });
    graph.addNode('old-node', { x: 0, y: 0 });
    populateBenchmarkGraph(graph, { nodes: 1000, edges: 10000 }, ['/portraits/real-artist.webp']);
    expect(graph.order).toBe(1000);
    expect(graph.size).toBe(10000);
    expect(graph.hasNode('old-node')).toBe(false);
    expect(graph.selfLoopCount).toBe(0);
    graph.forEachNode((id, attributes) => {
      expect(attributes.degree).toBe(graph.degree(id));
      expect(attributes.size).toBe(nodeRadius(graph.degree(id)));
      expect(attributes.image).toBe('/portraits/real-artist.webp');
      expect(Number.isFinite(attributes.x) && Number.isFinite(attributes.y)).toBe(true);
    });
  });
  it('caps edge counts at the number of unique undirected pairs', () => {
    const graph = new Graph({ type: 'undirected' });
    populateBenchmarkGraph(graph, { nodes: 5, edges: 100 });
    expect(graph.order).toBe(5);
    expect(graph.size).toBe(10);
  });
});
