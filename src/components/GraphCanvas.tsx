'use client';

import { useEffect, useRef, useState } from 'react';
import Graph from 'graphology';
import type Sigma from 'sigma';
import type { NodeHoverDrawingFunction, NodeLabelDrawingFunction } from 'sigma/rendering';
import { LocateFixed, Minus, Plus, Network, LoaderCircle } from 'lucide-react';
import type { Artist, Dataset, GraphSnapshot, MapFilters } from '@/lib/types';
import { COMMUNITY_COLORS, edgeThickness, nodeRadius } from '@/lib/graph';
import { fullScopeBounds } from '@/lib/graph-view';

export interface GraphCanvasProps {
  dataset: Dataset;
  snapshot: GraphSnapshot;
  filters: MapFilters;
  selectedArtistId?: string;
  selectedEdgeId?: string;
  path?: string[];
  onSelectArtist: (id: string) => void;
  onSelectEdge: (id: string) => void;
  onReady?: () => void;
}

// Sigma uses premultiplied-alpha blending (ONE, ONE_MINUS_SRC_ALPHA).
// Keep RGB premultiplied too, so translucent ties do not produce an additive glow.
const BASE_EDGE_COLOR = 'rgba(7,8,7,0.14)';

function initialsImage(artist: Artist, color: string): string {
  const initials = artist.name.replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2) || 'MC';
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#222a2a"/><text x="64" y="73" text-anchor="middle" fill="${color}" font-family="sans-serif" font-weight="700" font-size="35">${initials}</text></svg>`)}`;
}

const drawLabel: NodeLabelDrawingFunction = (context, data, settings) => {
  if (!data.label) return;
  const y = data.y + settings.labelSize / 3;
  context.font = `600 ${settings.labelSize}px ${settings.labelFont}`;
  const textWidth = context.measureText(data.label).width;
  const canvasWidth = context.canvas.clientWidth || context.canvas.width / (window.devicePixelRatio || 1);
  const rightX = data.x + data.size + 6;
  const x = Math.max(6, rightX + textWidth > canvasWidth - 6 ? data.x - data.size - textWidth - 6 : rightX);
  context.lineJoin = 'round';
  context.lineWidth = 4;
  context.strokeStyle = '#101715';
  context.strokeText(data.label, x, y);
  context.fillStyle = '#edf2e8';
  context.fillText(data.label, x, y);
};

const drawHover: NodeHoverDrawingFunction = (context, data, settings) => {
  context.beginPath();
  context.arc(data.x, data.y, data.size + 3, 0, Math.PI * 2);
  context.strokeStyle = '#c7ff40';
  context.lineWidth = 2;
  context.stroke();
  drawLabel(context, data, settings);
};

function updateGraph(graph: Graph, dataset: Dataset, snapshot: GraphSnapshot, failedPortraits = new Set<string>()) {
  graph.clear();
  const artists = new Map(dataset.artists.map((artist) => [artist.id, artist]));
  snapshot.nodes.forEach((node) => {
    const artist = artists.get(node.id);
    if (!artist) return;
    const color = node.community < 0 ? '#69736d' : COMMUNITY_COLORS[node.community % COMMUNITY_COLORS.length];
    graph.addNode(node.id, {
      x: node.x,
      y: node.y,
      size: nodeRadius(node.degree),
      color: '#242e2a',
      borderColor: color,
      communityColor: color,
      label: artist.kind === 'group' ? `${artist.name} · GROUP` : artist.name,
      image: !failedPortraits.has(artist.id) && artist.image?.src || initialsImage(artist, color),
      fallback: initialsImage(artist, color),
      type: 'portrait',
      degree: node.degree,
      zIndex: node.degree,
    });
  });
  snapshot.edges.forEach((edge) => {
    if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target)) return;
    graph.addUndirectedEdgeWithKey(edge.id, edge.source, edge.target, {
      size: edgeThickness(edge.count),
      color: BASE_EDGE_COLOR,
      label: `${edge.count}곡`,
      count: edge.count,
      affinity: edge.affinity,
    });
  });
}

