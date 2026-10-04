import Link from 'next/link';
import { getDataset } from '@/lib/data';
import CoverageBrowser from '@/components/CoverageBrowser';
export const metadata = { title: '음반·사진 수집 현황', alternates: { canonical: '/coverage/' } };
export default function CoveragePage() {
  const data = getDataset();
  return <main className="document-page"><nav className="archive-nav" aria-label="아카이브 메뉴"><Link href="/">← 협업 지도</Link><Link href="/releases/">앨범 탐색</Link><Link href="/credits/">사진 출처</Link></nav>
    <div className="document-kicker">ARCHIVE IN PROGRESS</div><h1>빈칸도<br />기록합니다.</h1><p className="document-lead">찾은 자료와 아직 찾지 못한 자료.<br />수집의 범위와 다음 확인할 일을 함께 공개합니다.</p><CoverageBrowser version={data.version} /><footer className="document-footer">K-HIPHOP MAP / {data.asOf}</footer></main>;
}
