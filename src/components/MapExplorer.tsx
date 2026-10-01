'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, HelpCircle, Link2, List, LoaderCircle, Map as MapIcon, Pause, Play, RefreshCw, Search, Share2, SlidersHorizontal, Users, X } from 'lucide-react';
import type { Dataset, GraphEdge, GraphSnapshot, MapFilters, Recording, Release } from '@/lib/types';
import { deriveGraph, shortestPath } from '@/lib/graph';
import ArtistPanel, { fetchArtistDetail, Portrait } from './ArtistPanel';
import GraphCanvas from './GraphCanvas';
import RecordingList from './RecordingList';

interface MapExplorerProps { dataset: Dataset; snapshot: GraphSnapshot }
type PeriodMode = 'range' | 'cumulative' | 'year';

export default function MapExplorer({ dataset, snapshot }: MapExplorerProps) {
  const currentYear = new Date(dataset.asOf).getUTCFullYear();
  const lastYear = Number.isFinite(currentYear) ? currentYear : new Date().getFullYear();
  const [filters, setFilters] = useState<MapFilters>({ from: 1995, to: lastYear, cumulative: false, extended: false, minCount: 1 });
  const [mode, setMode] = useState<PeriodMode>('range');
  const [selectedArtist, setSelectedArtist] = useState<string | undefined>();
  const [selectedEdge, setSelectedEdge] = useState<string>();
  const [target, setTarget] = useState('');
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [listView, setListView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const legendDialog = useRef<HTMLElement>(null);
  const graph = useMemo(() => deriveGraph(dataset, filters), [dataset, filters.from, filters.to, filters.cumulative, filters.extended, filters.minCount]);
  const artistsById = useMemo(() => new Map(dataset.artists.map((artist) => [artist.id, artist])), [dataset.artists]);
  const visibleIds = useMemo(() => new Set(graph.nodes.map((node) => node.id)), [graph.nodes]);
  const rankedArtists = useMemo(() => [...graph.nodes].sort((a,b) => b.degree - a.degree || b.count - a.count).map((node) => ({ ...node, artist: artistsById.get(node.id)! })).filter((node) => node.artist), [graph.nodes, artistsById]);
  const searchResults = useMemo(() => {
    const query = search.toLocaleLowerCase().trim().replace(/\s/g, '');
    if (!query) return [];
    return dataset.artists.filter((artist) => [artist.name, artist.nameEn, ...artist.aliases].some((name) => name.toLocaleLowerCase().replace(/\s/g, '').includes(query))).sort((a,b) => Number(visibleIds.has(b.id)) - Number(visibleIds.has(a.id))).slice(0, 9);
  }, [search, dataset.artists, visibleIds]);
  const path = useMemo(() => selectedArtist && target ? shortestPath(graph, selectedArtist, target) : [], [graph, selectedArtist, target]);
  const artist = selectedArtist ? artistsById.get(selectedArtist) : undefined;
  const edge = selectedEdge ? graph.edges.find((entry) => entry.id === selectedEdge) : undefined;
  const yearlyCounts = useMemo(() => {
    const recordingsByYear = new Map<number, Recording[]>();
    for (const recording of dataset.recordings) {
      const recordings = recordingsByYear.get(recording.year) ?? [];
      recordings.push(recording);
      recordingsByYear.set(recording.year, recordings);
    }
    return Array.from({ length: lastYear - 1995 + 1 }, (_, index) => {
      const year = 1995 + index;
      // Reuse the map's eligibility and one-hop rules for each annual scope.
      const annualGraph = deriveGraph({ ...dataset, recordings: recordingsByYear.get(year) ?? [] }, {
        from: year, to: year, cumulative: false, extended: filters.extended, minCount: filters.minCount,
      });
      return { year, count: annualGraph.stats.collaborations };
    });
  }, [dataset, filters.extended, filters.minCount, lastYear]);
  const maxYearCount = Math.max(1, ...yearlyCounts.map((entry) => entry.count));

  useEffect(() => {
    const restore = () => {
      const query = new URLSearchParams(window.location.search);
      const clamp = (value: string | null, fallback: number) => value !== null && Number.isFinite(Number(value)) ? Math.min(lastYear, Math.max(1995, Math.round(Number(value)))) : fallback;
      const nextMode: PeriodMode = query.get('mode') === 'year' ? 'year' : query.get('mode') === 'cumulative' ? 'cumulative' : 'range';
      const nextTo = clamp(query.get('to'), lastYear);
      const nextFrom = nextMode === 'cumulative' ? 1995 : nextMode === 'year' ? nextTo : Math.min(nextTo, clamp(query.get('from'), 1995));
      const nextArtist = query.has('artist') ? (artistsById.has(query.get('artist') ?? '') ? query.get('artist')! : undefined) : undefined;
      const nextTarget = artistsById.has(query.get('target') ?? '') ? query.get('target')! : '';
      setFilters({ from: nextFrom, to: nextTo, cumulative: nextMode === 'cumulative', extended: query.get('extended') === '1', minCount: Math.min(20, Math.max(1, Number(query.get('min')) || 1)), artist: nextArtist });
      setMode(nextMode); setSelectedArtist(nextArtist); setTarget(nextTarget); setListView(query.get('view') === 'list'); setSelectedEdge(undefined);
      setHydrated(true);
    };
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [lastYear, artistsById]);

  useEffect(() => {
    if (!hydrated) return;
    const query = new URLSearchParams();
    if (filters.from !== 1995) query.set('from', String(filters.from));
    if (filters.to !== lastYear) query.set('to', String(filters.to));
    if (mode !== 'range') query.set('mode', mode);
    if (filters.minCount > 1) query.set('min', String(filters.minCount));
    if (filters.extended) query.set('extended', '1');
    if (selectedArtist) query.set('artist', selectedArtist); else query.set('artist', '');
    if (target) query.set('target', target);
    if (listView) query.set('view', 'list');
    const value = query.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${value ? `?${value}` : ''}`);
  }, [hydrated, filters.from, filters.to, filters.minCount, filters.extended, mode, selectedArtist, target, listView, lastYear]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setFilters((previous) => {
      if (previous.to >= lastYear) { setPlaying(false); return previous; }
      const to = previous.to + 1;
      return { ...previous, to, from: mode === 'year' ? to : mode === 'cumulative' ? 1995 : previous.from };
    }), 1300);
    return () => window.clearInterval(timer);
  }, [playing, mode, lastYear]);

  useEffect(() => {
    if (!showLegend) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const focusables = () => Array.from(legendDialog.current?.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]') ?? []);
    focusables()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowLegend(false);
      if (event.key !== 'Tab') return;
      const elements = focusables();
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); previousFocus?.focus(); };
  }, [showLegend]);

  const selectArtist = (id: string) => {
    setSelectedArtist(id); setSelectedEdge(undefined); setSearch(''); setSearchFocused(false); setMobileFilters(false);
    setFilters((previous) => ({ ...previous, artist: id, extended: previous.extended || !artistsById.get(id)?.core }));
  };
  const selectEdge = (id: string) => { setSelectedEdge(id); setMobileFilters(false); };
  const changeMode = (nextMode: PeriodMode) => {
    setMode(nextMode); setPlaying(false);
    setFilters((previous) => ({ ...previous, cumulative: nextMode === 'cumulative', from: nextMode === 'cumulative' ? 1995 : nextMode === 'year' ? previous.to : previous.from }));
  };
  const changeTo = (to: number) => {
    setPlaying(false); setFilters((previous) => ({ ...previous, to, from: mode === 'year' ? to : mode === 'cumulative' ? 1995 : Math.min(previous.from, to) }));
  };
  const togglePlaying = () => {
    if (!playing && filters.to >= lastYear) {
      setMode('cumulative'); setFilters((previous) => ({ ...previous, from: 1995, to: 1995, cumulative: true }));
    }
    setPlaying(!playing);
  };
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setShareMessage('현재 지도 링크를 복사했습니다'); }
    catch { setShareMessage('주소창의 URL로 현재 지도를 공유할 수 있습니다'); }
    window.setTimeout(() => setShareMessage(''), 3500);
  };

  return <div className="map-app">
    <header className="masthead">
      <a href="/map/" className="brand" aria-label="K-HIPHOP MAP 홈"><span className="brand-k">K—</span><span>HIPHOP<span className="brand-slash">/</span>MAP</span><span className="brand-period">1995<span>—</span>{lastYear}</span></a>
      <div className="masthead-description"><span>대한민국 힙합, 연결의 기록.</span><p>음악이 만든 관계를 탐험하다</p></div>
      <nav className="main-nav" aria-label="주 메뉴"><button onClick={() => setListView(false)} className={!listView ? 'active' : ''}>지도</button><button onClick={() => setListView(true)} className={listView ? 'active' : ''}>아티스트</button><a href="/methodology/">제작 원칙</a></nav>
      <button className="share-button" onClick={share} aria-label="지도 공유"><Share2 size={14} /><span>지도 공유</span></button>
    </header>

    <main className="map-main">
      <section className="map-workspace" aria-label="힙합 아티스트 협업 지도">
        <div className="graph-stage">
          {!listView ? <GraphCanvas dataset={dataset} snapshot={graph} filters={filters} selectedArtistId={selectedArtist} selectedEdgeId={selectedEdge} path={path} onSelectArtist={selectArtist} onSelectEdge={selectEdge} /> : <div className="artist-grid-view"><div className="grid-view-heading"><span>THE ARTIST INDEX</span><h1>연결을 만든 얼굴들<span>{graph.nodes.length}</span></h1><p>현재 기간과 필터에 해당하는 아티스트입니다. 얼굴을 눌러 협업을 탐험하세요.</p></div><div className="artist-grid">{rankedArtists.map(({ artist: entry, degree, count }) => <button key={entry.id} className={`artist-grid-card ${selectedArtist === entry.id ? 'selected' : ''}`} onClick={() => selectArtist(entry.id)}><Portrait artist={entry} /><strong>{entry.name}</strong><span>{entry.nameEn}</span><small>협업자 {degree} · {count}곡</small></button>)}</div>{!rankedArtists.length && <p className="empty-copy">이 조건에 해당하는 아티스트가 없습니다. 기간이나 필터를 바꿔보세요.</p>}</div>}
        </div>
        <div className={`discovery-panel ${mobileFilters ? 'mobile-open' : ''}`}>
          <div className="discovery-title"><span><span className="live-dot" /> CONNECTION ARCHIVE</span><button className="icon-button mobile-filter-close" aria-label="필터 닫기" onClick={() => setMobileFilters(false)}><X size={15} /></button></div>
          <h1>누가 누구와<br />음악을 만들었을까<span>?</span></h1>
          <p className="discovery-intro">발매곡으로 읽는<br />한국 힙합의 소셜 네트워크.</p>
          <div className="search-wrap"><Search size={17} /><input aria-label="아티스트 검색" placeholder="이름으로 연결 찾기" value={search} onFocus={() => setSearchFocused(true)} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && searchResults[0]) selectArtist(searchResults[0].id); if (event.key === 'Escape') { setSearch(''); setSearchFocused(false); } }} />{search && <button className="icon-button" aria-label="검색어 지우기" onClick={() => setSearch('')}><X size={13} /></button>}
            {searchFocused && search && <div className="search-results" role="region" aria-label="검색 결과">{searchResults.length ? searchResults.map((result) => <button key={result.id} onClick={() => selectArtist(result.id)}><Portrait artist={result} /><span><strong>{result.name}</strong><small>{result.nameEn}{!visibleIds.has(result.id) ? ' · 현재 조건 밖' : ''}</small></span><ArrowRight size={13} /></button>) : <p>일치하는 아티스트가 없습니다.</p>}</div>}
          </div>
          <div className="map-numbers"><div><strong>{graph.stats.artists.toLocaleString()}</strong><span>ARTISTS</span></div><div><strong>{graph.edges.length.toLocaleString()}</strong><span>CONNECTIONS</span></div></div>
          <div className="filter-heading"><SlidersHorizontal size={13} /><span>지도 설정</span><button onClick={() => {setFilters({from:1995,to:lastYear,cumulative:false,extended:false,minCount:1,artist:selectedArtist});setMode('range');setTarget('');setPlaying(false);}}>초기화</button></div>
          <div className="filter-block"><label htmlFor="minimum-tracks">최소 공동 작업곡</label><div className="filter-input-row"><input id="minimum-tracks" type="range" min="1" max="10" step="1" value={Math.min(filters.minCount,10)} onChange={(event) => setFilters((previous) => ({ ...previous, minCount: Number(event.target.value) }))} /><span>{filters.minCount}<small>곡</small></span></div></div>
          <label className="toggle-row" htmlFor="extend-artists"><span><strong>협업자 확장</strong><small>R&B · 아이돌 · 해외 아티스트</small></span><input id="extend-artists" type="checkbox" checked={filters.extended} onChange={(event) => setFilters((previous) => ({ ...previous, extended: event.target.checked }))} /><span className="toggle-track" aria-hidden="true" /></label>
          <details className="path-tools"><summary><Link2 size={14} /><span>두 아티스트의 연결 경로</span><ChevronDown size={13} /></summary><div className="path-tool-body"><p>{artist ? <><strong>{artist.name}</strong>에서 시작하는 협업 경로</> : '먼저 지도에서 아티스트를 선택하세요.'}</p><select aria-label="연결 경로 대상 아티스트" value={target} disabled={!selectedArtist} onChange={(event) => { setTarget(event.target.value); setFilters((previous) => ({ ...previous, target:event.target.value })); }}><option value="">어떤 아티스트까지?</option>{rankedArtists.filter((node) => node.id !== selectedArtist).sort((a,b) => a.artist.name.localeCompare(b.artist.name,'ko')).map((node) => <option key={node.id} value={node.id}>{node.artist.name}</option>)}</select>{target && <div className="path-result" aria-live="polite">{path.length ? <><strong>{path.length - 1}단계로 연결</strong><div>{path.map((id, index) => <span key={id}>{index > 0 && <ArrowRight size={10} />}<button onClick={() => selectArtist(id)}>{artistsById.get(id)?.name}</button></span>)}</div><small>각 연결선을 눌러 근거 곡을 확인하세요.</small></> : <p>현재 조건에서 연결 경로가 없습니다.</p>}</div>}</div></details>
          <button className="legend-trigger" onClick={() => setShowLegend(true)}><HelpCircle size={14} />지도는 어떻게 읽나요?<ArrowRight size={13} /></button>
        </div>
        <div className="canvas-topline"><span>THE SOUND OF CONNECTION</span><div className="view-switch" aria-label="보기 방식"><button aria-label="지도 보기" aria-pressed={!listView} className={!listView ? 'active' : ''} onClick={() => setListView(false)}><MapIcon size={14} /></button><button aria-label="목록 보기" aria-pressed={listView} className={listView ? 'active' : ''} onClick={() => setListView(true)}><List size={15} /></button></div></div>
        <button className="mobile-filter-toggle" onClick={() => setMobileFilters(!mobileFilters)} aria-expanded={mobileFilters}><Search size={15} />검색 · 필터<SlidersHorizontal size={14} /></button>
        <div className="map-caption"><div className="legend-node" /><span>협업자 수가 많을수록 큰 노드</span><span className="caption-separator" /><span className="legend-edge" /><span>공동곡이 많을수록 굵은 선</span><button aria-label="지도 범례 보기" onClick={() => setShowLegend(true)}><HelpCircle size={13} /></button></div>
      </section>
      <div className={`detail-panel-wrap ${(artist || edge) ? 'has-selection' : ''}`}>
        {edge ? <EdgePanel edge={edge} dataset={dataset} onSelectArtist={selectArtist} onClose={() => setSelectedEdge(undefined)} /> : artist ? <ArtistPanel key={artist.id} dataset={dataset} snapshot={graph} artist={artist} onSelectArtist={selectArtist} onSelectEdge={selectEdge} onClose={() => { setSelectedArtist(undefined); setSelectedEdge(undefined); }} /> : <aside className="explore-empty-panel"><span>FIND YOUR CONNECTION</span><h2>하나의 곡에서,<br />하나의 장면으로.</h2><p>지도에서 얼굴을 선택하세요.<br />함께 만든 곡과 아티스트를<br />만날 수 있습니다.</p><div className="empty-portrait-stack">{rankedArtists.filter(({artist:entry}) => Boolean(entry.image)).slice(0,3).map(({artist:entry}) => <button key={entry.id} onClick={() => selectArtist(entry.id)} aria-label={`${entry.name} 살펴보기`}><Portrait artist={entry} /></button>)}</div><button className="empty-start-button" onClick={() => rankedArtists[0] && selectArtist(rankedArtists[0].id)}>연결 탐험 시작<ArrowRight size={16} /></button></aside>}
      </div>
    </main>

    <footer className="timeline">
      <div className="timeline-heading"><div><span>TIME TRAVEL</span><strong>{mode === 'year' ? filters.to : `${filters.from} — ${filters.to}`}</strong></div><button className={`play-button ${playing ? 'playing' : ''}`} onClick={togglePlaying} aria-label={playing ? '연도 재생 일시정지' : '연도별 변화 재생'}>{playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</button></div>
      <div className="timeline-track"><div className="timeline-bars" aria-hidden="true">{yearlyCounts.map(({ year, count }) => <span key={year} className={year >= filters.from && year <= filters.to ? 'in-range' : ''} style={{ height:`${4 + (count / maxYearCount) * 33}px` }} title={`${year}: ${count}곡`} />)}</div><div className="timeline-slider"><div className="timeline-range-fill" style={{left:`${((filters.from - 1995) / (lastYear - 1995)) * 100}%`,right:`${100 - ((filters.to - 1995) / (lastYear - 1995)) * 100}%`}} />{mode === 'range' && <input aria-label="시작 연도" className="range-start" type="range" min="1995" max={lastYear} value={filters.from} onChange={(event) => { setPlaying(false); setFilters((previous) => ({ ...previous, from: Math.min(Number(event.target.value), previous.to) })); }} />}<input aria-label="끝 연도" className="range-end" type="range" min="1995" max={lastYear} value={filters.to} onChange={(event) => changeTo(Number(event.target.value))} /></div><div className="timeline-year-labels"><span>1995</span><span>2000</span><span>2005</span><span>2010</span><span>2015</span><span>2020</span><span>{lastYear}</span></div></div>
      <div className="timeline-mode"><div className="mode-switch">{([['range','기간'],['cumulative','누적'],['year','한 해']] as const).map(([value,label]) => <button key={value} aria-pressed={mode === value} className={mode === value ? 'active' : ''} onClick={() => changeMode(value)}>{label}</button>)}</div><div className="year-fields">{mode === 'range' && <><input aria-label="시작 연도 직접 입력" type="number" min="1995" max={filters.to} value={filters.from} onChange={(event) => setFilters((previous) => ({...previous,from: Math.max(1995,Math.min(previous.to,Number(event.target.value)||1995))}))} /><span>—</span></>}<input aria-label="끝 연도 직접 입력" type="number" min="1995" max={lastYear} value={filters.to} onChange={(event) => changeTo(Math.max(1995,Math.min(lastYear,Number(event.target.value)||1995)))} /></div></div>
    </footer>
    <div className="site-bottomline"><span><span className="live-dot" />자료 확인 {dataset.asOf.slice(0,10)}<span className="bottomline-separator">/</span>수집된 기록 기준</span><span>{graph.stats.recordings.toLocaleString()} TRACKS<span className="bottomline-separator">/</span><a href="/credits/">데이터 · 사진 출처<ArrowRight size={10} /></a></span></div>
    {shareMessage && <div className="share-toast" role="status"><Check size={16} />{shareMessage}</div>}
    {showLegend && <div className="modal-backdrop" onClick={() => setShowLegend(false)}><section ref={legendDialog} className="legend-dialog" role="dialog" aria-modal="true" aria-labelledby="legend-title" onClick={(event) => event.stopPropagation()}><div className="dialog-eyebrow"><span>HOW TO READ THE MAP</span><button className="icon-button" onClick={() => setShowLegend(false)} aria-label="범례 닫기"><X size={20} /></button></div><h2 id="legend-title">연결을 읽는 방법.</h2><div className="legend-explainer"><div><div className="legend-demo-nodes"><span /><span /><span /></div><h3>얼굴은 아티스트</h3><p>노드가 클수록 선택 기간에 함께한 아티스트가 많습니다. 그룹은 별도 노드로 표시합니다.</p></div><div><div className="legend-demo-edges"><span /><span /><span /></div><h3>선은 함께 만든 곡</h3><p>같은 녹음에 랩·가창으로 참여하면 연결됩니다. 곡이 많을수록 선이 굵어지며, 재발매된 같은 곡은 한 번만 셉니다.</p></div><div><div className="legend-demo-community"><span /><span /><span /></div><h3>색은 협업 군집</h3><p>협업 구조를 바탕으로 묶은 커뮤니티입니다. 실제 레이블이나 크루를 뜻하지 않습니다.</p></div><div><Users size={29} /><h3>가까움은 관계의 구조</h3><p>협업 가중치로 배치한 거리입니다. 친분이나 음악적 유사성의 수치는 아닙니다. 기간을 바꿔도 기본 위치는 유지됩니다.</p></div></div><a href="/methodology/" className="dialog-methodology">데이터와 알고리즘 자세히 보기<ArrowRight size={15} /></a></section></div>}
  </div>;
}

function EdgePanel({ edge, dataset, onSelectArtist, onClose }: { edge: GraphEdge; dataset: Dataset; onSelectArtist: (id:string) => void; onClose: () => void }) {
  const [details, setDetails] = useState<{ edgeId: string; recordings: Recording[]; releases: Release[] }>();
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const first = dataset.artists.find((artist) => artist.id === edge.source)!;
  const second = dataset.artists.find((artist) => artist.id === edge.target)!;
  const baseRecordings = dataset.recordings.filter((recording) => edge.recordingIds.includes(recording.id));
  const needsDetail = baseRecordings.some((recording) => !recording.sources.length);
  const currentDetails = details?.edgeId === edge.id ? details : undefined;
  const recordings = currentDetails?.recordings ?? baseRecordings;
  const detailDataset = currentDetails ? { ...dataset, releases: currentDetails.releases } : dataset;
  useEffect(() => {
    if (!needsDetail) return;
    const controller = new AbortController();
    setError(false);
    const load = async () => {
      const artistDetail = await fetchArtistDetail(edge.source, dataset.version, controller.signal);
      const byId = new globalThis.Map(artistDetail.recordings.map((recording) => [recording.id, recording]));
      const loaded = await Promise.all(edge.recordingIds.map(async (id) => {
        const cached = byId.get(id);
        if (cached) return cached;
        const response = await fetch(`/data/recordings/${encodeURIComponent(id)}.json`, { signal: controller.signal });
        if (!response.ok) throw new Error('공동 작업곡 자료를 불러오지 못했습니다.');
        const recording = await response.json() as Recording;
        if (recording.id !== id || !Array.isArray(recording.sources)) throw new Error('공동 작업곡 자료 형식을 확인할 수 없습니다.');
        return recording;
      }));
      setDetails({ edgeId: edge.id, recordings: loaded, releases: artistDetail.releases });
    };
    load().catch((failure) => { if (failure.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, [edge.id, edge.source, dataset.version, needsDetail, retry]);
  return <aside className="artist-panel edge-panel" aria-label="공동 작업곡 상세"><div className="panel-eyebrow"><span>THE CONNECTION</span><button className="icon-button" onClick={onClose} aria-label="공동 작업곡 닫기"><X size={17} /></button></div><div className="connection-hero"><div className="connection-portraits"><button aria-label={`${first.name} 살펴보기`} onClick={() => onSelectArtist(first.id)}><Portrait artist={first} /></button><span>×</span><button aria-label={`${second.name} 살펴보기`} onClick={() => onSelectArtist(second.id)}><Portrait artist={second} /></button></div><h2><button onClick={() => onSelectArtist(first.id)}>{first.name}</button><span>×</span><button onClick={() => onSelectArtist(second.id)}>{second.name}</button></h2><p>함께 만든 <strong>{edge.count}곡</strong>의 기록</p></div><div className="connection-period"><span>FIRST CONNECTION</span><strong>{Math.min(...edge.years)}</strong><ArrowRight size={15} /><strong>{Math.max(...edge.years)}</strong></div><div className="panel-body"><div className="section-heading"><h3>공동 작업곡</h3><span>{edge.count} TRACKS</span></div>{needsDetail && !currentDetails ? <div className="detail-loading" role="status">{error ? <><p>자료를 불러오지 못했습니다.</p><button onClick={() => setRetry((value) => value + 1)}><RefreshCw size={13} />다시 불러오기</button></> : <><LoaderCircle className="spin" size={17} /><p>공동 작업곡과 출처를 불러오는 중…</p></>}</div> : <RecordingList dataset={detailDataset} recordings={recordings} />}</div><div className="edge-panel-note"><Check size={13} /><span>각 곡에서 출처와 참여 크레딧을 확인하세요.</span></div></aside>;
}
