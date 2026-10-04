'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { defaultReleaseFilters, filterReleases, parseReleaseFilters, releaseTypes, type ReleaseFilters } from '@/lib/releases';
import type { ReleaseIndex } from '@/lib/types';

export default function ReleaseBrowser({ version, asOf }: { version: string; asOf: string }) {
  const [data, setData] = useState<ReleaseIndex>();
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [filters, setFilters] = useState(defaultReleaseFilters);
  const [limit, setLimit] = useState(30);
  useEffect(() => {
    const restore = () => { setFilters(parseReleaseFilters(new URLSearchParams(window.location.search), asOf)); setLimit(30); };
    restore(); window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [asOf]);
  useEffect(() => {
    const controller = new AbortController(); setError('');
    fetch(`/data/releases.json?v=${encodeURIComponent(version)}`, { signal: controller.signal, cache: 'no-cache' }).then(async response => {
      if (!response.ok) throw new Error('앨범 목록을 불러오지 못했습니다. 다시 시도해 주세요.');
      const result = await response.json() as ReleaseIndex;
      if (result.version !== version) throw new Error('앨범 자료가 갱신되었습니다. 페이지를 새로고침해 주세요.');
      if (!Array.isArray(result.releases)) throw new Error('앨범 자료 형식을 확인할 수 없습니다.');
      setData(result);
    }).catch(failure => { if (!controller.signal.aborted) setError(failure.message); });
    return () => controller.abort();
  }, [version, retry]);
  function update(change: Partial<ReleaseFilters>) {
    const next = { ...filters, ...change };
    if (next.from > next.to) { if ('from' in change) next.to = next.from; else next.from = next.to; }
    setFilters(next); setLimit(30);
    const query = new URLSearchParams();
    if (next.q) query.set('q', next.q);
    query.set('from', String(next.from)); query.set('to', String(next.to));
    if (next.type) query.set('type', next.type);
    if (next.label) query.set('label', next.label);
    window.history.replaceState(null, '', `/releases/?${query}`);
  }
  const labels = useMemo(() => [...new Set(data?.releases.flatMap(row => row.labels ?? []) ?? [])].sort((a, b) => a.localeCompare(b, 'ko')), [data]);
  const rows = useMemo(() => filterReleases(data?.releases ?? [], filters), [data, filters]);
  const years = Array.from({ length: Number(asOf.slice(0, 4)) - 1995 + 1 }, (_, i) => 1995 + i);
  return <>
    <form className="release-filters" onSubmit={event => event.preventDefault()} aria-label="앨범 검색 조건">
      <label className="release-query">앨범·아티스트 검색<input type="search" value={filters.q} onChange={event => update({ q: event.target.value })} placeholder="대한민국, MP, The Bangerz…" /></label>
      <label>시작 연도<select value={filters.from} onChange={event => update({ from: Number(event.target.value) })}>{years.map(year => <option key={year}>{year}</option>)}</select></label>
      <label>끝 연도<select value={filters.to} onChange={event => update({ to: Number(event.target.value) })}>{years.map(year => <option key={year}>{year}</option>)}</select></label>
      <label>음반 유형<select value={filters.type} onChange={event => update({ type: event.target.value })}><option value="">전체 유형</option>{Object.entries(releaseTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>레이블<select value={filters.label} onChange={event => update({ label: event.target.value })}><option value="">전체 레이블</option>{labels.map(label => <option key={label}>{label}</option>)}</select></label>
      <button type="button" onClick={() => update(defaultReleaseFilters)}>초기 조건</button>
    </form>
    {error ? <div role="alert" className="document-note"><p>{error}</p><button onClick={() => setRetry(value => value + 1)}>다시 시도</button></div> : !data ? <p role="status">앨범 목록을 불러오는 중입니다.</p> : <>
      <p className="release-result-count" role="status">{filters.from}–{filters.to} · {rows.length.toLocaleString('ko-KR')}개 발매 · 연도순</p>
      <div className="release-grid">{rows.slice(0, limit).map(row => <Link className="release-card" href={`/releases/${row.id}/`} key={row.id} prefetch={false}>
        <div className="release-card-top"><span>{row.year}</span><small>{releaseTypes[row.type]}</small></div>
        <h2>{row.title}</h2><p>{row.type === 'compilation' ? row.series ?? 'Various Artists' : row.artists.join(' · ') || '발매 주체 확인 중'}</p>
        <div className="release-card-bottom"><span>{row.complete ? `수록 목록 ${row.trackCount}트랙` : '전체 수록 목록 미확인'}</span><span aria-hidden="true">↗</span></div>
      </Link>)}</div>
      {!rows.length && <p className="document-note">일치하는 앨범이 없습니다. 제목 일부나 다른 연도로 검색해 보세요.</p>}
      {limit < rows.length && <button className="archive-more" onClick={() => setLimit(value => value + 30)}>앨범 30개 더 보기 ({Math.min(limit, rows.length)} / {rows.length})</button>}
    </>}
  </>;
}
