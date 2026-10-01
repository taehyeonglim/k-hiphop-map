'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronRight, ExternalLink, Info, LoaderCircle, RefreshCw, X } from 'lucide-react';
import type { Artist, Dataset, GraphSnapshot, Membership, Recording, Release } from '@/lib/types';
import RecordingList from './RecordingList';

interface ArtistPanelProps {
  dataset: Dataset;
  snapshot: GraphSnapshot;
  artist: Artist;
  onSelectArtist?: (id: string) => void;
  onSelectEdge?: (id: string) => void;
  onClose?: () => void;
  standalone?: boolean;
}

export interface ArtistDetail { artist: Artist; releases: Release[]; recordings: Recording[]; memberships: Membership[] }
const artistDetails = new Map<string, ArtistDetail>();

export async function fetchArtistDetail(id: string, version: string, signal?: AbortSignal): Promise<ArtistDetail> {
  const key = `${version}:${id}`;
  const cached = artistDetails.get(key);
  if (cached) return cached;
  const response = await fetch(`/data/artists/${encodeURIComponent(id)}.json`, { signal });
  if (!response.ok) throw new Error('아티스트 자료를 불러오지 못했습니다.');
  const detail = await response.json() as ArtistDetail;
  if (detail.artist?.id !== id || !Array.isArray(detail.recordings) || !Array.isArray(detail.releases)) throw new Error('아티스트 자료 형식을 확인할 수 없습니다.');
  artistDetails.set(key, detail);
  return detail;
}

function mergeEntries<T extends { id: string }>(base: T[], additions: T[]): T[] {
  return [...new Map([...base, ...additions].map((entry) => [entry.id, entry])).values()];
}

export function Portrait({ artist, className = '' }: { artist: Artist; className?: string }) {
  const [failed, setFailed] = useState(false);
  return <div className={`portrait ${className}`}>
    {artist.image && !failed ? <img src={artist.image.src} alt={artist.name} onError={() => setFailed(true)} /> : <span className="portrait-initial">{artist.name.slice(0, 2)}</span>}
    {artist.kind === 'group' && <span className="group-badge">GROUP</span>}
  </div>;
}

