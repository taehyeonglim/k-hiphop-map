import Link from 'next/link';
import { existsSync, readFileSync } from 'node:fs';
import type { Dataset } from '@/lib/types';

interface TrailerPortraitCredit {
  id: string;
  name: string;
  title: string;
  author: string;
  sourceUrl: string;
  originalUrl: string;
  license: string;
  licenseUrl: string;
  changes: string;
}

interface TrailerCredits {
  title: string;
  creator: { name: string; url: string };
  heroPortraits: TrailerPortraitCredit[];
  font: {
    family: string;
    upstreamFamily: string;
    author: string;
    copyright: string;
    sourceUrl: string;
    license: string;
    licenseUrl: string;
    noticeUrl: string;
    changes: string;
  };
  serviceScreenCapture: { sourceUrl: string; changes: string };
  originalGraphics: { author: string; description: string };
  originalBeat: { author: string; description: string };
}

export const metadata = { title: '사진·영상·음악과 데이터 크레딧' };

export default function Credits() {
  const data: Dataset = JSON.parse(readFileSync('data/catalog.enriched.json', 'utf8'));
  const photographed = data.artists.filter((artist) => artist.image);
  const trailerPath = 'public/media/trailer/v3/credits.json';
  const trailer: TrailerCredits | undefined = existsSync(trailerPath)
    ? JSON.parse(readFileSync(trailerPath, 'utf8'))
    : undefined;

  return <main className="document-page">
    <Link href="/" className="document-back">← 지도로 돌아가기</Link>
    <div className="document-kicker">CREDITS / 002</div>
    <h1>사진에도<br />출처가 있다.</h1>
    <p className="document-lead">{photographed.length}개의 아티스트 사진. 저작자와 이용조건을 기록하고, 개인 사진은 얼굴 노드에 맞게 크롭하고 그룹 사진은 전체 구도를 유지했습니다. 사진이 없는 아티스트도 이름으로 탐색할 수 있습니다. <Link href="/coverage/">전체 사진 조사 현황</Link>에서 미확보 사유와 다음 행동을 확인하세요.</p>

    <section>
      <h2>음악 데이터</h2>
      <p><a href="https://musicbrainz.org/">MusicBrainz</a>의 핵심 음악 데이터(CC0), <a href="https://www.maniadb.com/api">maniadb</a>의 데이터(CC BY-NC-SA 2.0 KR), 벅스의 발매·참여정보와 아티스트·레이블의 공식 자료를 대조했습니다. 개별 곡의 근거는 곡 상세에서 확인할 수 있습니다. 가사·발매 음원은 저장하거나 제공하지 않습니다.</p>
    </section>

    <section id="trailer" aria-labelledby="trailer-credit-title">
      <h2 id="trailer-credit-title">트레일러 · {trailer?.title ?? '한국힙합 연결고리'}</h2>
      <dl>
        <dt>기획·제작</dt>
        <dd><a href={trailer?.creator.url ?? 'https://github.com/taehyeonglim'} target="_blank" rel="noreferrer">임태형 a.k.a. Lyricist</a></dd>
        <dt>오리지널 음악</dt>
        <dd>트레일러 전용 오리지널 비트 · 임태형 a.k.a. Lyricist<br />96 BPM · 4/4 · 12마디 · 30초. {trailer?.originalBeat.description ?? '외부 발매 음원·보컬·샘플을 사용하지 않고 합성한 음악입니다.'}</dd>
        <dt>영상·그래픽</dt>
        <dd>{trailer?.originalGraphics.description ?? '한국 힙합의 세대와 실제 녹음 크레딧을 연결한 그래픽, 서비스 화면 캡처.'}</dd>
        <dt>영상 파일</dt>
        <dd><a href="/media/trailer/v3/landscape.mp4" download>가로 영상 MP4</a> · <a href="/media/trailer/v3/portrait.mp4" download>세로 영상 MP4</a> · <a href="/media/trailer/v3/credits.json">자산별 크레딧 JSON</a></dd>
      </dl>
      <p>서비스 화면에 포함된 사진의 저작자·원본·이용조건은 <a href="#artist-photos">아래 전체 사진 크레딧</a>에서 확인할 수 있습니다. 전체 목록은 서비스의 사진 목록이며, 한 장면에 모두 등장했다는 뜻은 아닙니다.{trailer?.serviceScreenCapture.changes && <> 화면 캡처 변경: {trailer.serviceScreenCapture.changes}</>}</p>
      <p className="document-note">영상은 비영리 아카이브 소개용으로 공개합니다. 음악·그래픽·데이터·사진에는 각각의 이용조건이 적용됩니다. 사진과 사진을 수정한 부분의 원본 라이선스·저작자 표기를 유지하며, CC BY-SA 사진의 수정본에는 동일하거나 호환되는 라이선스의 조건을 적용합니다. <a href="https://creativecommons.org/cc-licenses/" target="_blank" rel="noreferrer">Creative Commons 이용조건 안내</a></p>

      <details>
        <summary>영상 내용 텍스트로 보기</summary>
        <p>가사 없는 오리지널 비트 위에 다음 문구와 장면이 이어집니다.</p>
        <ol style={{ fontSize: '15px', lineHeight: 1.85 }}>
          <li>0–2.5초: “한 곡에서 시작된 연결.” 음악이 만든 관계를 탐험하자는 문구가 나타납니다.</li>
          <li>2.5–7.5초: “씬을 만든 목소리들.” 가리온과 드렁큰 타이거의 사진이 나타납니다.</li>
          <li>7.5–12.5초: “함께 만든 곡이, 연결을 만든다.” 가리온과 팔로알토·도끼·버벌진트·딥플로우·타블로·타이거 JK의 실제 공동 작업 관계와 곡 제목을 보여줍니다.</li>
          <li>12.5–20초: “한 명을 누르면 연결이 보인다.” “당기면 씬이 움직인다.” 실제 서비스에서 아티스트를 선택하고 얼굴 노드를 드래그하는 장면입니다.</li>
          <li>20–25초: “1995—지금. 세대를 잇다.” 실제 네트워크 위에 창모·비와이·이영지의 사진이 나타납니다.</li>
          <li>25–30초: “한국힙합 연결고리.” “지금, 연결을 탐험해.” 서비스 주소와 크레딧 안내로 마무리합니다.</li>
        </ol>
      </details>

      {trailer && <>
        <h3>영상에 사용한 아티스트 사진</h3>
        <div className="credit-grid">
          {trailer.heroPortraits.map((portrait) => <article className="credit-card" key={portrait.id}>
            <div>
              <h3>{portrait.name}</h3>
              <p style={{ overflowWrap: 'anywhere' }}>{portrait.title} · {portrait.author}</p>
              <p><a href={portrait.sourceUrl} target="_blank" rel="noreferrer">원본 파일 출처 ↗</a> · <a href={portrait.licenseUrl} target="_blank" rel="noreferrer">{portrait.license}</a></p>
              <p>영상 사용 시 변경: {portrait.changes}</p>
            </div>
          </article>)}
        </div>
        <h3>영상 글꼴</h3>
        <p><a href={trailer.font.sourceUrl} target="_blank" rel="noreferrer">{trailer.font.family}</a> · 원본 {trailer.font.upstreamFamily} · {trailer.font.author} · {trailer.font.license}. {trailer.font.copyright}. {trailer.font.changes} <a href={trailer.font.noticeUrl}>저작권·OFL 전문</a></p>
      </>}
      <p><a href="https://github.com/googlefonts/AntonFont" target="_blank" rel="noreferrer">Anton</a> · Copyright 2020 The Anton Project Authors · <a href="/fonts/anton-OFL.txt">SIL Open Font License 1.1</a><br /><a href="https://github.com/jpt/barlow" target="_blank" rel="noreferrer">Barlow Condensed</a> · Copyright 2017 The Barlow Project Authors · <a href="/fonts/barlow-condensed-OFL.txt">SIL Open Font License 1.1</a></p>
      <p>OFL은 글꼴 파일의 이용조건이며, 글꼴로 만든 영상 전체의 라이선스를 정하지 않습니다. <a href="https://openfontlicense.org/ofl-faq/" target="_blank" rel="noreferrer">OFL 공식 안내</a></p>
    </section>

    <section id="artist-photos" className="credit-grid" aria-label="전체 아티스트 사진 크레딧">
      {photographed.map((artist) => <article className="credit-card" key={artist.id}>
        <img src={artist.image!.src} alt={artist.name} loading="lazy" width="88" height="88" />
        <div>
          <h2><Link href={`/artists/${artist.id}/`}>{artist.name}</Link></h2>
          <p>{artist.image!.author}</p>
          <a href={artist.image!.licenseUrl} target="_blank" rel="noreferrer">{artist.image!.license}</a>
          <p><a href={artist.image!.sourceUrl} target="_blank" rel="noreferrer">원본 출처 ↗</a> · {artist.image!.crop || '정사각형 썸네일 크롭·WebP 변환'}</p>
        </div>
      </article>)}
    </section>
    <footer className="document-footer">K-HIPHOP MAP / NON-COMMERCIAL ARCHIVE</footer>
  </main>;
}
