'use client';
import { useId } from 'react';
import { MAX_MIN_COUNT, type MapState } from '@/lib/map-state';
import PeriodControls from './PeriodControls';
export default function MapFilters({ state, lastYear, onChange, onReset }: { state: MapState; lastYear: number; onChange: (patch: Partial<MapState>) => void; onReset: () => void }) {
  const id = useId();
  return <div className="filter-content"><div className="filter-heading"><h2>지도 설정</h2><button onClick={onReset}>필터 초기화</button></div>
    <PeriodControls state={state} lastYear={lastYear} onChange={onChange} />
    <label className="toggle-row"><span><strong>협업자 확장</strong><small>R&B · 아이돌 · 해외 아티스트</small></span><input type="checkbox" checked={state.extended} onChange={event => onChange({ extended: event.target.checked })} /></label>
    <details className="advanced-filters"><summary>상세 설정{state.minCount > 1 ? ` · ${state.minCount}곡 이상` : ''}</summary><div className="filter-block"><label htmlFor={`${id}-min`}>최소 공동 작업곡 <strong>{state.minCount}곡</strong></label><input id={`${id}-min`} type="range" min={1} max={MAX_MIN_COUNT} step={1} value={state.minCount} onChange={event => onChange({ minCount: Number(event.target.value) })} /><p>같은 두 아티스트가 함께 만든 곡 수입니다.</p></div></details>
  </div>;
}
