import Graph from 'graphology';
import FA2LayoutSupervisor from 'graphology-layout-forceatlas2/worker';
import forceAtlas2 from 'graphology-layout-forceatlas2';

/** Run ForceAtlas2 off the main thread. The renderer receives throttled updates,
 * rather than repainting every worker iteration. Isolates retain their position. */
export function startPeriodLayout(
  graph: Graph,
  onComplete: () => void,
  options: { reducedMotion?: boolean; duration?: number } = {},
): () => void {
  const work = new Graph({ type: 'undirected' });
  graph.forEachNode((key, attributes) => {
    if (graph.degree(key) > 0) work.addNode(key, { ...attributes, size: Math.max(1, Number(attributes.size) || 1) * 1.8 });
  });
  graph.forEachEdge((key, attributes, source, target) => {
    if (work.hasNode(source) && work.hasNode(target)) {
      work.addEdgeWithKey(key, source, target, { weight: attributes.affinity || 0.01 });
    }
  });
  if (work.order < 2) {
    onComplete();
    return () => {};
  }
  const worker = new FA2LayoutSupervisor(work, {
    getEdgeWeight: 'weight',
    settings: {
      ...forceAtlas2.inferSettings(work),
      barnesHutOptimize: work.order > 100,
      barnesHutTheta: 0.5,
      gravity: 0.6,
      scalingRatio: 12,
      slowDown: 5,
      edgeWeightInfluence: 1,
      linLogMode: true,
      adjustSizes: true,
    },
  });
  let stopped = false;
  const copyPositions = () => {
    if (stopped) return;
    graph.updateEachNodeAttributes((key, attributes) => {
      if (!work.hasNode(key)) return attributes;
      const position = work.getNodeAttributes(key);
      if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) return attributes;
      return { ...attributes, x: position.x, y: position.y };
    }, { attributes: ['x', 'y'] });
  };
  const interval = options.reducedMotion ? undefined : setInterval(copyPositions, 120);
  const timeout = setTimeout(() => {
    worker.stop();
    copyPositions();
    stop();
    onComplete();
  }, options.duration ?? 2800);
  function stop() {
    if (stopped) return;
    stopped = true;
    if (interval) clearInterval(interval);
    clearTimeout(timeout);
    worker.kill();
  }
  worker.start();
  return stop;
}
