'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import type { GraphEdge, MapDataset, Recording, Release } from '@/lib/types';
import { fetchArtistDetail, fetchRecordingDetail } from '@/lib/detail-data';
import Portrait from './Portrait';
import DetailStatus from './DetailStatus';
import RecordingList from './RecordingList';
export default function EdgePanel({ edge, dataset, onSelectArtist, onClose }: { edge: GraphEdge; dataset: MapDataset; onSelectArtist: (id: string) => void; onClose: () => void }) {
  const [details, setDetails] = useState<{ recordings: Recording[]; releases: Release[] }>();
  const [error, setError] = useState<Error>();
  const [retry, setRetry] = useState(0);
  const first = dataset.artists.find(artist => artist.id === edge.source)!;
  const second = dataset.artists.find(artist => artist.id === edge.target)!;
  useEffect(() => {
    const controller = new AbortController();
    setDetails(undefined); setError(undefined);
    const load = async () => {
      const detail = await fetchArtistDetail(edge.source, dataset.version, controller.signal);
      const byId = new Map(detail.recordings.map(recording => [recording.id, recording]));
      const recordings: Recording[] = [];
      // Avoid an unbounded request burst if a corrected catalog needs fallback chunks.
      for (const id of edge.recordingIds) recordings.push(byId.get(id) ?? await fetchRecordingDetail(id, dataset.version, controller.signal));
      if (!controller.signal.aborted) setDetails({ recordings, releases: detail.releases });
    };
    load().catch(failure => { if (!controller.signal.aborted) setError(failure); });
    return () => controller.abort();
  }, [edge, dataset.version, retry]);
  return <aside className="artist-panel edge-panel" aria-label="공동 작업곡 상세">
    <div className="panel-eyebrow"><button onClick={onClose}><ArrowLeft size={16} />돌아가기</button><button className="icon-button" onClick={onClose} aria-label="공동 작업곡 닫기"><X size={20} /></button></div>
    <div className="connection-hero"><div className="connection-portraits"><Portrait artist={first} /><span>×</span><Portrait artist={second} /></div><h2><button onClick={() => onSelectArtist(first.id)}>{first.name}</button><span>×</span><button onClick={() => onSelectArtist(second.id)}>{second.name}</button></h2><p>함께 만든 <strong>{edge.count}곡</strong> · {Math.min(...edge.years)}–{Math.max(...edge.years)}</p></div>
    <div className="panel-expanded-content"><div className="panel-body"><div className="section-heading"><h3>공동 작업곡</h3><span>{edge.count}곡</span></div>{details ? <RecordingList dataset={{ artists: dataset.artists, releases: details.releases }} recordings={details.recordings} /> : <DetailStatus error={error} onRetry={() => setRetry(value => value + 1)} />}</div><p className="panel-footnote">각 곡에서 출처와 참여 크레딧을 확인하세요.</p></div>
  </aside>;
}