export default function ArtistPanel({ dataset: baseDataset, snapshot, artist: baseArtist, onSelectArtist, onSelectEdge, onClose, standalone = false }: ArtistPanelProps) {
  const [tab, setTab] = useState<'collaborators' | 'discography' | 'about'>('collaborators');
  const [showCredit, setShowCredit] = useState(false);
  const [detail, setDetail] = useState<ArtistDetail>();
  const [detailError, setDetailError] = useState(false);
  const [retry, setRetry] = useState(0);
  const needsDetail = !baseArtist.sources.length || !baseDataset.releases.length;
  const currentDetail = detail?.artist.id === baseArtist.id ? detail : undefined;
  const artist = currentDetail?.artist ?? baseArtist;
  const dataset = useMemo(() => currentDetail ? {
    ...baseDataset,
    artists: mergeEntries(baseDataset.artists, [currentDetail.artist]),
    releases: mergeEntries(baseDataset.releases, currentDetail.releases),
    recordings: mergeEntries(baseDataset.recordings, currentDetail.recordings),
    memberships: currentDetail.memberships,
  } : baseDataset, [baseDataset, currentDetail]);
  useEffect(() => {
    if (!needsDetail) return;
    const controller = new AbortController();
    setDetailError(false);
    fetchArtistDetail(baseArtist.id, baseDataset.version, controller.signal).then(setDetail).catch((error) => {
      if (error.name !== 'AbortError') setDetailError(true);
    });
    return () => controller.abort();
  }, [baseArtist.id, baseDataset.version, needsDetail, retry]);
  const node = snapshot.nodes.find((entry) => entry.id === artist.id);
  const recordingIds = new Set(snapshot.edges.filter((edge) => edge.source === artist.id || edge.target === artist.id).flatMap((edge) => edge.recordingIds));
  const recordings = dataset.recordings.filter((recording) => recording.verification !== 'pending' && recordingIds.has(recording.id));
  const allRecordings = dataset.recordings.filter((recording) => recording.verification !== 'pending' && recording.credits.some((credit) => credit.artistId === artist.id && ['main', 'featured', 'vocal', 'rap'].includes(credit.role) && credit.verification !== 'pending'));
  const confirmedRecordingIds = new Set(allRecordings.map((recording) => recording.id));
  const releases = dataset.releases.filter((release) => release.recordingIds.some((id) => confirmedRecordingIds.has(id)));
  const neighbors = useMemo(() => snapshot.edges.filter((edge) => edge.source === artist.id || edge.target === artist.id).map((edge) => ({ edge, artist: dataset.artists.find((candidate) => candidate.id === (edge.source === artist.id ? edge.target : edge.source))! })).filter((entry) => entry.artist).sort((a, b) => b.edge.count - a.edge.count || a.artist.name.localeCompare(b.artist.name, 'ko')), [snapshot, artist.id, dataset.artists]);
  const memberships = dataset.memberships.filter((membership) => membership.artistId === artist.id || membership.groupId === artist.id);
  return <aside className={`artist-panel ${standalone ? 'standalone-panel' : ''}`} aria-label={`${artist.name} 상세 정보`}>
    <div className="panel-eyebrow"><span>ARTIST INDEX <span className="tiny-dot" /></span>{onClose && <button className="icon-button panel-close" onClick={onClose} aria-label="아티스트 정보 닫기"><X size={17} /></button>}</div>
    <div className="artist-hero">
      <Portrait artist={artist} className="artist-main-portrait" />
      <div className="artist-identity"><span className="artist-name-en">{artist.nameEn}</span><h2>{artist.name}</h2><p>{artist.kind === 'group' ? '그룹' : artist.core ? '힙합 아티스트' : '협업 아티스트'}{artist.debutYear ? ` · ${artist.debutYear}년 기록부터` : ''}</p></div>
      {artist.image && <button className="image-credit-button" onClick={() => setShowCredit(!showCredit)} aria-expanded={showCredit} aria-label="사진 출처 보기"><Info size={13} /></button>}
    </div>
    {showCredit && artist.image && <div className="image-credit"><strong>사진 크레딧</strong><p>{artist.image.author} · <a href={artist.image.licenseUrl} target="_blank" rel="noreferrer">{artist.image.license}</a></p><a href={artist.image.sourceUrl} target="_blank" rel="noreferrer">원본과 이용조건 <ExternalLink size={11} /></a></div>}
    <div className="artist-metrics"><div><strong>{node?.degree ?? 0}</strong><span>협업 아티스트</span></div><div><strong>{recordings.length}</strong><span>공동 작업곡</span></div><div><strong>{artist.coverage.releaseCount}</strong><span>수집 발매작</span></div></div>
    <div className="panel-tabs" role="tablist" aria-label="아티스트 정보 종류">{([['collaborators', '협업자'], ['discography', '디스코그래피'], ['about', '정보']] as const).map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</div>
    <div className="panel-body" role="tabpanel">
      {needsDetail && !currentDetail && tab !== 'collaborators' ? <div className="detail-loading" role="status">{detailError ? <><p>자료를 불러오지 못했습니다.</p><button onClick={() => setRetry((value) => value + 1)}><RefreshCw size={13} />다시 불러오기</button></> : <><LoaderCircle className="spin" size={17} /><p>발매곡과 출처를 불러오는 중…</p></>}</div> : <>
      {tab === 'collaborators' && <><div className="section-heading"><h3>함께 만든 음악</h3><span>{neighbors.length} ARTISTS</span></div>{neighbors.length ? <ol className="neighbor-list">{neighbors.map(({ edge, artist: neighbor }, index) => <li key={edge.id}><button className="neighbor-artist" onClick={() => onSelectArtist?.(neighbor.id)}><span className="neighbor-rank">{String(index + 1).padStart(2, '0')}</span><Portrait artist={neighbor} /><span className="neighbor-name"><strong>{neighbor.name}</strong><small>{neighbor.nameEn}</small></span></button><button className="neighbor-count" onClick={() => onSelectEdge?.(edge.id)} aria-label={`${neighbor.name}와 공동 작업 ${edge.count}곡 보기`}>{edge.count}<small>곡</small><ChevronRight size={13} /></button></li>)}</ol> : <p className="empty-copy">선택한 기간에 확인된 협업이 없습니다. 기간이나 협업자 확장을 바꿔보세요.</p>}<div className="panel-footnote"><span className="tiny-dot" />현재 지도에 표시된 관계 기준</div></>}
      {tab === 'discography' && <><div className="section-heading"><h3>확인된 발매곡</h3><span>{allRecordings.length} TRACKS</span></div><RecordingList dataset={dataset} recordings={allRecordings} /><div className="section-heading release-heading"><h3>발매작</h3><span>{releases.length}</span></div><div className="release-list">{[...releases].sort((a,b) => b.year - a.year).map((release) => <a key={release.id} href={release.url ?? release.source.url} target="_blank" rel="noreferrer"><span>{release.year}</span><strong>{release.title}<small>{release.type.toUpperCase()}</small></strong><ExternalLink size={13} /></a>)}</div></>}
      {tab === 'about' && <div className="artist-about"><p>{artist.coverage.note}</p><dl><div><dt>자료 확인일</dt><dd>{artist.coverage.checkedAt.slice(0, 10)}</dd></div><div><dt>수집한 곡</dt><dd>{artist.coverage.recordingCount}곡</dd></div><div><dt>검토 중</dt><dd>{artist.coverage.pendingCount}건</dd></div>{artist.aliases.length > 0 && <div><dt>다른 이름</dt><dd>{artist.aliases.join(', ')}</dd></div>}</dl>{memberships.length > 0 && <><h3>{artist.kind === 'group' ? '그룹 멤버' : '참여 그룹'}</h3>{memberships.map((membership, index) => { const related = dataset.artists.find((entry) => entry.id === (artist.kind === 'group' ? membership.artistId : membership.groupId)); return related ? <button className="membership-link" key={`${related.id}-${index}`} onClick={() => onSelectArtist?.(related.id)}>{related.name}<small>{membership.startYear ?? ''}{membership.startYear || membership.endYear ? '–' : ''}{membership.endYear ?? ''}</small><ArrowRight size={13} /></button> : null; })}<p className="small-copy">그룹 명의의 곡은 개인 멤버의 협업으로 자동 집계하지 않습니다.</p></>}<h3>자료 출처</h3><div className="artist-sources">{artist.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>{source.provider}<ExternalLink size={12} /></a>)}</div></div>}
      </>}
    </div>
    {!standalone && <a className="artist-page-link" href={`/artists/${artist.id}/`}>아티스트 페이지 <ArrowRight size={15} /></a>}
  </aside>;
}
