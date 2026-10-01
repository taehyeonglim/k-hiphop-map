import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Graph from 'graphology';
import { startPeriodLayout } from '../src/lib/layout-worker';

const supervisors = vi.hoisted(() => [] as Array<{ graph: Graph; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn>; kill: ReturnType<typeof vi.fn> }>);
vi.mock('graphology-layout-forceatlas2/worker', () => ({
  default: class {
    start = vi.fn();
    stop = vi.fn();
    kill = vi.fn();
    constructor(public graph: Graph) { supervisors.push(this); }
  },
}));

function fixture() {
  const graph = new Graph({ type: 'undirected' });
  graph.addNode('first', { x: 0, y: 0 });
  graph.addNode('second', { x: 1, y: 0 });
  graph.addNode('isolated', { x: 100, y: 100 });
  graph.addEdge('first', 'second', { affinity: 0.25 });
  return graph;
}

describe('period layout worker lifecycle', () => {
  beforeEach(() => { supervisors.length = 0; vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });
  it('copies worker results at a bounded rate and preserves isolated positions', () => {
    const graph = fixture();
    const done = vi.fn();
    startPeriodLayout(graph, done, { duration: 1000 });
    const supervisor = supervisors[0];
    expect(supervisor.start).toHaveBeenCalledOnce();
    expect(supervisor.graph.hasNode('isolated')).toBe(false);
    supervisor.graph.mergeNodeAttributes('first', { x: 12, y: -4 });
    vi.advanceTimersByTime(119);
    expect(graph.getNodeAttribute('first', 'x')).toBe(0);
    vi.advanceTimersByTime(1);
    expect(graph.getNodeAttribute('first', 'x')).toBe(12);
    expect(graph.getNodeAttribute('isolated', 'x')).toBe(100);
    vi.advanceTimersByTime(880);
    expect(done).toHaveBeenCalledOnce();
    expect(supervisor.kill).toHaveBeenCalledOnce();
  });
  it('cancels the worker and pending completion when filters change or the map unmounts', () => {
    const graph = fixture();
    const done = vi.fn();
    const stop = startPeriodLayout(graph, done, { duration: 1000 });
    const supervisor = supervisors[0];
    supervisor.graph.setNodeAttribute('first', 'x', 88);
    stop();
    stop();
    vi.advanceTimersByTime(2000);
    expect(supervisor.kill).toHaveBeenCalledOnce();
    expect(done).not.toHaveBeenCalled();
    expect(graph.getNodeAttribute('first', 'x')).toBe(0);
  });
  it('applies only the final layout when reduced motion is requested', () => {
    const graph = fixture();
    const done = vi.fn();
    startPeriodLayout(graph, done, { reducedMotion: true, duration: 1000 });
    supervisors[0].graph.setNodeAttribute('first', 'x', 25);
    vi.advanceTimersByTime(900);
    expect(graph.getNodeAttribute('first', 'x')).toBe(0);
    vi.advanceTimersByTime(100);
    expect(graph.getNodeAttribute('first', 'x')).toBe(25);
    expect(done).toHaveBeenCalledOnce();
  });
});
