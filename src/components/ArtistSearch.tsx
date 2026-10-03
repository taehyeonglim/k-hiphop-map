'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { MapArtist } from '@/lib/types';
import { createSearchIndex, searchArtists } from '@/lib/search';
import Portrait from './Portrait';

export default function ArtistSearch({ artists, visibleIds, onSelect, label = '아티스트 검색', exclude }: {
  artists: MapArtist[]; visibleIds: Set<string>; onSelect: (id: string) => void; label?: string; exclude?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const resultContainer = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const composing = useRef(false);
  const index = useMemo(() => createSearchIndex(artists), [artists]);
  const results = useMemo(() => searchArtists(index, query, visibleIds, exclude), [index, query, visibleIds, exclude]);
  const expanded = open && query.trim().length > 0;
  useEffect(() => {
    const container = resultContainer.current;
    const option = container?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!expanded || !container || !option) return;
    const bounds = container.getBoundingClientRect(), selected = option.getBoundingClientRect();
    if (selected.bottom > bounds.bottom) container.scrollTop += selected.bottom - bounds.bottom;
    else if (selected.top < bounds.top) container.scrollTop -= bounds.top - selected.top;
  }, [active, expanded, results]);
  const choose = (artist: MapArtist) => { setQuery(''); setOpen(false); setActive(0); onSelect(artist.id); };
  return <div className="artist-search" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
    <div className="search-wrap"><Search size={19} aria-hidden="true" />
      <input ref={input} id={id} type="search" role="combobox" autoComplete="off" aria-label={label} aria-autocomplete="list" aria-expanded={expanded} aria-controls={`${id}-results`}
        aria-activedescendant={expanded && results[active] ? `${id}-${results[active].id}` : undefined}
        placeholder={exclude ? '도착 아티스트 이름 검색' : '아티스트 이름으로 협업 찾기'} value={query}
        onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setOpen(true); setActive(0); }}
        onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
        onKeyDown={event => {
          if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
          if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); return; }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault(); setOpen(true);
            setActive(previous => results.length ? (previous + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length : 0);
          }
          if (event.key === 'Enter' && expanded && results[active]) { event.preventDefault(); choose(results[active]); }
        }} />
      {query && <button className="icon-button" aria-label="검색어 지우기" onClick={() => { setQuery(''); setOpen(false); input.current?.focus(); }}><X size={18} /></button>}
    </div>
    {expanded && <div ref={resultContainer} className="search-results" role="region" aria-label={exclude ? '경로 검색 결과' : '검색 결과'}>
      <ul id={`${id}-results`} role="listbox" aria-label={`${label} 결과`}>
        {results.map((artist, position) => <li role="option" id={`${id}-${artist.id}`} aria-selected={active === position} key={artist.id} onMouseDown={event => event.preventDefault()} onClick={() => choose(artist)}>
          <Portrait artist={artist} /><span><strong>{artist.name}</strong><small>{artist.nameEn}{!visibleIds.has(artist.id) ? ' · 현재 조건 밖' : ''}</small></span>
        </li>)}
      </ul>
      {!results.length && <p role="status">일치하는 아티스트가 없습니다. 한글·영문 이름이나 다른 활동명으로 검색해 보세요.</p>}
    </div>}
  </div>;
}
