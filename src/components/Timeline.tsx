'use client';
import { Pause, Play, SlidersHorizontal } from 'lucide-react';
import type { MapState } from '@/lib/map-state';
export default function Timeline({ state, lastYear, counts, playing, onPlay, onChange, onOpenFilters }: { state: MapState; lastYear: number; counts: { year: number; count: number }[]; playing: boolean; onPlay: () => void; onChange: (patch: Partial<MapState>) => void; onOpenFilters: () => void }) {
  const max = Math.max(1, ...counts.map(entry => entry.count));
  const span = Math.max(1, lastYear - 1995);
  return <footer className="timeline" aria-label="기간 탐색"><div className="timeline-heading"><div><span>TIME TRAVEL</span><strong>{state.mode === 'year' ? state.to : `${state.from} — ${state.to}`}</strong></div><button className="play-button" onClick={onPlay} aria-label={playing ? '연도 재생 일시정지' : '연도별 변화 재생'}>{playing ? <Pause size={18} /> : <Play size={18} />}</button></div>
    <div className="timeline-track"><div className="timeline-bars" aria-hidden="true">{counts.map(({ year, count }) => <span key={year} className={year >= state.from && year <= state.to ? 'in-range' : ''} style={{ height: `${3 + count / max * 30}px` }} title={`${year}: ${count}곡`} />)}</div>
      <div className="timeline-slider"><div className="timeline-range-fill" style={{ left: `${(state.from - 1995) / span * 100}%`, right: `${(lastYear - state.to) / span * 100}%` }} />{state.mode === 'range' && <input aria-label="시작 연도" type="range" className="range-start" min={1995} max={lastYear} value={state.from} onChange={event => onChange({ from: Math.min(Number(event.target.value), state.to) })} />}<input aria-label="끝 연도" type="range" className="range-end" min={1995} max={lastYear} value={state.to} onChange={event => onChange({ to: Number(event.target.value) })} /></div>
      <div className="timeline-year-labels"><span>1995</span><span>2005</span><span>2015</span><span>{lastYear}</span></div>
    </div><button className="timeline-edit" onClick={onOpenFilters}><SlidersHorizontal size={18} /><span>기간 설정</span></button>
  </footer>;
}
