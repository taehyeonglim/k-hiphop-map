import type { MapArtist } from './types';
export const normalizeName = (name: string) => name.normalize('NFKC').toLocaleLowerCase('ko').replace(/\s/g, '');
export function createSearchIndex(artists: MapArtist[]) {
  return artists.map(artist => ({ artist, names: [artist.name, artist.nameEn, ...artist.aliases].map(normalizeName) }));
}
export function searchArtists(index: ReturnType<typeof createSearchIndex>, text: string, visible: Set<string>, exclude?: string) {
  const query = normalizeName(text);
  if (!query) return [];
  return index.filter(row => row.artist.id !== exclude).map(row => ({ ...row,
    rank: Math.min(...row.names.map(name => name === query ? 0 : name.startsWith(query) ? 1 : name.includes(query) ? 2 : 3)),
  })).filter(row => row.rank < 3).sort((a, b) => a.rank - b.rank || Number(visible.has(b.artist.id)) - Number(visible.has(a.artist.id)) || a.artist.name.localeCompare(b.artist.name, 'ko')).slice(0, 9).map(row => row.artist);
}
