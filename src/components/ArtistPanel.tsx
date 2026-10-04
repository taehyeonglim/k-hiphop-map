'use client';
import { useEffect, useId, useMemo, useState } from 'react';
import { ArrowRight, ChevronRight, ExternalLink, Info, Link2, X } from 'lucide-react';
import type { ArtistDetail, GraphSnapshot, MapArtist, MapDataset, MapFilters } from '@/lib/types';
import { correctionUrl, fetchArtistDetail } from '@/lib/detail-data';
import { performerIds } from '@/lib/graph';
import Portrait from './Portrait';
import RecordingList from './RecordingList';
import DetailStatus from './DetailStatus';
export { default as Portrait } from './Portrait';
export { fetchArtistDetail } from '@/lib/detail-data';

interface ArtistPanelProps {
  dataset: MapDataset; snapshot: GraphSnapshot; artist: MapArtist; filters: MapFilters;
  onSelectArtist: (id: string) => void; onSelectEdge: (id: string) => void; onClose: () => void; onFindPath: () => void;
}
const tabs = [['collaborators', '협업자'], ['recordings', '참여곡'], ['about', '정보']] as const;
export default function ArtistPanel({ dataset, snapshot, artist, filters, onSelectArtist, onSelectEdge, onClose, onFindPath }: ArtistPanelProps) {
  const id = useId();
  const [tab, setTab] = useState<typeof tabs[number][0]>('collaborators');
  const [showCredit, setShowCredit] = useState(false);
  const [detail, setDetail] = useState<ArtistDetail>();
  const [error, setError] = useState<Error>();
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setDetail(undefined); setError(undefined);
    fetchArtistDetail(artist.id, dataset.version, controller.signal).then(value => { if (!controller.signal.aborted) setDetail(value); }).catch(failure => { if (!controller.signal.aborted) setError(failure); });
    return () => controller.abort();
  }, [artist.id, dataset.version, retry]);
  const artists = useMemo(() => new Map(dataset.artists.map(entry => [entry.id, entry])), [dataset.artists]);
  const neighbors = useMemo(() => snapshot.edges.filter(edge => edge.source === artist.id || edge.target === artist.id).map(edge => ({ edge, artist: artists.get(edge.source === artist.id ? edge.target : edge.source)! })).filter(entry => entry.artist).sort((a, b) => b.edge.count - a.edge.count || a.artist.name.localeCompare(b.artist.name, 'ko')), [snapshot, artist.id, artists]);
  const [neighborLimit, setNeighborLimit] = useState(30);
  const recordingIds = useMemo(() => new Set(neighbors.flatMap(({ edge }) => edge.recordingIds)), [neighbors]);
  const recordings = useMemo(() => (detail?.recordings ?? []).filter(recording => recording.verification !== 'pending' && recording.year >= filters.from && recording.year <= filters.to && performerIds(recording).includes(artist.id)), [detail, filters.from, filters.to, artist.id]);
  const sourceArtist = detail?.artist;
  return <aside className="artist-panel" aria-label={`${artist.name} 상세 정보`}>
    <div className="panel-eyebrow"><span>ARTIST ARCHIVE</span><button className="icon-button panel-close" onClick={onClose} aria-label="아티스트 정보 닫기"><X size={20} /></button></div>
    <div className="artist-hero"><Portrait artist={artist} className="artist-main-portrait" /><div className="artist-identity"><span className="artist-name-en">{artist.nameEn}</span><h2>{artist.name}</h2><p>{artist.kind === 'group' ? '그룹' : artist.core ? '힙합 아티스트' : '협업 아티스트'}</p></div></div>
    <div className="artist-metrics"><div><strong>{neighbors.length}</strong><span>협업자</span></div><div><strong>{recordingIds.size}</strong><span>공동 작업곡</span></div><small>현재 지도 조건 기준</small></div>
    <div className="panel-expanded-content">
      <button className="path-start" onClick={onFindPath}><Link2 size={17} />다른 아티스트와 연결 찾기<ArrowRight size={16} /></button>
      <div className="panel-tabs" role="tablist" aria-label="아티스트 정보 종류">{tabs.map(([value, label], index) => <button key={value} id={`${id}-${value}`} role="tab" aria-selected={tab === value} aria-controls={`${id}-content`} tabIndex={tab === value ? 0 : -1} onClick={() => setTab(value)} onKeyDown={event => {
        const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
        if (next >= 0) { event.preventDefault(); setTab(tabs[next][0]); document.getElementById(`${id}-${tabs[next][0]}`)?.focus(); }
      }}>{label}</button>)}</div>
      <div className="panel-body" id={`${id}-content`} role="tabpanel" aria-labelledby={`${id}-${tab}`} tabIndex={0}>
        {tab === 'collaborators' ? <><div className="section-heading"><h3>함께 만든 음악</h3><span>{neighbors.length}명</span></div>
          {neighbors.length ? <ol className="neighbor-list">{neighbors.slice(0, neighborLimit).map(({ edge, artist: neighbor }, index) => <li key={edge.id}>
            <button className="neighbor-artist" onClick={() => onSelectArtist(neighbor.id)}><span className="neighbor-rank">{String(index + 1).padStart(2, '0')}</span><Portrait artist={neighbor} /><span className="neighbor-name"><strong>{neighbor.name}</strong><small>{neighbor.nameEn}</small></span></button>
            <button className="neighbor-count" onClick={() => onSelectEdge(edge.id)} aria-label={`${neighbor.name}와 공동 작업 ${edge.count}곡 보기`}>{edge.count}<small>곡</small><ChevronRight size={16} /></button>
          </li>)}</ol> : <p className="empty-copy">현재 수집 자료와 필터에서 확인된 협업이 없습니다. 기간이나 협업자 확장을 바꿔보세요.</p>}
          {neighbors.length > neighborLimit && <button className="load-more" onClick={() => setNeighborLimit(value => value + 30)}>협업자 더 보기</button>}
          <p className="panel-footnote">{filters.from}–{filters.to} · 현재 지도에 표시된 관계 기준</p>
        </> : !detail ? <DetailStatus error={error} onRetry={() => setRetry(value => value + 1)} /> : tab === 'recordings' ? <>
          <div className="section-heading"><h3>확인된 참여곡</h3><span>{recordings.length}곡</span></div><p className="panel-footnote">{filters.from}–{filters.to} · 솔로곡을 포함한 참여 기록입니다. 최소 공동곡 필터는 협업선에만 적용됩니다.</p>
          <RecordingList key={`${artist.id}-${filters.from}-${filters.to}`} dataset={{ artists: dataset.artists, releases: detail.releases }} recordings={recordings} />
        </> : <div className="artist-about"><p>{sourceArtist?.coverage.note}</p><dl><div><dt>자료 확인일</dt><dd>{sourceArtist?.coverage.checkedAt.slice(0, 10)}</dd></div><div><dt>수집한 녹음</dt><dd>{sourceArtist?.coverage.recordingCount}곡</dd></div><div><dt>검토 중</dt><dd>{sourceArtist?.coverage.pendingCount}건</dd></div><div><dt>다른 이름</dt><dd>{artist.aliases.join(', ') || '—'}</dd></div></dl>
          {!!detail.memberships.length && <><h3>그룹과 멤버</h3>{detail.memberships.map((membership, index) => { const related = artists.get(membership.groupId === artist.id ? membership.artistId : membership.groupId); return related ? <button className="membership-link" key={`${related.id}-${index}`} onClick={() => onSelectArtist(related.id)}>{related.name}<ArrowRight size={15} /></button> : null; })}<p>그룹 명의의 곡을 개인 멤버의 협업으로 자동 집계하지 않습니다.</p></>}
          <h3>자료 출처</h3><div className="artist-sources">{sourceArtist?.sources.map(source => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.provider}<ExternalLink size={15} /></a>)}</div>
        </div>}
      </div>
      {artist.image && <><button className="image-credit-button" onClick={() => setShowCredit(!showCredit)} aria-expanded={showCredit} aria-label="사진 출처 보기"><Info size={16} />사진 출처</button>{showCredit && <div className="image-credit"><p>{artist.image.author} · {artist.image.rights?.status === 'unconfirmed' ? <span>{artist.image.license}</span> : <a href={artist.image.licenseUrl} target="_blank" rel="noreferrer">{artist.image.license}</a>}</p><a href={artist.image.sourceUrl} target="_blank" rel="noreferrer">{artist.image.rights?.status === 'unconfirmed' ? '원본 출처 ↗' : '원본과 이용조건 ↗'}</a></div>}</>}
      <a className="artist-page-link" href={`/artists/${artist.id}/`}>전체 디스코그래피 · 아티스트 페이지<ArrowRight size={17} /></a>
      <a className="correction-link" href={correctionUrl(artist.id, dataset.version, typeof window === 'undefined' ? '' : window.location.href)} target="_blank" rel="noreferrer">이 아티스트의 데이터 수정 제안 ↗</a>
    </div>
  </aside>;
}
