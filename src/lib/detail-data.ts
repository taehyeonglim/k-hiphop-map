import type { ArtistDetail, RecordingDetail } from './types';
export class DatasetChangedError extends Error {
  constructor() { super('지도 자료가 갱신되었습니다. 페이지를 새로고침해 주세요.'); this.name = 'DatasetChangedError'; }
}
const artists = new Map<string, ArtistDetail>();
const recordings = new Map<string, RecordingDetail>();
function ensureVersion(value: { version?: string }, expected: string) {
  if (value.version !== expected) throw new DatasetChangedError();
}
async function download(path: string, version: string, signal?: AbortSignal) {
  const response = await fetch(`${path}?v=${encodeURIComponent(version)}`, { signal, cache: 'no-cache' });
  if (!response.ok) throw new Error('자료를 불러오지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.');
  const value: unknown = await response.json();
  if (!value || typeof value !== 'object') throw new Error('자료 형식을 확인할 수 없습니다.');
  ensureVersion(value, version);
  return value;
}
function remember<T>(cache: Map<string, T>, key: string, value: T) {
  if (cache.size >= 40) cache.delete(cache.keys().next().value!);
  cache.set(key, value);
}
export async function fetchArtistDetail(id: string, version: string, signal?: AbortSignal): Promise<ArtistDetail> {
  const key = `${version}:${id}`;
  if (artists.has(key)) return artists.get(key)!;
  const detail = await download(`/data/artists/${encodeURIComponent(id)}.json`, version, signal) as ArtistDetail;
  if (detail.artist?.id !== id || !Array.isArray(detail.recordings) || !Array.isArray(detail.releases) || !Array.isArray(detail.memberships)) throw new Error('아티스트 자료 형식을 확인할 수 없습니다.');
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  remember(artists, key, detail);
  return detail;
}
export async function fetchRecordingDetail(id: string, version: string, signal?: AbortSignal) {
  const key = `${version}:${id}`;
  if (recordings.has(key)) return recordings.get(key)!.recording;
  const detail = await download(`/data/recordings/${encodeURIComponent(id)}.json`, version, signal) as RecordingDetail;
  if (detail.recording?.id !== id || !Array.isArray(detail.recording.sources)) throw new Error('녹음 자료 형식을 확인할 수 없습니다.');
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  remember(recordings, key, detail);
  return detail.recording;
}
export function correctionUrl(artistId: string, version: string, mapUrl: string) {
  const params = new URLSearchParams({ template: 'data-correction.yml', artist: artistId, version, map: mapUrl });
  return `https://github.com/taehyeonglim/k-hiphop-map/issues/new?${params}`;
}
