import type { MetadataRoute } from 'next';
import { getDataset, getSnapshot } from '@/lib/data';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://k-hiphop-map.vercel.app';
  const dataset = getDataset();
  const publishedIds = new Set(getSnapshot().nodes.map(node => node.id));
  const paths = ['/', '/methodology/', '/credits/', ...dataset.artists.filter(artist => publishedIds.has(artist.id)).map(artist => `/artists/${artist.id}/`)];
  return paths.map(path => ({ url: new URL(path, base).href, lastModified: dataset.asOf }));
}
