import type { MapDataset, MapFilters } from './types';

export type PeriodMode = 'range' | 'cumulative' | 'year';
export interface MapState extends MapFilters { mode: PeriodMode; view: 'map' | 'list' }
export const FIRST_YEAR = 1995;
export const MAX_MIN_COUNT = 20;
export function lastDatasetYear(asOf: string) {
  const year = Number(asOf.slice(0, 4));
  return Number.isInteger(year) && year >= FIRST_YEAR ? year : FIRST_YEAR;
}
export function initialMapState(asOf: string): MapState {
  return { from: FIRST_YEAR, to: lastDatasetYear(asOf), cumulative: false, extended: false, minCount: 1, mode: 'range', view: 'map' };
}
function integer(value: unknown, fallback: number, min: number, max: number) {
  const n = value === '' || value == null ? NaN : Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.floor(n))) : fallback;
}
export function normalizeMapState(value: Partial<MapState>, dataset: Pick<MapDataset, 'asOf' | 'artists'>): MapState {
  const defaults = initialMapState(dataset.asOf);
  const mode = value.mode === 'year' || value.mode === 'cumulative' ? value.mode : 'range';
  const to = integer(value.to, defaults.to, FIRST_YEAR, defaults.to);
  const from = mode === 'cumulative' ? FIRST_YEAR : mode === 'year' ? to : integer(value.from, FIRST_YEAR, FIRST_YEAR, to);
  const artist = dataset.artists.some(a => a.id === value.artist) ? value.artist : undefined;
  const target = artist && dataset.artists.some(a => a.id === value.target) ? value.target : undefined;
  return { from, to, mode, cumulative: mode === 'cumulative', extended: Boolean(value.extended),
    minCount: integer(value.minCount, 1, 1, MAX_MIN_COUNT), artist, target, view: value.view === 'list' ? 'list' : 'map' };
}
export function parseMapState(search: URLSearchParams, dataset: Pick<MapDataset, 'asOf' | 'artists'>): MapState {
  return normalizeMapState({ from: search.get('from') ? Number(search.get('from')) : undefined,
    to: search.get('to') ? Number(search.get('to')) : undefined, mode: search.get('mode') as PeriodMode,
    minCount: Number(search.get('min')) || 1, extended: search.get('extended') === '1',
    artist: search.get('artist') || undefined, target: search.get('target') || undefined,
    view: search.get('view') === 'list' ? 'list' : 'map' }, dataset);
}
export function serializeMapState(state: MapState, asOf: string): string {
  const search = new URLSearchParams();
  if (state.mode === 'range' && state.from !== FIRST_YEAR) search.set('from', String(state.from));
  if (state.to !== lastDatasetYear(asOf)) search.set('to', String(state.to));
  if (state.mode !== 'range') search.set('mode', state.mode);
  if (state.minCount > 1) search.set('min', String(state.minCount));
  if (state.extended) search.set('extended', '1');
  if (state.artist) search.set('artist', state.artist);
  if (state.artist && state.target) search.set('target', state.target);
  if (state.view === 'list') search.set('view', 'list');
  return search.toString();
}
export type MapAction = { type: 'change'; patch: Partial<MapState> } | { type: 'restore'; state: MapState } | { type: 'reset-filters' } | { type: 'clear-selection' };
export function reduceMapState(state: MapState, action: MapAction, dataset: Pick<MapDataset, 'asOf' | 'artists'>): MapState {
  if (action.type === 'restore') return normalizeMapState(action.state, dataset);
  if (action.type === 'clear-selection') return { ...state, artist: undefined, target: undefined };
  if (action.type === 'reset-filters') return { ...initialMapState(dataset.asOf), artist: state.artist, target: state.target, view: state.view };
  return normalizeMapState({ ...state, ...action.patch }, dataset);
}
// Compatibility for graph consumers; URL policy has a single implementation.
export function parseFilters(search: URLSearchParams, dataset: Pick<MapDataset, 'asOf' | 'artists'>): MapFilters { const { mode, view, ...filters } = parseMapState(search, dataset); void mode; void view; return filters; }
export function serializeFilters(filters: MapFilters, asOf = '9999'): string {
  return serializeMapState({ ...filters, mode: filters.cumulative ? 'cumulative' : 'range', view: 'map' }, asOf);
}
