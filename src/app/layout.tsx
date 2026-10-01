import type { Metadata, Viewport } from 'next';
import './globals.css';
import './documents.css';
import './trailer.css';
import './visitor-counter.css';
import { TRAILER_BOOT_SCRIPT } from '@/lib/trailer';
export const metadata: Metadata = { title: { default: 'K-HIPHOP MAP — 한국 힙합의 연결을 읽다', template: '%s | K-HIPHOP MAP' }, description: '1995년부터 현재까지. 발매곡과 공식 공개곡을 바탕으로 한국 힙합 아티스트의 협업을 탐험하는 인터랙티브 아카이브.', metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://k-hiphop-map.vercel.app'), openGraph: { title: 'K-HIPHOP MAP', description: '곡으로 연결된 한국 힙합. 세대를 가로지르는 협업의 지도.', locale: 'ko_KR', type: 'website', images: ['/og.png'] }, twitter: { card: 'summary_large_image' }, robots: { index: true, follow: true }, icons: { icon: '/icon.svg' } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#151715' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko" data-trailer-visit="skip" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: TRAILER_BOOT_SCRIPT }} /></head><body>{children}</body></html>; }
