'use client';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { MapDataset } from '@/lib/types';
import { initialMapState, parseMapState, reduceMapState, serializeMapState, type MapAction } from '@/lib/map-state';

export function useMapState(dataset: MapDataset) {
  const [state, dispatch] = useReducer((current: ReturnType<typeof initialMapState>, action: MapAction) => reduceMapState(current, action, dataset), dataset.asOf, initialMapState);
  const loaded = useRef(false);
  const navigation = useRef<'push' | 'replace'>('replace');
  const [revision, restoreRevision] = useReducer(n => n + 1, 0);
  useEffect(() => {
    const restore = () => {
      navigation.current = 'replace';
      dispatch({ type: 'restore', state: parseMapState(new URLSearchParams(window.location.search), dataset) });
      loaded.current = true;
      restoreRevision();
    };
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [dataset]);
  useEffect(() => {
    if (!loaded.current || revision === 0) return;
    const query = serializeMapState(state, dataset.asOf);
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    if (`${window.location.pathname}${window.location.search}` !== url) {
      window.history[navigation.current === 'push' ? 'pushState' : 'replaceState'](null, '', url);
    }
    navigation.current = 'replace';
  }, [state, dataset.asOf, revision]);
  const update = useCallback((action: MapAction, history: 'push' | 'replace' = 'replace') => {
    navigation.current = history;
    dispatch(action);
  }, []);
  return [state, update] as const;
}
