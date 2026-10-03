'use client';
import { useEffect, useState } from 'react';
import type { MapState, PeriodMode } from '@/lib/map-state';
function YearInput({ value, min, max, label, onCommit }: { value: number; min: number; max: number; label: string; onCommit: (year: number) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const commit = () => { const parsed = Number(text); const year = text.trim() && Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.floor(parsed))) : value; setText(String(year)); onCommit(year); };
  return <label>{label.startsWith('시작') ? '시작 연도' : '끝 연도'}<input type="number" inputMode="numeric" aria-label={label} min={min} max={max} value={text} onChange={event => setText(event.target.value)} onBlur={commit} onKeyDown={event => { if (event.key === 'Enter') { commit(); event.currentTarget.blur(); } if (event.key === 'Escape') { setText(String(value)); } }} /></label>;
}
export default function PeriodControls({ state, lastYear, onChange }: { state: MapState; lastYear: number; onChange: (patch: Partial<MapState>) => void }) {
  return <div className="period-controls"><div className="mode-switch" aria-label="기간 선택 방식">{([['range', '기간'], ['cumulative', '누적'], ['year', '한 해']] as [PeriodMode, string][]).map(([mode, label]) => <button key={mode} aria-pressed={state.mode === mode} onClick={() => onChange({ mode })}>{label}</button>)}</div>
    <div className="year-fields">{state.mode === 'range' && <YearInput value={state.from} min={1995} max={state.to} label="시작 연도 직접 입력" onCommit={from => onChange({ from })} />}<YearInput value={state.to} min={1995} max={lastYear} label="끝 연도 직접 입력" onCommit={to => onChange({ to })} /></div>
  </div>;
}
