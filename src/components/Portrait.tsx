'use client';
import { useState } from 'react';
import type { MapArtist } from '@/lib/types';
export default function Portrait({ artist, className = '' }: { artist: MapArtist; className?: string }) {
  const [failed, setFailed] = useState(false);
  return <div className={`portrait ${className}`}>
    {artist.image && !failed ? <img src={artist.image.src} alt="" width={80} height={80} loading="lazy" decoding="async" onError={() => setFailed(true)} /> : <span className="portrait-initial" aria-hidden="true">{artist.name.slice(0, 2)}</span>}
    {artist.kind === 'group' && <span className="group-badge">GROUP</span>}
  </div>;
}
