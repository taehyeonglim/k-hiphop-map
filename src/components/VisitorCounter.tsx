'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { RefreshCw } from 'lucide-react';
import { getServerVisitorCounterState, getVisitorCounterState, loadVisitorCounter, subscribeVisitorCounter, VISITOR_COUNTER_DESCRIPTION } from '@/lib/visitor-counter';

export default function VisitorCounter() {
  const state = useSyncExternalStore(subscribeVisitorCounter, getVisitorCounterState, getServerVisitorCounterState);
  useEffect(() => { void loadVisitorCounter(); }, []);
  const display = state.status === 'ready' && state.count !== undefined ? state.count.toLocaleString('ko-KR') : '—';
  const availability = state.status === 'ready' ? display : state.status === 'error' ? '현재 확인할 수 없음' : '불러오는 중';

  return <div className="visitor-counter" data-testid="visitor-counter" data-state={state.status} title={VISITOR_COUNTER_DESCRIPTION} role="status" aria-live="polite" aria-atomic="true" aria-label={`${VISITOR_COUNTER_DESCRIPTION} · ${availability}`} aria-busy={state.status === 'idle' || state.status === 'loading'}>
    <span className="visitor-counter-label" aria-hidden="true">방문</span><strong aria-hidden="true">{display}</strong>
    {state.status === 'error' && <button className="visitor-counter-retry" onClick={() => { void loadVisitorCounter(true); }} aria-label="방문 수 다시 불러오기"><RefreshCw size={11} aria-hidden="true" /></button>}
  </div>;
}
