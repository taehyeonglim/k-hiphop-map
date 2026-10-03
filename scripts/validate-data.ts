import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Dataset, MapDataset, ArtistDetail, RecordingDetail } from '../src/lib/types';
import { deriveGraph, defaultFilters, performerIds } from '../src/lib/graph';
const enriched = join(process.cwd(), 'data/catalog.enriched.json');
const dataset: Dataset = JSON.parse(readFileSync(existsSync(enriched) ? enriched : 'data/catalog.json', 'utf8'));
const errors: string[] = [], warnings: string[] = [];
if (existsSync(enriched)) {
  for (const input of ['data/catalog.json', 'data/portraits.json']) {
    if (existsSync(input) && statSync(input).mtimeMs > statSync(enriched).mtimeMs) errors.push(`Stale snapshot: ${input} changed; run npm run data:build`);
  }
}
const artists = new Map(dataset.artists.map(a => [a.id, a]));
const recordings = new Map(dataset.recordings.map(r => [r.id, r]));
const releases = new Map(dataset.releases.map(r => [r.id, r]));
const safeId = /^[a-zA-Z0-9_-]+$/;
const validUrl = (value: string) => { try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; } catch { return false; } };
if (artists.size !== dataset.artists.length) errors.push('Duplicate artist IDs');
if (recordings.size !== dataset.recordings.length) errors.push('Duplicate recording IDs');
if (releases.size !== dataset.releases.length) errors.push('Duplicate release IDs');
for (const artist of dataset.artists) {
  if (!safeId.test(artist.id)) errors.push(`Unsafe artist ID: ${artist.id}`);
  if (!artist.name || !artist.sources.length) errors.push(`Artist missing identity evidence: ${artist.id}`);
  for (const source of artist.sources) if (!validUrl(source.url)) errors.push(`Invalid identity source URL: ${artist.id}`);
  if (artist.image) {
    if (!artist.image.author || !artist.image.licenseUrl || !artist.image.sourceUrl || !artist.image.originalUrl) errors.push(`Incomplete image attribution: ${artist.id}`);
    if (artist.image.src.startsWith('/') && !existsSync(join(process.cwd(), 'public', artist.image.src))) errors.push(`Missing image asset: ${artist.image.src}`);
  }
}
const isrcIndex = new Map<string, string>();
for (const recording of dataset.recordings) {
  if (!safeId.test(recording.id)) errors.push(`Unsafe recording ID: ${recording.id}`);
  if (recording.year < 1995 || recording.year > Number(dataset.asOf.slice(0, 4))) errors.push(`Out-of-range recording: ${recording.id}`);
  if (recording.verification !== 'pending' && !recording.sources.length) errors.push(`Recording has no evidence: ${recording.id}`);
  if (recording.date && recording.date > dataset.asOf) errors.push(`Unreleased recording beyond snapshot date: ${recording.id}`);
  for (const source of recording.sources) if (!validUrl(source.url)) errors.push(`Invalid recording source URL: ${recording.id}`);
  if (recording.listenUrl && !validUrl(recording.listenUrl)) errors.push(`Invalid listening URL: ${recording.id}`);
  for (const credit of recording.credits) {
    if (!artists.has(credit.artistId)) errors.push(`Unknown credited artist: ${credit.artistId}`);
    if (credit.verification !== 'pending' && !credit.sourceIds.some(id => recording.sources.some(s => s.id === id))) errors.push(`Credit evidence mismatch: ${recording.id}/${credit.artistId}`);
  }
  for (const id of recording.releaseIds) if (!releases.has(id)) errors.push(`Unknown release: ${id}`);
  for (const isrc of recording.isrcs) { const old = isrcIndex.get(isrc); if (old && old !== recording.id) warnings.push(`Shared ISRC pending version review: ${old}, ${recording.id}`); else isrcIndex.set(isrc, recording.id); }
}
for (const release of dataset.releases) {
  if (!safeId.test(release.id)) errors.push(`Unsafe release ID: ${release.id}`);
  if (!validUrl(release.source.url)) errors.push(`Invalid release source URL: ${release.id}`);
  for (const id of release.recordingIds) if (!recordings.has(id)) errors.push(`Unknown recording on release: ${id}`);
  for (const id of release.artistIds) if (!artists.has(id)) errors.push(`Unknown release artist: ${id}`);
}
for (const membership of dataset.memberships) {
  if (artists.get(membership.groupId)?.kind !== 'group') errors.push(`Membership group is not a group: ${membership.groupId}`);
  if (!artists.has(membership.artistId) || membership.groupId === membership.artistId) errors.push(`Invalid membership artist: ${membership.artistId}`);
  if (!validUrl(membership.source.url)) errors.push(`Invalid membership source URL: ${membership.groupId}/${membership.artistId}`);
}
const snapshot = deriveGraph(dataset, { ...defaultFilters(dataset.asOf), extended: true });
for (const edge of snapshot.edges) {
  if (edge.source === edge.target) errors.push(`Self-loop ${edge.id}`);
  if (edge.count !== new Set(edge.recordingIds).size) errors.push(`Duplicate pair contribution ${edge.id}`);
  for (const id of edge.recordingIds) {
    const r = recordings.get(id)!; const participants = performerIds(r);
    if (!participants.includes(edge.source) || !participants.includes(edge.target)) errors.push(`Unproven edge ${edge.id}/${id}`);
  }
}
// Validate the actual generated transport, not only its full source catalog.
if (existsSync('public/data/map.json')) {
  const map: MapDataset = JSON.parse(readFileSync('public/data/map.json', 'utf8'));
  if (map.version !== dataset.version) errors.push('Map dataset version differs from source snapshot');
  for (const extended of [false, true]) for (const [from, to] of [[1995, Number(dataset.asOf.slice(0, 4))], [2005, 2014], [2020, Number(dataset.asOf.slice(0, 4))]]) {
    const filters = { from, to, extended, cumulative: false, minCount: 2 };
    const original = deriveGraph(dataset, filters), compact = deriveGraph(map, filters);
    if (JSON.stringify(original.nodes) !== JSON.stringify(compact.nodes) || JSON.stringify(original.edges) !== JSON.stringify(compact.edges)) errors.push(`Compact map changes source-backed graph: ${from}-${to}, extended=${extended}`);
  }
  for (const artist of dataset.artists) {
    const path = join('public/data/artists', `${artist.id}.json`);
    if (!existsSync(path)) { errors.push(`Missing artist chunk: ${artist.id}`); continue; }
    const detail: ArtistDetail = JSON.parse(readFileSync(path, 'utf8'));
    if (detail.version !== dataset.version || detail.artist?.id !== artist.id) errors.push(`Invalid artist chunk version/identity: ${artist.id}`);
  }
  for (const recording of dataset.recordings) {
    const path = join('public/data/recordings', `${recording.id}.json`);
    if (!existsSync(path)) { errors.push(`Missing recording chunk: ${recording.id}`); continue; }
    const detail: RecordingDetail = JSON.parse(readFileSync(path, 'utf8'));
    if (detail.version !== dataset.version || detail.recording?.id !== recording.id) errors.push(`Invalid recording chunk version/identity: ${recording.id}`);
  }
}
const eras = [[1995, 2004], [2005, 2009], [2010, 2014], [2015, 2019], [2020, 2026]];
const report = { checkedAt: new Date().toISOString(), stats: snapshot.stats, edgeCount: snapshot.edges.length, eraRecordings: eras.map(([from,to]) => ({ from,to,count:dataset.recordings.filter(r=>r.year>=from&&r.year<=to&&r.verification!=='pending').length })), errors, warnings: [...new Set(warnings)] };
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
if (process.argv.includes('--launch') && (snapshot.stats.coreArtists < 150 || report.eraRecordings.some(e => e.count === 0))) { console.error('Launch gate: at least150 core artists and every era must have sourced recordings.'); process.exitCode = 1; }
