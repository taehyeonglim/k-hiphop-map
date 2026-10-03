'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronUp, HelpCircle, Link2, List, Map as MapIcon, Play, Share2, SlidersHorizontal, X } from 'lucide-react';
import type { GraphSnapshot, MapDataset, MapRecording } from '@/lib/types';
import { deriveGraph, edgeId, shortestPath } from '@/lib/graph';
import { visibleNeighborhoodIds, visibleNeighborhoodEdgeIds } from '@/lib/graph-view';
import { lastDatasetYear, type MapState } from '@/lib/map-state';
import { useMapState } from '@/hooks/useMapState';
import ArtistPanel from './ArtistPanel';
import Portrait from './Portrait';
import ArtistSearch from './ArtistSearch';
import EdgePanel from './EdgePanel';
import GraphCanvas from './GraphCanvas';
import CreatorCredit from './CreatorCredit';
import VisitorCounter from './VisitorCounter';
import MapFilters from './MapFilters';
import Timeline from './Timeline';
import Modal from './Modal';

interface MapExplorerProps { dataset: MapDataset; snapshot: GraphSnapshot; onReplayTrailer?: () => void; trailerOpen?: boolean }
export default function MapExplorer({ dataset, onReplayTrailer, trailerOpen = false }: MapExplorerProps) {
  const lastYear = lastDatasetYear(dataset.asOf);
  const [state, update] = useMapState(dataset);
  const [selectedEdge, setSelectedEdge] = useState<string>();
  const [playing, setPlaying] = useState(false);
  const [modal, setModal] = useState<'filters' | 'legend' | 'path'>();
  const modalTrigger = useRef<HTMLElement | null>(null);
  const openModal = (value: 'filters' | 'legend' | 'path') => { modalTrigger.current = document.activeElement as HTMLElement; setModal(value); };
  const [expanded, setExpanded] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [listLimit, setListLimit] = useState(30);
  const graph = useMemo(() => deriveGraph(dataset, state), [dataset, state.from, state.to, state.extended, state.minCount, state.cumulative]);
  const artists = useMemo(() => new Map(dataset.artists.map(artist => [artist.id, artist])), [dataset.artists]);
  const visibleIds = useMemo(() => new Set(graph.nodes.map(node => node.id)), [graph]);
  const path = useMemo(() => state.artist && state.target ? shortestPath(graph, state.artist, state.target) : [], [graph, state.artist, state.target]);
  const focusedIds = useMemo(() => visibleNeighborhoodIds(graph, state.artist, path), [graph, state.artist, path]);
  const focusedEdges = useMemo(() => visibleNeighborhoodEdgeIds(graph, state.artist, path), [graph, state.artist, path]);
  const rankedArtists = useMemo(() => [...graph.nodes].filter(node => focusedIds.has(node.id)).sort((a, b) => b.degree - a.degree || b.count - a.count || a.id.localeCompare(b.id)).map(node => ({ ...node, artist: artists.get(node.id)! })), [graph, focusedIds, artists]);
  const artist = state.artist ? artists.get(state.artist) : undefined;
  const edge = graph.edges.find(entry => entry.id === selectedEdge);
  const listView = state.view === 'list';
  const byYear = useMemo(() => {
    const index = new Map<number, MapRecording[]>();
    for (const recording of dataset.recordings) { const bucket = index.get(recording.year) ?? []; bucket.push(recording); index.set(recording.year, bucket); }
    return index;
  }, [dataset]);
  const yearlyCounts = useMemo(() => Array.from({ length: lastYear - 1995 + 1 }, (_, index) => {
    const year = 1995 + index;
    return { year, count: deriveGraph({ ...dataset, recordings: byYear.get(year) ?? [] }, { from: year, to: year, extended: state.extended, minCount: state.minCount, cumulative: false }).stats.collaborations };
  }), [dataset, byYear, lastYear, state.extended, state.minCount]);
  useEffect(() => { setSelectedEdge(undefined); setPlaying(false); }, [state.artist, state.target]);
  useEffect(() => { const restore = () => { setSelectedEdge(undefined); setPlaying(false); setModal(undefined); }; window.addEventListener('popstate', restore); return () => window.removeEventListener('popstate', restore); }, []);
  useEffect(() => { setListLimit(30); }, [state.view, state.artist, state.target, state.from, state.to, state.minCount, state.extended]);
  useEffect(() => {
    if (!playing) return;
    if (state.to >= lastYear) { setPlaying(false); return; }
    const timer = window.setTimeout(() => update({ type: 'change', patch: { to: state.to + 1 } }), 1300);
    return () => window.clearTimeout(timer);
  }, [playing, state.to, lastYear, update]);
  useEffect(() => { if (trailerOpen) { setPlaying(false); setModal(undefined); } }, [trailerOpen]);
  useEffect(() => { if (!shareMessage) return; const timer = window.setTimeout(() => setShareMessage(''), 5000); return () => window.clearTimeout(timer); }, [shareMessage]);
  const changeFilters = (patch: Partial<MapState>) => { setPlaying(false); setSelectedEdge(undefined); update({ type: 'change', patch }); };
  const selectArtist = (id: string) => {
    setSelectedEdge(undefined); setModal(undefined); setExpanded(false);
    update({ type: 'change', patch: { artist: id, target: undefined, extended: state.extended || !artists.get(id)?.core } }, 'push');
  };
  const clearSelection = () => { setSelectedEdge(undefined); setExpanded(false); update({ type: 'clear-selection' }, 'push'); };
  const selectEdge = (id: string) => { setSelectedEdge(id); setExpanded(true); setModal(undefined); };
  const openFilters = () => { setExpanded(false); setPlaying(false); openModal('filters'); };
  const resetFilters = () => { setPlaying(false); setSelectedEdge(undefined); update({ type: 'reset-filters' }); };
  const share = async () => {
    const url = new URL(window.location.href); url.pathname = '/';
    try {
      if (window.matchMedia('(max-width: 767px)').matches && navigator.share) await navigator.share({ title: '한국힙합지도', url: url.href });
      else { await navigator.clipboard.writeText(url.href); setShareMessage('현재 지도 링크를 복사했습니다'); }
    } catch (error) { if ((error as Error).name !== 'AbortError') setShareMessage('주소창의 URL로 현재 지도를 공유할 수 있습니다'); }
  };
  const filters = <MapFilters state={state} lastYear={lastYear} onChange={changeFilters} onReset={resetFilters} />;
  const togglePlaying = () => { if (!playing && state.to >= lastYear) update({ type: 'change', patch: { mode: 'cumulative', from: 1995, to: 1995 } }); setPlaying(!playing); };
  const showAllYears = () => changeFilters({ from: 1995, to: lastYear, mode: 'range' });

  return <><div className="map-app" inert={Boolean(modal)}>
    <a className="skip-link" href="#artist-search-area">아티스트 검색으로 건너뛰기</a>
    <header className="masthead"><a href="/" className="brand" aria-label="K-HIPHOP MAP 홈"><span className="brand-k">K—</span><span>HIPHOP<span className="brand-slash">/</span>MAP</span><span className="brand-period">1995<span>—</span>{lastYear}</span></a>
      <p className="masthead-description">대한민국 힙합,<br />연결의 기록.</p>
      <nav className="main-nav" aria-label="주 메뉴"><a href="/methodology/">제작 원칙</a>{onReplayTrailer && <button className="trailer-replay" data-trailer-replay aria-label="30초 소개 영상" onClick={() => { setPlaying(false); onReplayTrailer(); }}><Play size={17} />30초 소개</button>}<button className="share-button" onClick={share} aria-label="지도 공유"><Share2 size={18} /><span>공유</span></button></nav>
    </header>
    <main className={`map-main ${artist || edge ? 'with-detail' : ''} ${expanded ? 'detail-expanded' : ''}`}>
      <section className="discovery-panel" aria-label="아티스트 찾기"><div className="discovery-heading"><span className="eyebrow">CONNECTION ARCHIVE</span><h1>누가 누구와<br />음악을 만들었을까<span>?</span></h1><p>이름 검색 → 협업자 선택 →<br />함께 만든 곡 확인</p></div>
        <div id="artist-search-area" tabIndex={-1}><ArtistSearch artists={dataset.artists} visibleIds={visibleIds} onSelect={selectArtist} /></div>
        <div className="search-actions"><button className="mobile-filter-toggle" aria-haspopup="dialog" aria-expanded={modal === 'filters'} onClick={openFilters}><SlidersHorizontal size={17} />필터 · 기간</button><div className="view-switch" aria-label="보기 방식"><button aria-label="지도 보기" aria-pressed={!listView} onClick={() => update({ type: 'change', patch: { view: 'map' } }, 'push')}><MapIcon size={17} />지도</button><button aria-label="목록 보기" aria-pressed={listView} onClick={() => update({ type: 'change', patch: { view: 'list' } }, 'push')}><List size={18} />목록</button></div></div>
        <p className="filter-summary">{state.from}–{state.to} · {state.minCount}곡 이상 · {state.extended ? '협업자 포함' : '핵심 아티스트'}</p>
        <div className="desktop-discovery"><div className="map-numbers"><div><strong>{focusedIds.size.toLocaleString()}</strong><span>아티스트</span></div><div><strong>{focusedEdges.size.toLocaleString()}</strong><span>협업 관계</span></div></div>{filters}
          {!artist && <div className="starter-artists"><h2>이 아티스트부터 시작해 보세요</h2>{['garion', 'verbal-jint', 'lee-young-ji'].filter(id => artists.has(id)).map(id => <button key={id} onClick={() => selectArtist(id)}>{artists.get(id)!.name}<ArrowRight size={16} /></button>)}</div>}
          <button className="path-trigger" onClick={() => openModal('path')}><Link2 size={17} />두 아티스트의 연결 경로</button>
          <button className="legend-trigger" onClick={() => openModal('legend')}><HelpCircle size={17} />지도는 어떻게 읽나요?</button>
        </div>
      </section>
      <section className="map-workspace" aria-label="힙합 아티스트 협업 지도">
        {artist && <div className="network-focus" role="region" aria-label="선택한 협업 네트워크"><div><strong>{path.length ? '연결 경로' : artist.name}</strong><span>{path.length ? `${path.length - 1}단계 · ${focusedIds.size}명` : `직접 협업자 ${Math.max(0, focusedIds.size - (focusedIds.has(artist.id) ? 1 : 0))}명`}</span></div><button onClick={clearSelection}>전체 네트워크 보기<X size={16} /></button></div>}
        {artist && !visibleIds.has(artist.id) && <div className="outside-period" role="status">현재 조건에 참여 기록이 없습니다.{!artist.core && !state.extended && <button onClick={() => changeFilters({ extended: true })}>협업자 포함해 보기</button>}<button onClick={showAllYears}>전체 기간으로 보기</button><button onClick={resetFilters}>필터 초기화</button></div>}
        <div className="graph-stage">{!listView ? <GraphCanvas dataset={dataset} snapshot={graph} filters={state} selectedArtistId={state.artist} selectedEdgeId={selectedEdge} path={path} onSelectArtist={selectArtist} onSelectEdge={selectEdge} onClearSelection={clearSelection} onListView={() => update({ type: 'change', patch: { view: 'list' } }, 'push')} /> : <div className="artist-grid-view"><div className="grid-view-heading"><span className="eyebrow">THE ARTIST INDEX</span><h2>연결을 만든 얼굴들 <span>{rankedArtists.length}</span></h2><p>{artist ? '선택한 아티스트의 협업 관계를 살펴보세요.' : '현재 기간과 필터에 해당하는 아티스트입니다.'}</p></div><div className="artist-grid">{rankedArtists.slice(0, listLimit).map(({ artist: entry, degree, count }) => <button key={entry.id} className="artist-grid-card" onClick={() => selectArtist(entry.id)}><Portrait artist={entry} /><strong>{entry.name}</strong><span>{entry.nameEn}</span><small>협업자 {degree} · {count}곡</small></button>)}</div>{rankedArtists.length > listLimit && <button className="load-more" onClick={() => setListLimit(count => count + 30)}>아티스트 더 보기</button>}{!rankedArtists.length && <div className="empty-copy">이 조건에 해당하는 아티스트가 없습니다.<button onClick={resetFilters}>필터 초기화</button></div>}</div>}</div>
        {!artist && <div className="mobile-starters">{['garion', 'verbal-jint', 'lee-young-ji'].filter(id => artists.has(id)).map(id => <button key={id} onClick={() => selectArtist(id)}>{artists.get(id)!.name}<ArrowRight size={13} /></button>)}</div>}
        <div className="map-caption"><span>선은 함께 만든 곡 · 색은 협업 군집</span><button aria-label="지도 범례 보기" onClick={() => openModal('legend')}><HelpCircle size={19} /></button></div>
      </section>
      <div className={`detail-panel-wrap ${artist || edge ? 'has-selection' : ''} ${expanded ? 'expanded' : ''}`}>
        {(artist || edge) && <button className="sheet-toggle" aria-expanded={expanded} aria-controls="detail-sheet" onClick={() => setExpanded(!expanded)}>{expanded ? <ChevronDown size={17} /> : <ChevronUp size={17} />}{expanded ? '상세 접기' : '상세 펼치기'}</button>}
        <div id="detail-sheet">{edge ? <EdgePanel key={`${dataset.version}-${edge.id}`} edge={edge} dataset={dataset} onSelectArtist={selectArtist} onClose={() => setSelectedEdge(undefined)} /> : artist ? <ArtistPanel key={`${dataset.version}-${artist.id}`} dataset={dataset} snapshot={graph} filters={state} artist={artist} onSelectArtist={selectArtist} onSelectEdge={selectEdge} onClose={clearSelection} onFindPath={() => openModal('path')} /> : null}</div>
      </div>
    </main>
    <Timeline state={state} lastYear={lastYear} counts={yearlyCounts} playing={playing} onPlay={togglePlaying} onChange={changeFilters} onOpenFilters={openFilters} />
    <div className="site-bottomline"><span>자료 확인 {dataset.asOf.slice(0, 10)} · 수집된 기록 기준</span><div className="site-credits"><VisitorCounter /><CreatorCredit /></div><a href="/credits/">데이터 · 사진 출처 ↗</a></div>
    {shareMessage && <div className="share-toast" role="status"><Check size={18} />{shareMessage}</div>}
  </div>
  {modal === 'filters' && <Modal returnFocus={modalTrigger.current} title="필터 · 기간" onClose={() => setModal(undefined)}>{filters}<button className="dialog-primary" onClick={() => setModal(undefined)}>지도에 적용된 조건 보기<ArrowRight size={17} /></button></Modal>}
  {modal === 'legend' && <Modal returnFocus={modalTrigger.current} title="연결을 읽는 방법." className="legend-dialog" onClose={() => setModal(undefined)}><div className="legend-explainer"><section><h3>얼굴은 아티스트</h3><p>크기가 클수록 현재 기간에 협업한 아티스트가 많습니다. 그룹은 별도 노드입니다.</p></section><section><h3>선은 함께 만든 곡</h3><p>같은 녹음에 랩·가창으로 참여하면 연결됩니다. 곡이 많을수록 선이 굵어집니다. 같은 녹음의 재발매는 한 번만 셉니다.</p></section><section><h3>색은 협업 군집</h3><p>협업 구조로 묶은 커뮤니티입니다. 실제 레이블이나 크루를 뜻하지 않습니다.</p></section><section><h3>가까움은 관계의 구조</h3><p>친분이나 음악적 유사성의 수치가 아닙니다. 얼굴을 선택해 직접 협업을 살펴보고, 목록에서도 같은 정보를 확인할 수 있습니다.</p></section></div><a className="dialog-methodology" href="/methodology/">데이터와 알고리즘 자세히 보기<ArrowRight size={17} /></a></Modal>}
  {modal === 'path' && <Modal returnFocus={modalTrigger.current} title="두 아티스트의 연결 경로" onClose={() => setModal(undefined)}>{artist ? <><p><strong>{artist.name}</strong>에서 시작합니다. 도착 아티스트를 검색하세요.</p><ArtistSearch artists={dataset.artists} visibleIds={visibleIds} exclude={artist.id} label="연결 경로 대상 아티스트" onSelect={id => { setSelectedEdge(undefined); update({ type: 'change', patch: { target: id, extended: state.extended || !artists.get(id)?.core } }, 'push'); }} />{state.target && <div className="path-result" aria-live="polite"><h3>{path.length ? `${path.length - 1}단계로 연결` : '현재 수집 자료와 필터에서 경로를 찾지 못했습니다.'}</h3>{path.length ? <ol>{path.map((id, index) => <li key={id}><button onClick={() => selectArtist(id)}>{artists.get(id)?.name}</button>{index < path.length - 1 && <button className="path-evidence" onClick={() => selectEdge(edgeId(id, path[index + 1]))}>{graph.edges.find(edge => edge.id === edgeId(id, path[index + 1]))?.count}곡 · 근거 보기<ArrowRight size={16} /></button>}</li>)}</ol> : <button onClick={showAllYears}>전체 기간으로 보기</button>}</div>}</> : <><p>먼저 출발 아티스트를 선택하세요.</p><ArtistSearch artists={dataset.artists} visibleIds={visibleIds} label="출발 아티스트 검색" onSelect={id => { update({ type: 'change', patch: { artist: id, target: undefined, extended: state.extended || !artists.get(id)?.core } }, 'push'); }} /></>}</Modal>}
  </>;
}
