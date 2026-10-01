import Link from 'next/link';
export default function NotFound(){return <main className="document-page"><div className="document-kicker">404 / LOST IN THE MAP</div><h1>이 연결은<br/>아직 없어요.</h1><p className="document-lead">주소를 확인하거나 지도에서 아티스트를 검색해 주세요.</p><Link className="document-back" href="/">← 지도로 돌아가기</Link></main>}
