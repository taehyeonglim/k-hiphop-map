import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { UndirectedGraph } from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import louvain from 'graphology-communities-louvain';
import { deriveGraph, defaultFilters, nodeRadius } from '../src/lib/graph';
import type { Artist, Dataset, ImageAsset } from '../src/lib/types';

const root = process.cwd();
const dataset: Dataset = JSON.parse(readFileSync(join(root, 'data/catalog.json'), 'utf8'));
const portraitsPath = join(root, 'data/portraits.json');
const portraits = existsSync(portraitsPath) ? JSON.parse(readFileSync(portraitsPath, 'utf8')) : {};
// Image changes also invalidate detail caches and shared dataset manifests.
const assetVersion = createHash('sha256').update(JSON.stringify(portraits)).digest('hex').slice(0, 8);
dataset.version = `${dataset.version}-${assetVersion}`;
function findPortrait(artist: Artist): ImageAsset | undefined {
  const entries = portraits.images ?? portraits.portraits ?? portraits;
  const keys = [artist.id, artist.externalIds.musicbrainz, artist.externalIds.musicbrainz && `mb-${artist.externalIds.musicbrainz}`, artist.externalIds.mbid, artist.name, artist.nameEn, ...artist.aliases].filter(Boolean);
  for (const key of keys) {
    const asset = entries[key];
    if (asset?.src && asset?.sourceUrl && asset?.license) return asset;
  }
  return undefined;
}
for (const artist of dataset.artists) {
  const image = findPortrait(artist); if (image) artist.image = image;
}
const snapshot = deriveGraph(dataset, { ...defaultFilters(dataset.asOf), extended: true });
const graph = new UndirectedGraph();
let seed = 1995;
const rng = () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
const connected = snapshot.nodes.filter(n => n.degree > 0).sort((a, b) => a.id.localeCompare(b.id));
connected.forEach((node, index) => {
  const angle = 2 * Math.PI * index / Math.max(1, connected.length);
  const radius = 20 + rng() * 40;
  graph.addNode(node.id, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, size: nodeRadius(node.degree) * 1.3 });
});
for (const edge of snapshot.edges) if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) graph.addEdgeWithKey(edge.id, edge.source, edge.target, { weight: edge.affinity });
if (graph.order > 1 && graph.size > 0) {
  louvain.assign(graph, { getEdgeWeight: 'weight', resolution: 1, rng });
  forceAtlas2.assign(graph, { iterations: 900, getEdgeWeight: 'weight', settings: { ...forceAtlas2.inferSettings(graph), barnesHutOptimize: graph.order > 300, gravity: 0.12, scalingRatio: 12, adjustSizes: true, edgeWeightInfluence: 1, linLogMode: true, slowDown: 3 } });
}
// Normalize coordinates for predictable camera fitting. Put isolates in a separate right-side catalog strip.
const points = graph.mapNodes((_id, a) => ({ x: Number(a.x), y: Number(a.y) }));
const minX = Math.min(0, ...points.map(p => p.x)), maxX = Math.max(1, ...points.map(p => p.x));
const minY = Math.min(0, ...points.map(p => p.y)), maxY = Math.max(1, ...points.map(p => p.y));
const scale = 1000 / Math.max(maxX - minX, maxY - minY, 1);
const isolateIds = snapshot.nodes.filter(n => n.degree === 0).map(n => n.id).sort();
const communities = new Map<number, number>();
for (const artist of dataset.artists) {
  if (graph.hasNode(artist.id)) {
    const a = graph.getNodeAttributes(artist.id);
    artist.x = Math.round((a.x - (minX + maxX) / 2) * scale * 100) / 100;
    artist.y = Math.round((a.y - (minY + maxY) / 2) * scale * 100) / 100;
    const community = Number(a.community ?? 0);
    if (!communities.has(community)) communities.set(community, communities.size);
    artist.community = communities.get(community);
  } else {
    const i = Math.max(0, isolateIds.indexOf(artist.id));
    artist.x = 600 + (i % 6) * 28; artist.y = 380 - Math.floor(i / 6) * 28;
    artist.community = -1;
  }
}
// Separate portraits after topology layout. Grid-local relaxation preserves
// neighborhood structure while avoiding coincident face nodes in the overview.
const movable = dataset.artists.filter(a => graph.hasNode(a.id));
const degrees = new Map(snapshot.nodes.map(n => [n.id, n.degree]));
for (let iteration = 0; iteration < 65; iteration++) {
  const buckets = new Map<string, number[]>();
  const cellSize = 90;
  movable.forEach((a, i) => { const key = `${Math.floor(a.x! / cellSize)},${Math.floor(a.y! / cellSize)}`; const indices = buckets.get(key) ?? []; indices.push(i); buckets.set(key, indices); });
  let collisions = 0;
  for (let i = 0; i < movable.length; i++) {
    const a = movable[i], bx = Math.floor(a.x! / cellSize), by = Math.floor(a.y! / cellSize);
    for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) for (const j of buckets.get(`${bx + ox},${by + oy}`) ?? []) {
      if (j <= i) continue; const b = movable[j];
      let dx = b.x! - a.x!, dy = b.y! - a.y!, distance = Math.hypot(dx, dy);
      const needed = (nodeRadius(degrees.get(a.id) ?? 0) + nodeRadius(degrees.get(b.id) ?? 0)) * 1.7 + 5;
      if (distance >= needed) continue;
      if (distance < 0.001) { dx = Math.cos(i + j); dy = Math.sin(i + j); distance = 1; }
      const offset = (needed - distance) * 0.52;
      a.x! -= dx / distance * offset; a.y! -= dy / distance * offset;
      b.x! += dx / distance * offset; b.y! += dy / distance * offset;
      collisions++;
    }
  }
  if (collisions === 0) break;
}
for (const a of movable) { a.x = Math.round(a.x! * 100) / 100; a.y = Math.round(a.y! * 100) / 100; }
const output = join(root, 'public/data');
// Remove obsolete identity/recording chunks when the reviewed catalog changes.
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
mkdirSync(join(output, 'artists'), { recursive: true }); mkdirSync(join(output, 'recordings'), { recursive: true });
const full = deriveGraph(dataset, { ...defaultFilters(dataset.asOf), extended: true });
writeFileSync(join(output, 'graph.json'), JSON.stringify(full));
writeFileSync(join(root, 'data/catalog.enriched.json'), JSON.stringify(dataset));
const lean: Dataset = { ...dataset, releases: [], memberships: [], recordings: dataset.recordings.map(r => ({ ...r, credits: r.credits.map(c => ({ ...c, sourceIds: [] })), sources: [], isrcs: [], releaseIds: [], listenUrl: undefined })), artists: dataset.artists.map(a => ({ ...a, sources: [] })) };
writeFileSync(join(output, 'map.json'), JSON.stringify(lean));
const recordingsByArtist = new Map<string, typeof dataset.recordings>();
const ownedReleases = new Map<string, Set<string>>();
const releaseLookup = new Map(dataset.releases.map(r => [r.id, r]));
for (const recording of dataset.recordings) for (const id of new Set(recording.credits.map(c => c.artistId))) {
  const bucket = recordingsByArtist.get(id) ?? []; bucket.push(recording); recordingsByArtist.set(id, bucket);
}
for (const release of dataset.releases) for (const id of release.artistIds) {
  const bucket = ownedReleases.get(id) ?? new Set<string>(); bucket.add(release.id); ownedReleases.set(id, bucket);
}
for (const artist of dataset.artists) {
  const recordings = recordingsByArtist.get(artist.id) ?? [];
  const releaseIds = new Set([...(ownedReleases.get(artist.id) ?? []), ...recordings.flatMap(r => r.releaseIds)]);
  const releases = [...releaseIds].map(id => releaseLookup.get(id)).filter((r): r is Dataset['releases'][number] => Boolean(r));
  const memberships = dataset.memberships.filter(m => m.groupId === artist.id || m.artistId === artist.id);
  writeFileSync(join(output, 'artists', `${artist.id}.json`), JSON.stringify({ artist, recordings, releases, memberships }));
}
for (const r of dataset.recordings) writeFileSync(join(output, 'recordings', `${r.id}.json`), JSON.stringify(r));
writeFileSync(join(output, 'manifest.json'), JSON.stringify({ version: dataset.version, asOf: dataset.asOf, stats: full.stats, files: { graph: '/data/graph.json', map: '/data/map.json' }, notes: dataset.notes }));
console.log(JSON.stringify({ ...full.stats, edges: full.edges.length, communities: communities.size, mapBytes: Buffer.byteLength(JSON.stringify(lean)) }, null, 2));
