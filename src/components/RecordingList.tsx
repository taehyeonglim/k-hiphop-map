'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Headphones, Music2 } from 'lucide-react';
import type { MapArtist, Recording, Release } from '@/lib/types';
interface RecordingListProps { dataset: { artists: MapArtist[]; releases: Release[] }; recordings: Recording[]; emptyMessage?: string; limit?: number }
export default function RecordingList({ dataset, recordings, emptyMessage = '선택한 조건에서 확인된 곡이 없습니다.', limit = 30 }: RecordingListProps) {
  const [shownCount, setShownCount] = useState(limit);
  const artists = useMemo(() => new Map(dataset.artists.map(artist => [artist.id, artist])), [dataset.artists]);
  const releases = useMemo(() => new Map(dataset.releases.map(release => [release.id, release])), [dataset.releases]);
  const ordered = useMemo(() => recordings.filter(recording => recording.verification !== 'pending').sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, 'ko')), [recordings]);
  if (!ordered.length) return <p className="empty-copy"><Music2 size={20} />{emptyMessage}</p>;
  return <><ol className="recording-list">{ordered.slice(0, shownCount).map(recording => {
    const release = recording.releaseIds.map(id => releases.get(id)).find(Boolean);
    const voices = recording.credits.filter(credit => ['main', 'featured', 'vocal', 'rap'].includes(credit.role) && credit.verification !== 'pending');
    return <li key={recording.id} className="recording-row"><span className="recording-year">{recording.year}</span><div className="recording-content">
      <div className="recording-title-line"><h4>{recording.title}</h4>{recording.listenUrl && <a className="listen-link" href={recording.listenUrl} target="_blank" rel="noreferrer" aria-label={`${recording.title} 듣기`}><Headphones size={18} /><span>듣기</span></a>}</div>
      <p className="recording-artists">{voices.map(credit => artists.get(credit.artistId)?.name ?? credit.artistId).join(' · ')}</p>
      {release && <p className="recording-release"><Link href={`/releases/${release.id}/`}>{release.title}</Link>{recording.kind === 'free' ? ' · 공식 공개곡' : ''}</p>}
      <details className="source-details"><summary>크레딧 근거 <span>{recording.sources.length}</span></summary><div>{recording.sources.map(source => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.provider}<ExternalLink size={14} /></a>)}</div></details>
    </div></li>;
  })}</ol>{shownCount < ordered.length && <button className="load-more" onClick={() => setShownCount(count => count + limit)}>{limit}곡 더 보기 <span>현재 {Math.min(shownCount, ordered.length)} / {ordered.length}곡</span></button>}</>;
}
