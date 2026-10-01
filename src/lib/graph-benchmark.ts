import Graph from 'graphology';
import { COMMUNITY_COLORS, edgeThickness, nodeRadius } from './graph';

export interface BenchmarkOptions { nodes: number; edges: number }

/** Deterministic fixture used only by tests and the development-only browser
 * instrumentation. It is never added to the public catalog or snapshot. */
export function populateBenchmarkGraph(graph: Graph, options: BenchmarkOptions, portraits: string[] = []): void {
  const nodes = Math.max(2, Math.min(5000, Math.floor(options.nodes)));
  const edges = Math.max(0, Math.min(nodes * (nodes - 1) / 2, Math.floor(options.edges)));
  graph.clear();
  const columns = Math.ceil(Math.sqrt(nodes));
  const placeholder = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#24302a"/><text x="32" y="39" fill="#c5f445" text-anchor="middle" font-size="22" font-family="sans-serif">MC</text></svg>')}`;
  for (let index = 0; index < nodes; index++) {
    const color = COMMUNITY_COLORS[index % COMMUNITY_COLORS.length];
    graph.addNode(`benchmark-${index}`, {
      x: index % columns,
      y: Math.floor(index / columns),
      size: nodeRadius(0),
      color: '#242e2a',
      borderColor: color,
      communityColor: color,
      overlayColor: 'rgba(9,15,12,0)',
      label: `Benchmark ${index}`,
      image: portraits.length ? portraits[index % portraits.length] : placeholder,
      fallback: placeholder,
      type: 'portrait',
      degree: 0,
      zIndex: 0,
    });
  }
  // Ring-lattice offsets generate simple undirected edges with no duplicates.
  for (let offset = 1; offset < nodes && graph.size < edges; offset++) {
    for (let index = 0; index < nodes && graph.size < edges; index++) {
      const source = `benchmark-${index}`;
      const target = `benchmark-${(index + offset) % nodes}`;
      if (graph.hasEdge(source, target)) continue;
      const count = 1 + (index % 4);
      graph.addUndirectedEdgeWithKey(`benchmark-edge-${graph.size}`, source, target, { count, size: edgeThickness(count), color: '#455747', affinity: 0.05 });
    }
  }
  graph.forEachNode((id) => {
    const degree = graph.degree(id);
    graph.mergeNodeAttributes(id, { degree, size: nodeRadius(degree), zIndex: degree });
  });
}
