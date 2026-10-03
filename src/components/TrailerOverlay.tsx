'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { TRAILER_MEDIA_ROOT } from '@/lib/trailer';
import CreatorCredit from './CreatorCredit';

interface TrailerOverlayProps { open: boolean; pending: boolean; onClose: () => void }
type Playback = 'loading' | 'playing' | 'paused' | 'manual' | 'blocked' | 'error';

export default function TrailerOverlay({ open, pending, onClose }: TrailerOverlayProps) {
  const dialog = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [portrait, setPortrait] = useState<boolean | null>(null);
  const [playback, setPlayback] = useState<Playback>('loading');
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasFrame, setHasFrame] = useState(false);
  const position = useRef(0);
  const wasOpen = useRef(false);
  const autoPlayAllowed = useRef(true);
  const resumePlayback = useRef(false);
  const mutePreference = useRef(true);
  const sourceStarted = useRef(false);
  const pendingSource = useRef('');
  const metadataCleanup = useRef<(() => void) | undefined>(undefined);

  const bindSource = useCallback((source: string, resumeAt: number) => {
    const media = video.current;
    if (!media) return;
    metadataCleanup.current?.();
    setHasFrame(false);
    media.muted = mutePreference.current;
    media.preload = 'auto';
    media.src = source;
    const restorePosition = () => {
      if (resumeAt > 0 && Number.isFinite(media.duration)) media.currentTime = Math.min(resumeAt, Math.max(0, media.duration - .1));
    };
    media.addEventListener('loadedmetadata', restorePosition, { once: true });
    metadataCleanup.current = () => media.removeEventListener('loadedmetadata', restorePosition);
    sourceStarted.current = true;
    media.load();
  }, []);

  const close = useCallback(() => {
    video.current?.pause();
    onClose();
  }, [onClose]);

  useLayoutEffect(() => {
    const orientation = window.matchMedia('(orientation: portrait)');
    const update = () => setPortrait(orientation.matches);
    update();
    orientation.addEventListener('change', update);
    return () => orientation.removeEventListener('change', update);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const focusables = () => Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]') ?? [])
      .filter((element) => element.getClientRects().length > 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
      if (event.key !== 'Tab') return;
      const elements = focusables();
      const first = elements[0], last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); dialog.current?.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !dialog.current?.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialog.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = previousOverflow;

    };
  }, [open, close]);

  useEffect(() => {
    const media = video.current;
    if (!media) return;
    if (!open) {
      wasOpen.current = false;
      position.current = 0;
      sourceStarted.current = false;
      metadataCleanup.current?.();
      media.pause();
      media.removeAttribute('src');
      media.load();
      return;
    }
    if (portrait === null) return;
    const firstOpening = !wasOpen.current;
    wasOpen.current = true;
    if (firstOpening) {
      position.current = 0;
      mutePreference.current = true;
      setMuted(true); setProgress(0);
      autoPlayAllowed.current = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      sourceStarted.current = false;
    }
    const hasBoundSource = Boolean(media.getAttribute('src'));
    const resumeAt = hasBoundSource ? media.currentTime : position.current;
    const shouldPlay = firstOpening ? autoPlayAllowed.current : hasBoundSource ? !media.paused && !media.ended : resumePlayback.current;
    pendingSource.current = `${TRAILER_MEDIA_ROOT}/${portrait ? 'portrait' : 'landscape'}.mp4`;
    // preload="none" is only a hint. Omitting src entirely is what guarantees
    // reduced-motion visitors download no video before an explicit gesture.
    if (!shouldPlay && !sourceStarted.current) {
      setPlayback('manual');
      return;
    }
    bindSource(pendingSource.current, resumeAt);
    if (shouldPlay) {
      setPlayback('loading');
      media.play().catch((error: DOMException) => {
        if (!media.getAttribute('src') || error.name === 'AbortError') return;
        setPlayback(error.name === 'NotAllowedError' ? 'blocked' : 'error');
      });
    } else setPlayback((previous) => firstOpening ? 'manual' : previous === 'playing' || previous === 'loading' ? 'paused' : previous);
    return () => {
      position.current = media.currentTime;
      resumePlayback.current = !media.paused && !media.ended;
      media.pause();
      metadataCleanup.current?.();
      media.removeAttribute('src');
      media.load();
    };
  }, [open, portrait, bindSource]);

  const play = () => {
    const media = video.current;
    if (!media) return;
    autoPlayAllowed.current = true;
    if (!media.getAttribute('src') || playback === 'error') bindSource(pendingSource.current, position.current);
    setPlayback('loading');
    media.play().catch((error: DOMException) => {
      if (!media.getAttribute('src') || error.name === 'AbortError') return;
      setPlayback(error.name === 'NotAllowedError' ? 'blocked' : 'error');
    });
  };
  const toggleSound = () => {
    const media = video.current;
    if (!media) return;
    media.muted = !media.muted;
    mutePreference.current = media.muted;
    setMuted(media.muted);
  };
  const needsPlay = ['manual', 'blocked', 'error', 'paused'].includes(playback);

  return <section ref={dialog} className="trailer-overlay" data-testid="trailer-overlay" data-state={pending ? 'pending' : open ? 'open' : 'closed'}
    role="dialog" aria-modal="true" aria-labelledby="trailer-title" aria-describedby="trailer-description" tabIndex={-1} hidden={!pending && !open}>
    <header className="trailer-topbar">
      <span className="trailer-brand">K—HIPHOP<span>/</span>MAP<small>THE INTRO / 30 SEC</small></span>
      <CreatorCredit />
      <button ref={closeButton} className="trailer-close" onClick={close} aria-label="트레일러 닫고 지도 보기"><X size={24} aria-hidden="true" /></button>
    </header>
    <div className="trailer-stage">
      <picture className="trailer-poster"><source media="(orientation: portrait)" srcSet={`${TRAILER_MEDIA_ROOT}/poster-portrait.webp`} /><img src={`${TRAILER_MEDIA_ROOT}/poster-landscape.webp`} alt="" loading="lazy" /></picture>
      <video ref={video} data-testid="trailer-video" className={`trailer-video ${hasFrame ? 'has-played' : ''}`} muted playsInline preload="none" tabIndex={-1} aria-label="한국 힙합 연결의 기록 소개 영상"
        onLoadedData={() => { if (open) setHasFrame(true); }}
        onPlay={() => setPlayback('playing')} onPause={() => { if (open && !video.current?.ended) setPlayback((current) => current === 'playing' ? 'paused' : current); }}
        onEnded={close} onError={() => { if (open && video.current?.getAttribute('src')) setPlayback('error'); }}
        onTimeUpdate={() => { const media = video.current; if (media) { position.current = media.currentTime; setProgress(Number.isFinite(media.duration) && media.duration > 0 ? media.currentTime / media.duration : 0); } }} />
      {needsPlay && <div className="trailer-play-prompt">
        <button className="trailer-play" onClick={play}><Play size={24} fill="currentColor" aria-hidden="true" /><span>{playback === 'error' ? '영상 다시 재생' : '영상 재생'}</span></button>
        <p role="status">{playback === 'error' ? '영상을 불러오지 못했습니다. 지도를 바로 탐험하거나 다시 재생해 보세요.' : playback === 'blocked' ? '재생 버튼을 누르면 소개 영상이 시작됩니다.' : playback === 'manual' ? '자동 재생 없이, 원할 때 시작하세요.' : '영상이 일시정지되었습니다.'}</p>
      </div>}
    </div>
    <footer className="trailer-bottom">
      <div className="trailer-caption"><h1 id="trailer-title">한국힙합 연결고리</h1><p id="trailer-description">30초 소개. 붐뱁에서 트랩까지, 세대를 가로지르는 협업의 지도.</p><a href="/credits/#trailer">영상 · 음악 크레딧</a></div>
      <div className="trailer-actions">
        <button className="trailer-sound" onClick={toggleSound} aria-label={muted ? '소리 켜기' : '소리 끄기'}>{muted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}<span>{muted ? '소리 켜기' : '소리 끄기'}</span></button>
        {playback === 'playing' && <button className="trailer-pause" onClick={() => video.current?.pause()} aria-label="영상 일시정지"><Pause size={17} aria-hidden="true" /></button>}
        <button className="trailer-enter" onClick={close}>지도 탐험하기<ArrowRight size={17} aria-hidden="true" /></button>
      </div>
    </footer>
    <div className="trailer-progress" aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }} /></div>
  </section>;
}
