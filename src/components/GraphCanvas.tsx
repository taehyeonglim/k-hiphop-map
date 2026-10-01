'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Graph from 'graphology';
import type Sigma from 'sigma';
import type { NodeHoverDrawingFunction, NodeLabelDrawingFunction } from 'sigma/rendering';
import { LocateFixed, Minus, Plus, Network, LoaderCircle } from 'lucide-react';
import type { Artist, Dataset, GraphSnapshot, MapFilters } from '@/lib/types';
import { COMMUNITY_COLORS, edgeThickness, nodeRadius } from '@/lib/graph';
import { fullScopeBounds, visibleNeighborhoodEdgeIds, visibleNeighborhoodIds } from '@/lib/graph-view';
import { DragPhysics } from '@/lib/drag-physics';

export interface GraphCanvasProps {
  dataset: Dataset;
  snapshot: GraphSnapshot;
  filters: MapFilters;
  selectedArtistId?: string;
  selectedEdgeId?: string;
  path?: string[];
  onSelectArtist: (id: string) => void;
  onSelectEdge: (id: string) => void;
  onClearSelection?: () => void;
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
  const rightInset = canvasWidth < 600 ? 54 : 6;
  const rightX = data.x + data.size + 6;
  const x = Math.max(6, rightX + textWidth > canvasWidth - rightInset ? data.x - data.size - textWidth - 6 : rightX);
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
  const visibleNodes = useMemo(() => visibleNeighborhoodIds(props.snapshot, props.selectedArtistId, props.path), [props.snapshot, props.selectedArtistId, props.path]);
  const visibleEdges = useMemo(() => visibleNeighborhoodEdgeIds(props.snapshot, props.selectedArtistId, props.path), [props.snapshot, props.selectedArtistId, props.path]);
  const visibility = useRef({ nodes: visibleNodes, edges: visibleEdges });
  visibility.current = { nodes: visibleNodes, edges: visibleEdges };
  const stopLayout = useRef<(() => void) | null>(null);
  const layoutRunToken = useRef(0);
  const failedPortraits = useRef(new Set<string>());
  const benchmarkActive = useRef(false);
  const selectionInitialized = useRef(false);
  const previousSelection = useRef<string | undefined>(undefined);
  const previousPath = useRef('');
  const fitSelection = useRef<(id?: string, path?: string[]) => void>(() => {});
  const viewportScale = useRef(1);
  const hovered = useRef<string | undefined>(undefined);
  const pressed = useRef<{ node: string; startX: number; startY: number; offsetX: number; offsetY: number; moved: boolean } | null>(null);
  const physics = useRef<DragPhysics | null>(null);
  const cancelDrag = useRef<() => void>(() => {});
  const interaction = useRef({ isDragging: false, isSettling: false });
  const [gesturePhase, setGesturePhase] = useState<'idle' | 'pressed' | 'dragging' | 'settling'>('idle');
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
    let interactionCleanup: (() => void) | undefined;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = motionPreference.matches;

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
          zoomDuration: reducedMotion.current ? 1 : 180,
          nodeReducer: (node, attributes) => {
            const { selectedArtistId, selectedEdgeId, path = [] } = benchmarkActive.current ? { selectedArtistId: undefined, selectedEdgeId: undefined, path: [] as string[] } : latest.current;
            const focus = hovered.current || selectedArtistId;
            const selectedEndpoints: string[] = selectedEdgeId && g.hasEdge(selectedEdgeId) ? g.extremities(selectedEdgeId) : [];
            const emphasized = node === selectedArtistId || node === focus || path.includes(node) || selectedEndpoints.includes(node);
            const neighbor = focus && g.hasNode(focus) && g.hasEdge(node, focus);
            const dimmed = (focus || selectedEndpoints.length || path.length) && !emphasized && !neighbor;
            return {
              ...attributes,
              hidden: !benchmarkActive.current && !visibility.current.nodes.has(node),
              image: attributes.image,
              borderColor: emphasized ? '#c7ff40' : dimmed ? '#3d4941' : attributes.communityColor,
              color: dimmed ? '#1c2420' : attributes.color,
              label: dimmed ? '' : attributes.label,
              forceLabel: emphasized || Boolean(viewportScale.current === 1 && selectedArtistId && visibility.current.nodes.size <= 24 && visibility.current.nodes.has(node)),
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
              hidden: !benchmarkActive.current && (!visibility.current.edges.has(edge) || !visibility.current.nodes.has(source) || !visibility.current.nodes.has(target)),
              color: emphasized ? '#d5ff6f' : adjacent ? '#8fac64' : hasFocus ? '#223025' : BASE_EDGE_COLOR,
              size: attributes.size * (emphasized ? 1.25 : 1),
              zIndex: emphasized ? 3 : adjacent ? 2 : 0,
            };
          },
        });
        graph.current = g;
        renderer.current = sigma;
        sigma.setCustomBBox(fullScopeBounds(latest.current.dataset.artists, latest.current.filters.extended));
        let animationFrame: number | undefined;
        let previousFrame = 0;
        let releaseAt = 0;
        let settleDeadline: ReturnType<typeof setTimeout> | undefined;
        let ignoreClickUntil = 0;
        const manualRestPositions = new Map<string, { x: number; y: number }>();

        function applyPhysics() {
          const positions = new Map(physics.current?.positions().map((point) => [point.id, point]) ?? []);
          if (!positions.size) return;
          g.updateEachNodeAttributes((id, attributes) => {
            const position = positions.get(id);
            return position ? { ...attributes, x: position.x, y: position.y } : attributes;
          }, { attributes: ['x', 'y'] });
        }

        function cancelInteraction(restoreManual = true, resetCaptors = true) {
          if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
          animationFrame = undefined;
          if (settleDeadline) clearTimeout(settleDeadline);
          settleDeadline = undefined;
          physics.current?.cancel();
          applyPhysics();
          if (restoreManual && manualRestPositions.size) {
            g.updateEachNodeAttributes((id, attributes) => {
              const rest = manualRestPositions.get(id);
              return rest ? { ...attributes, ...rest } : attributes;
            }, { attributes: ['x', 'y'] });
            manualRestPositions.clear();
          }
          physics.current = null;
          pressed.current = null;
          interaction.current = { isDragging: false, isSettling: false };
          previousFrame = 0;
          sigma.getCamera().enable();
          const mouse = sigma.getMouseCaptor();
          const touch = sigma.getTouchCaptor();
          mouse.isMoving = false;
          touch.isMoving = false;
          if (resetCaptors) {
            // Cancelling a gesture must also disarm Sigma's captors. Merely
            // enabling the camera would let a later body move resume panning
            // after blur or a cancelled touch that never received an up event.
            if (mouse.movingTimeout !== null) clearTimeout(mouse.movingTimeout);
            mouse.movingTimeout = null;
            mouse.isMouseDown = false;
            mouse.lastMouseX = null;
            mouse.lastMouseY = null;
            mouse.startCameraState = null;
            mouse.downStartTime = null;
            mouse.draggedEvents = 0;
            if (touch.movingTimeout !== undefined) clearTimeout(touch.movingTimeout);
            touch.movingTimeout = undefined;
            touch.touchMode = 0;
            touch.hasMoved = false;
            touch.startTouchesPositions = [];
            touch.lastTouches = [];
            touch.lastTouchesPositions = undefined;
            touch.startCameraState = undefined;
            touch.startTouchesAngle = undefined;
            touch.startTouchesDistance = undefined;
          }
          if (container.current) container.current.style.cursor = 'grab';
          if (!cancelled) setGesturePhase('idle');
        }
        cancelDrag.current = cancelInteraction;

        function animatePhysics(timestamp: number) {
          animationFrame = undefined;
          const simulation = physics.current;
          if (!simulation || cancelled) return;
          if (interaction.current.isSettling && timestamp - releaseAt >= simulation.maxSettleSeconds * 1000) simulation.cancel();
          const active = simulation.step(previousFrame ? (timestamp - previousFrame) / 1000 : 1 / 60);
          previousFrame = timestamp;
          applyPhysics();
          if (simulation.finished) {
            physics.current = null;
            interaction.current.isSettling = false;
            if (settleDeadline) clearTimeout(settleDeadline);
            settleDeadline = undefined;
            setGesturePhase('idle');
          } else if (active) animationFrame = requestAnimationFrame(animatePhysics);
        }

        function wakePhysics() {
          if (animationFrame === undefined) {
            previousFrame = 0;
            animationFrame = requestAnimationFrame(animatePhysics);
          }
        }

        function fitVisible(id?: string, path: string[] = []) {
          if (pressed.current || interaction.current.isDragging || interaction.current.isSettling || cancelled) return;
          const camera = sigma.getCamera();
          if (!id) { void camera.animatedReset({ duration: reducedMotion.current ? 1 : 260 }); return; }
          const ids = visibleNeighborhoodIds(latest.current.snapshot, id, path);
          const positions = [...ids].map((key) => sigma.getNodeDisplayData(key)).filter((data): data is NonNullable<typeof data> => Boolean(data));
          if (!positions.length) return;
          const center = {
            x: (Math.min(...positions.map((point) => point.x)) + Math.max(...positions.map((point) => point.x))) / 2,
            y: (Math.min(...positions.map((point) => point.y)) + Math.max(...positions.map((point) => point.y))) / 2,
          };
          const dimensions = sigma.getDimensions();
          const cameraState = { ...camera.getState(), ...center, ratio: 1 };
          const projected = positions.map((point) => sigma.framedGraphToViewport(point, { cameraState }));
          const width = Math.max(...projected.map((point) => point.x)) - Math.min(...projected.map((point) => point.x));
          const height = Math.max(...projected.map((point) => point.y)) - Math.min(...projected.map((point) => point.y));
          // Fit the neighborhood into the area below the search/focus banner
          // and above the controls, rather than centering it behind overlays.
          const mobile = dimensions.width < 600;
          const inset = { top: mobile ? 130 : 140, bottom: 65, left: mobile ? 36 : 50, right: mobile ? 64 : 50 };
          const ratio = Math.max(0.35, Math.min(2.5, Math.max(width / Math.max(80, dimensions.width - inset.left - inset.right), height / Math.max(80, dimensions.height - inset.top - inset.bottom)) * 1.12));
          const fittedState = { ...cameraState, ratio };
          const target = sigma.viewportToFramedGraph({
            x: (inset.left + dimensions.width - inset.right) / 2,
            y: (inset.top + dimensions.height - inset.bottom) / 2,
          }, { cameraState: fittedState });
          void camera.animate({ x: 2 * center.x - target.x, y: 2 * center.y - target.y, ratio }, { duration: reducedMotion.current ? 1 : 260 });
        }
        fitSelection.current = fitVisible;

        sigma.on('downNode', ({ node, event, preventSigmaDefault }) => {
          if (benchmarkActive.current || sigma.getNodeDisplayData(node)?.hidden) return;
          if ('button' in event.original && event.original.button !== 0) return;
          if ('touches' in event.original && event.original.touches.length !== 1) { cancelInteraction(false, false); return; }
          // Sigma arms its captor before emitting downNode, so preserve that
          // fresh down while cancelling the previous motion's frame/timer.
          cancelInteraction(false, false);
          stopLayout.current?.();
          stopLayout.current = null;
          layoutRunToken.current++;
          setLayoutRunning(false);
          setLayoutMessage('');
          // Freeze current period-layout bounds too, preventing auto-rescaling
          // as the pinned node and its neighbors temporarily deform the map.
          if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
          const world = sigma.viewportToGraph({ x: event.x, y: event.y });
          const x = g.getNodeAttribute(node, 'x');
          const y = g.getNodeAttribute(node, 'y');
          pressed.current = { node, startX: event.x, startY: event.y, offsetX: x - world.x, offsetY: y - world.y, moved: false };
          interaction.current = { isDragging: false, isSettling: false };
          const camera = sigma.getCamera();
          // Replacing an existing animation cancels its RAF. Disabling alone
          // would let that old fit resume after a short drag is released. A
          // same-state 1ms animation also avoids Sigma's duration=0 / 0 case.
          camera.animate(camera.getState(), { duration: 1 }, () => {});
          camera.disable();
          setGesturePhase('pressed');
          preventSigmaDefault();
          latest.current.onSelectArtist(node);
        });

        sigma.on('moveBody', ({ event, preventSigmaDefault }) => {
          const press = pressed.current;
          if (!press) return;
          if ('touches' in event.original && event.original.touches.length > 1) { cancelInteraction(false, false); return; }
          preventSigmaDefault();
          if (event.original.cancelable) event.original.preventDefault();
          if (!press.moved && Math.hypot(event.x - press.startX, event.y - press.startY) < 5) return;
          if (!press.moved) {
            press.moved = true;
            const ids = visibleNeighborhoodIds(latest.current.snapshot, press.node);
            const edgeIds = visibleNeighborhoodEdgeIds(latest.current.snapshot, press.node);
            const points = [...ids].filter((id) => g.hasNode(id)).map((id) => ({ id, x: g.getNodeAttribute(id, 'x'), y: g.getNodeAttribute(id, 'y') }));
            const springs = latest.current.snapshot.edges.filter((edge) => edgeIds.has(edge.id)).map((edge) => ({ source: edge.source, target: edge.target, weight: edge.affinity }));
            if (reducedMotion.current && !manualRestPositions.has(press.node)) {
              const rest = points.find((point) => point.id === press.node);
              if (rest) manualRestPositions.set(press.node, { x: rest.x, y: rest.y });
            }
            physics.current = new DragPhysics(points, springs, press.node, reducedMotion.current);
            interaction.current.isDragging = true;
            setGesturePhase('dragging');
          }
          const world = sigma.viewportToGraph({ x: event.x, y: event.y });
          physics.current?.pin({ x: world.x + press.offsetX, y: world.y + press.offsetY });
          applyPhysics();
          if (!reducedMotion.current) wakePhysics();
          if (container.current) container.current.style.cursor = 'grabbing';
        });

        function finishGesture() {
          const press = pressed.current;
          if (!press) return;
          pressed.current = null;
          interaction.current.isDragging = false;
          sigma.getCamera().enable();
          if (container.current) container.current.style.cursor = 'grab';
          // A newly opened mobile detail sheet changes the canvas dimensions.
          // Keep the node chosen on down rather than repicking the old screen
          // coordinate as a different node or background on the following tap.
          ignoreClickUntil = performance.now() + 300;
          if (press.moved && physics.current) {
            physics.current.release();
            if (reducedMotion.current) {
              // Preserve manual placement across repeat drags and selections.
              // Its saved rest point is restored only by explicit reset/filter.
              physics.current = null;
              interaction.current.isSettling = false;
              setGesturePhase('idle');
            } else {
              interaction.current.isSettling = true;
              releaseAt = performance.now();
              setGesturePhase('settling');
              settleDeadline = setTimeout(cancelInteraction, 2400);
              wakePhysics();
            }
          } else {
            setGesturePhase('idle');
            fitVisible(press.node);
          }
        }
        sigma.on('upNode', finishGesture);
        sigma.on('upEdge', finishGesture);
        sigma.on('upStage', finishGesture);
        sigma.on('downStage', () => { if (!pressed.current) { ignoreClickUntil = 0; cancelInteraction(false, false); } });
        sigma.on('downEdge', () => { if (!pressed.current) { ignoreClickUntil = 0; cancelInteraction(false, false); } });
        sigma.on('clickNode', ({ node }) => {
          if (performance.now() < ignoreClickUntil || sigma.getNodeDisplayData(node)?.hidden) return;
          latest.current.onSelectArtist(node);
        });
        sigma.on('clickEdge', ({ edge }) => {
          if (performance.now() < ignoreClickUntil || sigma.getEdgeDisplayData(edge)?.hidden) return;
          latest.current.onSelectEdge(edge);
        });
        sigma.on('clickStage', () => {
          if (performance.now() < ignoreClickUntil) return;
          cancelInteraction();
          latest.current.onClearSelection?.();
        });
        const onMotionChange = () => { reducedMotion.current = motionPreference.matches; cancelInteraction(); };
        const onVisibilityChange = () => { if (document.hidden) cancelInteraction(); };
        const cancelFromEvent = () => cancelInteraction();
        motionPreference.addEventListener('change', onMotionChange);
        window.addEventListener('blur', cancelFromEvent);
        window.addEventListener('pointercancel', cancelFromEvent);
        window.addEventListener('touchcancel', cancelFromEvent);
        document.addEventListener('visibilitychange', onVisibilityChange);
        interactionCleanup = () => {
          cancelInteraction();
          motionPreference.removeEventListener('change', onMotionChange);
          window.removeEventListener('blur', cancelFromEvent);
          window.removeEventListener('pointercancel', cancelFromEvent);
          window.removeEventListener('touchcancel', cancelFromEvent);
          document.removeEventListener('visibilitychange', onVisibilityChange);
        };
        sigma.on('enterNode', ({ node }) => {
          hovered.current = node;
          setHoveredId(node);
          if (container.current && !pressed.current?.moved) container.current.style.cursor = 'pointer';
          sigma.refresh();
        });
        sigma.on('leaveNode', () => {
          hovered.current = undefined;
          setHoveredId(undefined);
          if (container.current && !pressed.current?.moved) container.current.style.cursor = 'grab';
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
          visibleNodes: number;
          visibleEdges: number;
          getVisibleNodeIds: () => string[];
          getVisibleEdgeIds: () => string[];
          getCameraState: () => { x: number; y: number; ratio: number; angle: number };
          getInteractionState: () => { isDragging: boolean; isSettling: boolean; hoveredId?: string };
          getPosition: (id: string) => { x: number; y: number } | undefined;
          getWorldPosition: (id: string) => { x: number; y: number } | undefined;
          measureNavigation: (duration?: number) => Promise<{ fps: number; frames: number; duration: number; nodes: number; edges: number }>;
          injectTestGraph?: (options: { nodes: number; edges: number }) => Promise<void>;
          restoreGraph?: () => void;
        };
        const metrics: Instrumentation = {
          nodes: g.order, edges: g.size,
          get visibleNodes() { return g.filterNodes((id) => sigma.getNodeDisplayData(id)?.hidden === false).length; },
          get visibleEdges() { return g.filterEdges((id, _attributes, source, target) => sigma.getEdgeDisplayData(id)?.hidden === false && sigma.getNodeDisplayData(source)?.hidden === false && sigma.getNodeDisplayData(target)?.hidden === false).length; },
          getVisibleNodeIds: () => g.filterNodes((id) => sigma.getNodeDisplayData(id)?.hidden === false),
          getVisibleEdgeIds: () => g.filterEdges((id, _attributes, source, target) => sigma.getEdgeDisplayData(id)?.hidden === false && sigma.getNodeDisplayData(source)?.hidden === false && sigma.getNodeDisplayData(target)?.hidden === false),
          getCameraState: () => sigma.getCamera().getState(),
          getInteractionState: () => ({ ...interaction.current, hoveredId: hovered.current }),
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
            cancelInteraction();
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
            cancelInteraction();
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
      interactionCleanup?.();
      imageChecks.forEach((check) => { check.onerror = null; });
      renderer.current?.kill();
      renderer.current = null;
      graph.current = null;
      delete (window as unknown as { __hiphopGraph?: unknown }).__hiphopGraph;
    };
  }, []);

  useEffect(() => {
    if (!graph.current || !renderer.current) return;
    cancelDrag.current();
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
    if ((pressed.current && pressed.current.node !== props.selectedArtistId) || (interaction.current.isSettling && physics.current?.draggedId !== props.selectedArtistId) || (!props.selectedArtistId && previousSelection.current)) cancelDrag.current();
    sigma.refresh();
    const id = props.selectedArtistId;
    const pathKey = props.path?.join('|') ?? '';
    if (!selectionInitialized.current) {
      selectionInitialized.current = true;
      previousSelection.current = id;
      previousPath.current = pathKey;
      if (id && !pressed.current) fitSelection.current(id, props.path);
      return;
    }
    if (previousSelection.current === id && previousPath.current === pathKey) return;
    previousSelection.current = id;
    previousPath.current = pathKey;
    if (pressed.current || interaction.current.isDragging || interaction.current.isSettling) return;
    fitSelection.current(id, props.path);
  }, [props.selectedArtistId, props.selectedEdgeId, props.path, status]);

  async function relayout() {
    if (layoutRunning || !graph.current || !renderer.current) return;
    cancelDrag.current();
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
    <div className="graph-canvas" data-testid="graph-canvas" data-interaction={gesturePhase} style={{ position: 'absolute', inset: 0 }}>
      <div ref={container} className="sigma-container" style={{ position: 'absolute', inset: 0, cursor: 'grab' }} aria-label="아티스트 협업 네트워크. 아티스트를 선택하거나 목록 보기에서 탐색할 수 있습니다." role="img" />
      {status === 'loading' && <div className="graph-status" role="status"><LoaderCircle size={20} className="spin" /> 협업 지도를 준비하고 있어요</div>}
      {status === 'error' && <div className="graph-status graph-error" role="alert"><Network size={26} /><strong>이 환경에서는 지도를 표시할 수 없어요</strong><span>WebGL을 지원하는 브라우저에서 열거나, 목록 보기로 같은 아티스트와 협업곡을 탐색하세요.</span></div>}
      {status === 'ready' && props.snapshot.nodes.length === 0 && <div className="graph-status" role="status">선택한 조건에 맞는 아티스트가 없어요. 기간이나 최소 공동곡 수를 조정해 보세요.</div>}
      {status === 'ready' && (
        <div className="canvas-controls" aria-label="지도 조작">
          <button className="canvas-control" type="button" aria-label="확대" title="확대" onClick={() => { void renderer.current?.getCamera().animatedZoom({ duration: reducedMotion.current ? 1 : 180 }); }}><Plus size={18} /></button>
          <button className="canvas-control" type="button" aria-label="축소" title="축소" onClick={() => { void renderer.current?.getCamera().animatedUnzoom({ duration: reducedMotion.current ? 1 : 180 }); }}><Minus size={18} /></button>
          <button className="canvas-control" type="button" aria-label="지도 전체 보기" title="지도 전체 보기" onClick={() => { cancelDrag.current(); latest.current.onClearSelection?.(); void renderer.current?.getCamera().animatedReset({ duration: reducedMotion.current ? 1 : 240 }); }}><LocateFixed size={18} /></button>
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
