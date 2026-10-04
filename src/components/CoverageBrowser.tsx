'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { CoverageData, PortraitState } from '@/lib/types';
const states: Record<PortraitState, string> = { unsearched: '조사 대기', included: '사진 반영', retry: '재시도 필요', 'not-found': '사진 미확보', 'visual-review': '시각 검토 중', 'permission-needed': '사용 근거 대기', 'identity-review': '인물 검토 중' };
export default function CoverageBrowser({ version }: { version: string }) {
  const [data, setData] = useState<CoverageData>();
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState('');
  const [state, setState] = useState('missing');
  const [limit, setLimit] = useState(30);
  useEffect(() => {
    const controller = new AbortController(); setError('');
    fetch(`/data/coverage.json?v=${encodeURIComponent(version)}`, { signal: controller.signal, cache: 'no-cache' }).then(async response => {
      if (!response.ok) throw new Error('수집 현황을 불러오지 못했습니다.');
      const value = await response.json() as CoverageData;
      if (value.version !== version) throw new Error('자료가 갱신되었습니다. 페이지를 새로고침해 주세요.');
      if (!Array.isArray(value.portraits) || !Array.isArray(value.releases)) throw new Error('현황 자료 형식을 확인할 수 없습니다.');
      setData(value);
    }).catch(failure => { if (!controller.signal.aborted) setError(failure.message); });
    return () => controller.abort();
  }, [version, retry]);
  const rows = useMemo(() => data?.portraits.filter(row => (state === '' || (state === 'missing' ? row.state !== 'included' : row.state === state)) && row.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())).sort((a, b) => Number(b.core) - Number(a.core) || a.name.localeCompare(b.name, 'ko')) ?? [], [data, query, state]);
  if (error) return <div role="alert"><p>{error}</p><button onClick={() => setRetry(value => value + 1)}>다시 시도</button></div>;
  if (!data) return <p role="status">수집 현황을 불러오는 중입니다.</p>;
  const included = data.portraits.filter(row => row.state === 'included').length;
  const searched = data.portraits.filter(row => row.state !== 'unsearched' && row.state !== 'retry').length;
  return <>
    <div className="coverage-metrics"><div><strong>{data.portraits.length.toLocaleString('ko-KR')}</strong><span>전체 아티스트</span></div><div><strong>{included.toLocaleString('ko-KR')}</strong><span>사진 연결</span></div><div><strong>{searched.toLocaleString('ko-KR')}</strong><span>조사 결과 기록</span></div></div>
    <section><h2>아티스트 사진 조사</h2><p>사진 미확보는 사진이 존재하지 않는다는 뜻이 아닙니다. 인물과 이용조건을 확인한 사진만 게시하며, 나머지 항목도 조사 대상에 남깁니다.</p>
      <form className="coverage-filters" onSubmit={event => event.preventDefault()}><label>아티스트 이름<input type="search" value={query} onChange={event => { setQuery(event.target.value); setLimit(30); }} /></label><label>조사 상태<select value={state} onChange={event => { setState(event.target.value); setLimit(30); }}><option value="missing">사진 미반영 전체</option><option value="">전체</option>{Object.entries(states).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></form>
      <p role="status">{rows.length.toLocaleString('ko-KR')}개 항목 · 핵심 아티스트 우선</p><ul className="coverage-list">{rows.slice(0, limit).map(row => <li key={row.id}><div><Link href={`/artists/${row.id}/`}>{row.name}</Link><span>{states[row.state]}</span></div>{row.reason && row.state !== 'included' && <p>{row.reason}</p>}<p>{row.nextAction}</p><small>확인 {row.checkedAt?.slice(0, 10) ?? '대기'} · 조사 기록 {row.attempts.length}회</small>{!!row.sources?.length && <details><summary>확인한 출처</summary>{row.sources.map(url => <a href={url} target="_blank" rel="noreferrer" key={url}>출처 ↗ </a>)}</details>}</li>)}</ul>
      {limit < rows.length && <button className="archive-more" onClick={() => setLimit(value => value + 30)}>30개 더 보기</button>}
    </section><section><h2>초기 음반 조사</h2><p>1995–2009년 발매를 우선 조사합니다. {data.releases.filter(row => row.status === 'inventoried').length}개 발매의 수록 목록을 확보했습니다. 곡별 참여 검증 여부는 각 앨범에서 확인할 수 있습니다.</p>
      <Link href="/releases/">음반과 전체 수록 목록 보기 →</Link>
      {data.releases.some(row => row.status !== 'inventoried') && <details><summary>추가 확인 중인 자료와 제외 내역</summary><ul>{data.releases.filter(row => row.status !== 'inventoried').map(row => <li key={row.id}>{row.title} · {row.reason ?? '추가 출처 확인 필요'}</li>)}</ul></details>}
    </section>
  </>;
}
