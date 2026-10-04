import Link from 'next/link';
import { getDataset } from '@/lib/data';
import ReleaseBrowser from '@/components/ReleaseBrowser';
export const metadata = { title: '앨범 아카이브', description: '초기 언더그라운드부터 현재까지. 한국 힙합의 컴필레이션과 음반, 수록곡과 참여 근거를 찾아보세요.', alternates: { canonical: '/releases/' } };
export default function ReleasesPage() {
  const data = getDataset();
  return <main className="document-page release-document"><nav className="archive-nav" aria-label="아카이브 메뉴"><Link href="/">← 협업 지도</Link><Link href="/coverage/">수집 현황</Link><Link href="/credits/">출처·사진</Link></nav>
    <div className="document-kicker">RELEASE ARCHIVE / 1995—NOW</div><h1>씬이 남긴<br />음반들.</h1>
    <p className="document-lead">한 장의 앨범에서 또 다른 목소리로.<br />컴필레이션과 초기 언더그라운드의 기록을 찾아보세요.</p>
    <p className="document-note">전체 수록 목록과 확인된 참여 크레딧을 구분합니다. MR·인트로를 포함한 트랙 수는 지도에서 집계하는 협업곡 수와 다릅니다.</p>
    <ReleaseBrowser version={data.version} asOf={data.asOf} />
    <footer className="document-footer">K-HIPHOP MAP / 자료 확인 {data.asOf} · <Link href="/methodology/">제작 원칙</Link></footer>
  </main>;
}
