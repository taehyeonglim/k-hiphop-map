'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ArrowRight, LoaderCircle, Play, RefreshCw } from 'lucide-react';
import type { Dataset, GraphSnapshot } from '@/lib/types';
import { markTrailerSeen, readTrailerVisit } from '@/lib/trailer';
import MapExplorer from './MapExplorer';
import CreatorCredit from './CreatorCredit';
import TrailerOverlay from './TrailerOverlay';

interface MapBootstrapProps { summary: GraphSnapshot }
interface LoadFailure { message: string; refresh: boolean }

function isDataset(value: unknown): value is Dataset {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<Dataset>;
  return typeof data.version === 'string' && typeof data.asOf === 'string'
    && Array.isArray(data.artists) && Array.isArray(data.recordings)
    && Array.isArray(data.releases) && Array.isArray(data.memberships) && Array.isArray(data.notes);
}

export default function MapBootstrap({ summary }: MapBootstrapProps) {
  const [dataset, setDataset] = useState<Dataset>();
  const [failure, setFailure] = useState<LoadFailure>();
  const [retry, setRetry] = useState(0);
  const [trailerState, setTrailerState] = useState<'pending' | 'open' | 'closed'>('pending');
  const currentDataset = dataset?.version === summary.version ? dataset : undefined;
  const lastYear = summary.asOf.slice(0, 4);
  const trailerOpen = trailerState === 'open';
  const closeTrailer = useCallback(() => { markTrailerSeen(); setTrailerState('closed'); }, []);
  const replayTrailer = useCallback(() => setTrailerState('open'), []);

  useLayoutEffect(() => {
    const visit = readTrailerVisit();
    document.documentElement.dataset.trailerVisit = visit;
    setTrailerState(visit === 'show' ? 'open' : 'closed');
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setFailure(undefined);
    const load = async () => {
      const response = await fetch(`/data/map.json?v=${encodeURIComponent(summary.version)}`, {
        signal: controller.signal,
        ...(retry > 0 ? { cache: 'reload' as const } : {}),
      });
      if (!response.ok) throw new Error('map-data-unavailable');
      const value: unknown = await response.json();
      if (controller.signal.aborted) return;
      if (!isDataset(value)) throw new Error('map-data-invalid');
      if (value.version !== summary.version) {
        setFailure({ message: '지도 자료가 갱신되었습니다. 페이지를 새로고침하면 최신 지도를 확인할 수 있습니다.', refresh: true });
        return;
      }
      setDataset(value);
    };
    load().catch(() => {
      if (!controller.signal.aborted) setFailure({ message: '연결 상태를 확인한 뒤 다시 불러와 주세요.', refresh: false });
    });
    return () => controller.abort();
  }, [summary.version, retry]);

  return <><div className="map-background" inert={trailerOpen}>
    {currentDataset ? <MapExplorer dataset={currentDataset} snapshot={summary} onReplayTrailer={replayTrailer} trailerOpen={trailerOpen} /> : <div className="map-bootstrap">
    <header className="masthead bootstrap-masthead">
      <a href="/" className="brand" aria-label="K-HIPHOP MAP 홈"><span className="brand-k">K—</span><span>HIPHOP<span className="brand-slash">/</span>MAP</span><span className="brand-period">1995<span>—</span>{lastYear}</span></a>
      <nav className="bootstrap-nav" aria-label="자료 안내"><a href="/methodology/">제작 원칙</a><a href="/credits/">이미지 크레딧</a></nav>
      <div className="masthead-utilities"><CreatorCredit /><button className="trailer-replay" data-trailer-replay onClick={replayTrailer} aria-label="트레일러 다시 보기"><Play size={13} aria-hidden="true" /><span>소개 다시 보기</span></button></div>
    </header>
    <main className="bootstrap-main" aria-busy={!failure}>
      <section className="bootstrap-copy" aria-labelledby="bootstrap-title">
        <div className="bootstrap-kicker"><span className="live-dot" /> CONNECTION ARCHIVE</div>
        <h1 id="bootstrap-title">음악이 만든 관계,<br /><span>연결의 기록.</span></h1>
        <p className="bootstrap-intro">가리온 세대부터 지금까지.<br />발매곡으로 읽는 한국 힙합의 소셜 네트워크.</p>
        <div className="bootstrap-scope"><span>1995 — {lastYear}</span><span>{summary.stats.coreArtists.toLocaleString()}개의 핵심 아티스트</span></div>
        {failure ? <div className="bootstrap-error" role="alert">
          <h2>지도를 불러오지 못했습니다.</h2><p>{failure.message}</p>
          <div className="bootstrap-actions"><button onClick={() => failure.refresh ? window.location.reload() : setRetry((value) => value + 1)}><RefreshCw size={15} />{failure.refresh ? '페이지 새로고침' : '다시 불러오기'}</button></div>
        </div> : <div className="bootstrap-loading" role="status" aria-live="polite"><LoaderCircle className="spin" size={18} aria-hidden="true" /><span>한국 힙합의 연결을 불러오는 중…</span></div>}
      </section>
      <div className="bootstrap-stamp" aria-hidden="true">THE SOUND<br />OF CONNECTION</div>
    </main>
    <footer className="bootstrap-footer"><span>발매곡의 크레딧에서 시작하는 연결.</span><a href="/methodology/">데이터와 시각화 원칙<ArrowRight size={13} /></a></footer>
  </div>}
  </div><TrailerOverlay open={trailerOpen} pending={trailerState === 'pending'} onClose={closeTrailer} /></>;
}