/** Sigma is imported only after mount: its WebGL APIs cannot run during SSR. */
export default function GraphCanvas(props: GraphCanvasProps) {
  const container = useRef<HTMLDivElement>(null);
  const renderer = useRef<Sigma | null>(null);
  const graph = useRef<Graph | null>(null);
  const latest = useRef(props);
  latest.current = props;
  const stopLayout = useRef<(() => void) | null>(null);
  const layoutRunToken = useRef(0);
  const failedPortraits = useRef(new Set<string>());
  const benchmarkActive = useRef(false);
  const selectionInitialized = useRef(false);
  const previousSelection = useRef<string | undefined>(undefined);
  const viewportScale = useRef(1);
  const hovered = useRef<string | undefined>(undefined);
  const [hoveredId, setHoveredId] = useState<string>();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [layoutRunning, setLayoutRunning] = useState(false);
  const reducedMotion = useRef(false);
  const [layoutMessage, setLayoutMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    const imageChecks: HTMLImageElement[] = [];
    let contextLostCleanup: (() => void) | undefined;
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    async function initialize() {
      try {
        const [sigmaModule, imageModule, borderModule, renderingModule] = await Promise.all([
          import('sigma'), import('@sigma/node-image'), import('@sigma/node-border'), import('sigma/rendering'),
        ]);
        if (cancelled || !container.current) return;
        viewportScale.current = container.current.clientWidth < 600 ? 0.55 : 1;
        const g = new Graph({ type: 'undirected' });
        updateGraph(g, latest.current.dataset, latest.current.snapshot, failedPortraits.current);
        const border = borderModule.createNodeBorderProgram({
          borders: [
            { size: { value: 0.09, mode: 'relative' }, color: { attribute: 'borderColor' } },
            { size: { fill: true }, color: { attribute: 'color' } },
          ],
        });
        const image = imageModule.createNodeImageProgram({
          padding: 0.09,
          drawingMode: 'background',
          keepWithinCircle: true,
          objectFit: 'cover',
          size: { mode: 'max', value: 256 },
          debounceTimeout: 80,
        });
        // Faces retain their original colors. Focus is conveyed by outlines,
        // names and connections; an alpha layer can add RGB in WebGL blending.
        const portrait = renderingModule.createNodeCompoundProgram([border, image], drawLabel, drawHover);
        const sigma = new sigmaModule.default(g, container.current, {
          nodeProgramClasses: { portrait },
          defaultNodeType: 'portrait',
          labelFont: 'Arial, "Noto Sans KR", sans-serif',
          labelWeight: '600', labelSize: 11,
          labelColor: { color: '#edf2e8' },
          labelDensity: 0.8, labelGridCellSize: 90,
          labelRenderedSizeThreshold: 10,
          enableEdgeEvents: true,
          hideEdgesOnMove: false,
          hideLabelsOnMove: true,
          minEdgeThickness: 0.5,
          stagePadding: viewportScale.current < 1 ? 24 : 48,
          minCameraRatio: 0.05, maxCameraRatio: 3,
          zIndex: true,
          zoomDuration: reducedMotion.current ? 0 : 180,
          nodeReducer: (node, attributes) => {
            const { selectedArtistId, selectedEdgeId, path = [] } = benchmarkActive.current ? { selectedArtistId: undefined, selectedEdgeId: undefined, path: [] as string[] } : latest.current;
            const focus = hovered.current || selectedArtistId;
            const selectedEndpoints: string[] = selectedEdgeId && g.hasEdge(selectedEdgeId) ? g.extremities(selectedEdgeId) : [];
            const emphasized = node === focus || path.includes(node) || selectedEndpoints.includes(node);
            const neighbor = focus && g.hasNode(focus) && g.hasEdge(node, focus);
            const dimmed = (focus || selectedEndpoints.length || path.length) && !emphasized && !neighbor;
            return {
              ...attributes,
              image: attributes.image,
              borderColor: emphasized ? '#c7ff40' : dimmed ? '#3d4941' : attributes.communityColor,
              color: dimmed ? '#1c2420' : attributes.color,
              label: dimmed ? '' : attributes.label,
              forceLabel: emphasized,
              highlighted: false,
              zIndex: emphasized ? 10000 : attributes.zIndex,
              size: attributes.size * viewportScale.current * (emphasized ? 1.18 : 1),
            };
          },
          edgeReducer: (edge, attributes) => {
            const { selectedArtistId, selectedEdgeId, path = [] } = benchmarkActive.current ? { selectedArtistId: undefined, selectedEdgeId: undefined, path: [] as string[] } : latest.current;
            const focus = hovered.current || selectedArtistId;
            const [source, target] = g.extremities(edge);
            const pathIndex = path.indexOf(source);
            const inPath = pathIndex >= 0 && (path[pathIndex - 1] === target || path[pathIndex + 1] === target);
            const emphasized = selectedEdgeId === edge || inPath;
            const adjacent = focus === source || focus === target;
            const hasFocus = Boolean(focus || selectedEdgeId || path.length);
            return {
              ...attributes,
              color: emphasized ? '#d5ff6f' : adjacent ? '#8fac64' : hasFocus ? '#223025' : BASE_EDGE_COLOR,
              size: attributes.size * (emphasized ? 1.25 : 1),
              zIndex: emphasized ? 3 : adjacent ? 2 : 0,
            };
          },
        });
        graph.current = g;
        renderer.current = sigma;
        sigma.setCustomBBox(fullScopeBounds(latest.current.dataset.artists, latest.current.filters.extended));
        sigma.on('clickNode', ({ node }) => latest.current.onSelectArtist(node));
        sigma.on('clickEdge', ({ edge }) => latest.current.onSelectEdge(edge));
        sigma.on('enterNode', ({ node }) => {
          hovered.current = node;
          setHoveredId(node);
          if (container.current) container.current.style.cursor = 'pointer';
          sigma.refresh();
        });
        sigma.on('leaveNode', () => {
          hovered.current = undefined;
          setHoveredId(undefined);
          if (container.current) container.current.style.cursor = 'grab';
          sigma.refresh();
        });
        sigma.on('enterEdge', () => { if (container.current) container.current.style.cursor = 'pointer'; });
        sigma.on('leaveEdge', () => { if (container.current) container.current.style.cursor = 'grab'; });
        resizeObserver = new ResizeObserver(() => {
          viewportScale.current = (container.current?.clientWidth ?? 1000) < 600 ? 0.55 : 1;
          sigma.setSetting('stagePadding', viewportScale.current < 1 ? 24 : 48);
          sigma.resize();
          sigma.refresh();
        });
        resizeObserver.observe(container.current);
        const onContextLost = (event: Event) => { event.preventDefault(); setStatus('error'); };
        const canvases = Array.from(container.current.querySelectorAll('canvas'));
        canvases.forEach((canvas) => canvas.addEventListener('webglcontextlost', onContextLost));
        contextLostCleanup = () => canvases.forEach((canvas) => canvas.removeEventListener('webglcontextlost', onContextLost));

        // Test the same-origin portraits once. Failed downloads retain a named
        // initials portrait, instead of creating an empty or misleading node.
        latest.current.dataset.artists.forEach((artist) => {
          if (!artist.image) return;
          const check = new Image();
          check.onerror = () => {
            failedPortraits.current.add(artist.id);
            if (!cancelled && g.hasNode(artist.id)) g.setNodeAttribute(artist.id, 'image', g.getNodeAttribute(artist.id, 'fallback'));
          };
          check.src = artist.image.src;
          imageChecks.push(check);
        });

        type Instrumentation = {
          nodes: number;
          edges: number;
          getPosition: (id: string) => { x: number; y: number } | undefined;
          getWorldPosition: (id: string) => { x: number; y: number } | undefined;
          measureNavigation: (duration?: number) => Promise<{ fps: number; frames: number; duration: number; nodes: number; edges: number }>;
          injectTestGraph?: (options: { nodes: number; edges: number }) => Promise<void>;
          restoreGraph?: () => void;
        };
        const metrics: Instrumentation = {
          nodes: g.order, edges: g.size,
          getWorldPosition: (id) => g.hasNode(id) ? { x: g.getNodeAttribute(id, 'x'), y: g.getNodeAttribute(id, 'y') } : undefined,
          getPosition: (id) => {
            const data = sigma.getNodeDisplayData(id);
            return data ? sigma.graphToViewport({ x: g.getNodeAttribute(id, 'x'), y: g.getNodeAttribute(id, 'y') }) : undefined;
          },
          measureNavigation: async (duration = 1500) => {
            const state = sigma.getCamera().getState();
            let frames = 0;
            const count = () => { frames++; };
            sigma.on('afterRender', count);
            const started = performance.now();
            await sigma.getCamera().animate({ ratio: Math.max(0.1, state.ratio * 0.55), x: state.x + 0.03 }, { duration });
            const elapsed = performance.now() - started;
            sigma.removeListener('afterRender', count);
            sigma.getCamera().setState(state);
            return { fps: Math.round(frames * 1000 / elapsed), frames, duration: Math.round(elapsed), nodes: g.order, edges: g.size };
          },
        };
        if (process.env.NODE_ENV === 'development') {
          metrics.injectTestGraph = async (options) => {
            const { populateBenchmarkGraph } = await import('@/lib/graph-benchmark');
            if (cancelled) return;
            stopLayout.current?.();
            benchmarkActive.current = true;
            hovered.current = undefined;
            populateBenchmarkGraph(g, options, latest.current.dataset.artists.map((artist) => artist.image?.src).filter((src): src is string => Boolean(src)));
            sigma.setCustomBBox(null);
            sigma.getCamera().setState({ x: 0.5, y: 0.5, ratio: 1 });
            metrics.nodes = g.order;
            metrics.edges = g.size;
            sigma.refresh();
          };
          metrics.restoreGraph = () => {
            benchmarkActive.current = false;
            updateGraph(g, latest.current.dataset, latest.current.snapshot, failedPortraits.current);
            sigma.setCustomBBox(fullScopeBounds(latest.current.dataset.artists, latest.current.filters.extended));
            sigma.getCamera().setState({ x: 0.5, y: 0.5, ratio: 1 });
            metrics.nodes = g.order;
            metrics.edges = g.size;
            sigma.refresh();
          };
        }
        (window as unknown as { __hiphopGraph?: Instrumentation }).__hiphopGraph = metrics;
        setStatus('ready');
        latest.current.onReady?.();
      } catch (error) {
        if (!cancelled) {
          console.warn('Network visualization could not initialize.', error);
          setStatus('error');
        }
      }
    }
    void initialize();
    return () => {
      cancelled = true;
      layoutRunToken.current++;
      stopLayout.current?.();
      resizeObserver?.disconnect();
      contextLostCleanup?.();
      imageChecks.forEach((check) => { check.onerror = null; });
      renderer.current?.kill();
      renderer.current = null;
      graph.current = null;
      delete (window as unknown as { __hiphopGraph?: unknown }).__hiphopGraph;
    };
  }, []);

  useEffect(() => {
    if (!graph.current || !renderer.current) return;
    layoutRunToken.current++;
    benchmarkActive.current = false;
    stopLayout.current?.();
    stopLayout.current = null;
    setLayoutRunning(false);
    setLayoutMessage('');
    updateGraph(graph.current, props.dataset, props.snapshot, failedPortraits.current);
    const metrics = (window as unknown as { __hiphopGraph?: { nodes: number; edges: number } }).__hiphopGraph;
    if (metrics) { metrics.nodes = graph.current.order; metrics.edges = graph.current.size; }
    renderer.current.setCustomBBox(fullScopeBounds(props.dataset.artists, props.filters.extended));
    renderer.current.refresh();
  }, [props.dataset, props.snapshot, props.filters.extended]);

  useEffect(() => {
    const sigma = renderer.current;
    if (!sigma) return;
    sigma.refresh();
    const id = props.selectedArtistId;
    // Start with the overview. Selecting an artist later is an intentional
    // navigation action; the default detail panel should not zoom the map.
    if (!selectionInitialized.current) {
      selectionInitialized.current = true;
      previousSelection.current = id;
      return;
    }
    if (previousSelection.current === id) return;
    previousSelection.current = id;
    if (!id || !graph.current?.hasNode(id)) return;
    const data = sigma.getNodeDisplayData(id);
    if (data) void sigma.getCamera().animate({ x: data.x, y: data.y, ratio: Math.min(sigma.getCamera().ratio, 0.55) }, { duration: reducedMotion.current ? 0 : 280 });
  }, [props.selectedArtistId, props.selectedEdgeId, props.path, status]);

  async function relayout() {
    if (layoutRunning || !graph.current || !renderer.current) return;
    const token = ++layoutRunToken.current;
    setLayoutRunning(true);
    setLayoutMessage('이 기간의 협업 구조로 배치하고 있어요');
    try {
      const { startPeriodLayout } = await import('@/lib/layout-worker');
      if (!graph.current || !renderer.current || token !== layoutRunToken.current) return;
      renderer.current.setCustomBBox(null);
      renderer.current.getCamera().setState({ x: 0.5, y: 0.5, ratio: 1 });
      stopLayout.current = startPeriodLayout(graph.current, () => {
        if (token !== layoutRunToken.current) return;
        setLayoutRunning(false);
        setLayoutMessage('선택한 기간으로 배치했어요 · 필터를 바꾸면 기본 위치로 돌아갑니다');
        renderer.current?.refresh();
      }, { reducedMotion: reducedMotion.current });
    } catch {
      if (token !== layoutRunToken.current) return;
      setLayoutRunning(false);
      setLayoutMessage('재배치를 실행하지 못했어요. 기본 지도를 계속 탐색할 수 있습니다.');
    }
  }

  const hoveredArtist = props.dataset.artists.find((artist) => artist.id === hoveredId);
  const hoveredNode = props.snapshot.nodes.find((node) => node.id === hoveredId);

  return (
    <div className="graph-canvas" data-testid="graph-canvas" style={{ position: 'absolute', inset: 0 }}>
      <div ref={container} className="sigma-container" style={{ position: 'absolute', inset: 0, cursor: 'grab' }} aria-label="아티스트 협업 네트워크. 아티스트를 선택하거나 목록 보기에서 탐색할 수 있습니다." role="img" />
      {status === 'loading' && <div className="graph-status" role="status"><LoaderCircle size={20} className="spin" /> 협업 지도를 준비하고 있어요</div>}
      {status === 'error' && <div className="graph-status graph-error" role="alert"><Network size={26} /><strong>이 환경에서는 지도를 표시할 수 없어요</strong><span>WebGL을 지원하는 브라우저에서 열거나, 목록 보기로 같은 아티스트와 협업곡을 탐색하세요.</span></div>}
      {status === 'ready' && props.snapshot.nodes.length === 0 && <div className="graph-status" role="status">선택한 조건에 맞는 아티스트가 없어요. 기간이나 최소 공동곡 수를 조정해 보세요.</div>}
      {status === 'ready' && (
        <div className="canvas-controls" aria-label="지도 조작">
          <button className="canvas-control" type="button" aria-label="확대" title="확대" onClick={() => { void renderer.current?.getCamera().animatedZoom({ duration: reducedMotion.current ? 0 : 180 }); }}><Plus size={18} /></button>
          <button className="canvas-control" type="button" aria-label="축소" title="축소" onClick={() => { void renderer.current?.getCamera().animatedUnzoom({ duration: reducedMotion.current ? 0 : 180 }); }}><Minus size={18} /></button>
          <button className="canvas-control" type="button" aria-label="지도 전체 보기" title="지도 전체 보기" onClick={() => { void renderer.current?.getCamera().animatedReset({ duration: reducedMotion.current ? 0 : 240 }); }}><LocateFixed size={18} /></button>
          <button className="canvas-control canvas-relayout" type="button" disabled={layoutRunning || props.snapshot.edges.length === 0} onClick={() => { void relayout(); }} title="선택 기간의 협업 관계로 ForceAtlas2 재배치">
            {layoutRunning ? <LoaderCircle size={17} className="spin" /> : <Network size={17} />}<span>기간으로 재배치</span>
          </button>
        </div>
      )}
      {layoutMessage && <div className="layout-status" role="status">{layoutMessage}</div>}
      {hoveredArtist && <div className="canvas-tooltip" role="status"><strong>{hoveredArtist.name}</strong><span>{hoveredArtist.nameEn}</span><small>{hoveredNode?.degree ?? 0}명의 협업자 · {hoveredNode?.count ?? 0}곡</small></div>}
    </div>
  );
}
