'use client';

import { ExternalLink, Headphones, Music2 } from 'lucide-react';
import type { Dataset, Recording } from '@/lib/types';

interface RecordingListProps {
  dataset: Dataset;
  recordings: Recording[];
  emptyMessage?: string;
  limit?: number;
}

export default function RecordingList({ dataset, recordings, emptyMessage = '선택한 기간에 확인된 곡이 없습니다.', limit }: RecordingListProps) {
  const artists = new Map(dataset.artists.map((artist) => [artist.id, artist]));
  const releases = new Map(dataset.releases.map((release) => [release.id, release]));
  const ordered = recordings.filter((recording) => recording.verification !== 'pending').sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, 'ko'));
  const shown = limit ? ordered.slice(0, limit) : ordered;
  if (!shown.length) return <p className="empty-copy"><Music2 size={20} />{emptyMessage}</p>;
  return <ol className="recording-list">
    {shown.map((recording) => {
      const release = recording.releaseIds.map((id) => releases.get(id)).find(Boolean);
      const voices = recording.credits.filter((credit) => ['main', 'featured', 'vocal', 'rap'].includes(credit.role) && credit.verification !== 'pending');
      return <li key={recording.id} className="recording-row">
        <span className="recording-year">{recording.year}</span>
        <div className="recording-content">
          <div className="recording-title-line"><h4>{recording.title}</h4>{recording.listenUrl && <a className="listen-link" href={recording.listenUrl} target="_blank" rel="noreferrer" aria-label={`${recording.title} 듣기`} title="음악 서비스에서 듣기"><Headphones size={15} /></a>}</div>
          <p className="recording-artists">{voices.map((credit) => artists.get(credit.artistId)?.name ?? credit.artistId).join(' · ')}</p>
          {release && <p className="recording-release">{release.title}{recording.kind === 'free' ? ' · 공식 공개곡' : ''}</p>}
          <details className="source-details"><summary>크레딧 근거 <span>{recording.sources.length}</span></summary><div>{recording.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.provider}<ExternalLink size={11} /></a>)}</div></details>
        </div>
      </li>;
    })}
    {limit && ordered.length > limit && <li className="list-more">외 {ordered.length - limit}곡 · 아티스트 페이지에서 전체 보기</li>}
  </ol>;
}
