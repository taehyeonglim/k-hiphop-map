# 핵심 아티스트 사진 추가 조사 · 2026-10-04

**현재: 핵심 268/268명(100%), 전체 781/2,756명.** 아래 1차 조사 이후 남은 107명을 공개 프로필·인터뷰에서 확보했다. [2차 조사](#2차-조사-남은-107명-전원-반영)의 범위와 권리 미확인 상태를 함께 확인해야 한다.

## 1차 조사 · CC 사진 41장

지도에서 사진이 비어 있던 핵심 아티스트 148명을 우선 재조사했다. 기존 전체 633장 중 핵심 아티스트 사진은 120장뿐이었다. 이번에는 새로 게시한 41장 모두 핵심 아티스트의 사진이다.

| 범위 | 이전 | 이번 반영 후 |
| --- | ---: | ---: |
| 핵심 아티스트 | 120 / 268 (44.8%) | 161 / 268 (60.1%) |
| 전체 카탈로그 | 633 / 2,756 | 674 / 2,756 |
| 핵심 사진 미확보 | 148 | 107 |

음악 데이터의 아티스트·발매·녹음 수는 바꾸지 않았다. 사진이 있다는 이유로 그룹 관계나 녹음 참여자를 추가하지 않는다. 전체 사진 수와 핵심 확보율을 공개 수집 현황에서 따로 표시한다.

## 달라진 조사 방식

- 위키백과 대표 이미지 외에 Commons 파일 설명, Flickr 촬영자 자료, 원제작자·공식 채널의 CC 영상까지 조사했다. 한글명·영문명·이전 활동명을 대조하고 검색 결과를 인물 확인으로 취급하지 않았다.
- 영문 대문자 활동명의 제목 표기와 한국어 `(가수)`, `(래퍼)`, `(음악 그룹)` 구분 표기를 수집기에 추가했다. 검색 결과가 실패한 요청을 사진 부재로 처리하지 않는다.
- YouTube 검색의 CC 필터만으로는 게시하지 않는다. 선택한 영상 자체에 명시된 재사용 허용 표시, 제작 채널, 실제 출연자와 장면을 검토했다. 플랫폼이 버전 없이 표시하는 경우 업로드 연도로 CC 버전을 추정하지 않고 플랫폼의 실제 라이선스 링크를 기록했다.
- 41장의 실제 인물과 정사각형·원형 크롭을 시각 검토했다. 9장은 Commons 파일(영상 1개 포함), 32장은 개별 CC 영상의 정지 장면이다. 원본의 색상은 변경하지 않았다.
- 멤버의 위치를 추측하지 않았다. 부가킹즈의 간디·주비트레인, 가리온의 나찰·메타, 소울다이브의 지토·디테오는 이름이 확인되는 별도 자료와 대조했다.
- 파일 승인에는 출처 URL, 이미지 SHA-256, 인물 확인, 크롭 확인이 모두 필요하다. 원본·프레임 시각·좌표·저작자·작품 제목·라이선스와 변경 내용을 보존했다.

## 1차 조사 당시 보류 내역

1차 조사 종료 시점에는 핵심 107명의 사진이 미확보 상태였다. 이후 결과는 아래 2차 조사에 기록했다. 자동 검색이 끝났다는 사실은 모든 원본과 권리를 검토했거나 사진이 존재하지 않는다는 뜻이 아니다. 각 항목의 현재 상태와 다음 행동은 [조사 기록](../data/portrait-review.json) 및 [공개 현황](https://k-hiphop-map.vercel.app/coverage/)에 남긴다.

- 주석·던말릭·매니악·자메즈: 출연 영상은 찾았으나 얼굴이 작거나 어두워 더 선명한 장면을 찾아야 한다.
- 피타입·데드피: 한국어 문서에서 사진 후보를 찾았으나 재사용 조건이 확인되지 않아 보류했다.
- 인피닛 플로우·안덥: 검색한 후보가 앨범 그래픽·사진첩 원경·음원 화면으로, 얼굴 사진으로 사용할 수 없었다.
- 비트박스 DG: 후드와 마이크가 얼굴을 가려 보류했다.
- MFBTY: 공식 인사 영상의 준오플로는 게스트다. 비지는 개인 크롭으로 추가했고, 네 사람의 장면을 MFBTY 3인의 사진으로 게시하지 않았다.
- 최삼: 공식 뉴스타파 제작 영상은 찾았으나 다운로드 실패로 실제 출연 프레임 검토가 미완료다. 재시도 상태로 보존했다.

1차 조사 후 계획은 이전 활동명과 소속 그룹을 통해 단독 프로필·인터뷰를 우선 대조하고, 선명한 원본은 있으나 권리가 불명확하면 촬영자·레이블이 공개한 재사용 조건을 확인한다. 팬 재업로드, 일반인의 랩 커버, 이름만 같은 인물, 앨범 커버·로고를 얼굴 사진으로 채우지 않는다.

## 재현과 검토 파일

Python Pillow, ffmpeg, yt-dlp 및 yt-dlp의 JavaScript 런타임 의존성이 필요하다. 이번 영상 검토는 yt-dlp 2026.08.19와 Node 런타임으로 수행했다. 원본·영상은 `.cache/portraits/`에만 보관하며 공개 배포에는 256×256 WebP 정지 사진만 포함한다.

```sh
python3 scripts/discover-portrait-sources.py --provider commons
python3 scripts/discover-portrait-sources.py --provider flickr
python3 scripts/discover-portrait-sources.py --provider youtube
python3 scripts/stage-portrait-selections.py
python3 scripts/test-portraits.py
# 실제 인물·크롭을 검토하고 portrait-approvals.json에 출처와 SHA-256을 승인한다.
python3 scripts/survey-portraits.py --publish-only
npm run build
```

- [검색 기록](../data/portrait-discovery.json): 검색 URL·응답 상태·후보. 일치·재사용 승인을 뜻하지 않는다.
- [수동 선택 기록](../data/portrait-selections.json): 원본·시각·좌표·인물 대조 근거.
- [영상 이용조건 확인](../data/portrait-video-evidence.json): 실제 선택 영상의 제목·제작 채널·명시 라이선스. 서명된 다운로드 URL은 저장하지 않는다.
- [게시 승인](../data/portrait-approvals.json): 검토한 이미지 바이트와 출처를 묶은 승인.
- [전체 사진 감사](image-audit.md): 현재 카탈로그 기준 집계와 출처.

## 추가한 사진

| 아티스트 | 저작자 | 원본 |
| --- | --- | --- |
| MC 메타 | 인문360 | [원본·이용조건](https://www.youtube.com/watch?v=gW1_xz9ylo4) |
| 간디 | acrofan.com | [원본·이용조건](https://commons.wikimedia.org/wiki/File:Buga_Kingz_from_acrofan.jpg) |
| 김심야 | Marie Claire Korea | [원본·이용조건](https://www.youtube.com/watch?v=gOHQ1YZTHLQ) |
| 나찰 | 뮤지스땅스 | [원본·이용조건](https://www.youtube.com/watch?v=h5a9_2I0Hy8) |
| 던밀스 | Studio FLO 스튜디오 플로 | [원본·이용조건](https://www.youtube.com/watch?v=_rce7xwmNxU) |
| 디아크 | Studio FLO 스튜디오 플로 | [원본·이용조건](https://www.youtube.com/watch?v=ZaDNQK9zPD4) |
| 디테오 | Ming J | [원본·이용조건](https://www.youtube.com/watch?v=I17FKnWTH2Q) |
| 루이 (긱스) | Ming J | [원본·이용조건](https://www.youtube.com/watch?v=KkOmkffvvrE) |
| 마이크로닷 | K-POPIT 케이팝잇 | [원본·이용조건](https://www.youtube.com/watch?v=EuEK0mVQGMw) |
| 면도 | WOMAN SENSE | [원본·이용조건](https://www.youtube.com/watch?v=jrXZO4BvWGI) |
| 보이비 | 꽁병지tv | [원본·이용조건](https://www.youtube.com/watch?v=auCs_1wzOCc) |
| 블라세 | GooseBumps | [원본·이용조건](https://commons.wikimedia.org/wiki/File:Blase_2020.png) |
| 비지 | JKEntAUS | [원본·이용조건](https://commons.wikimedia.org/wiki/File:Special_message_from_MFBTY_with_JUNOFLO.webm) |
| 빅원 | SBS Radio 에라오 | [원본·이용조건](https://www.youtube.com/watch?v=q2wrJWANY04) |
| 상추 | USAG- Humphreys | [원본·이용조건](https://commons.wikimedia.org/wiki/File:Sangchu_in_K-Force_Special_Show_-_Pyeongtaek,_South_Korea_-_7_March_2013.jpg) |
| 소울 다이브 | Ming J | [원본·이용조건](https://www.youtube.com/watch?v=I17FKnWTH2Q) |
| 스낵키챈 | Dynasty Muzik · 촬영 Byun Byul · 편집 Snacky Chan | [원본·이용조건](https://www.youtube.com/watch?v=YFutQ04fRoY) |
| 스웨이디 | 스튜디오 틈새 | [원본·이용조건](https://www.youtube.com/watch?v=MJ5cNdClU98) |
| 슬릭 | PGNpictures | [원본·이용조건](https://commons.wikimedia.org/wiki/File:SLEEQ2021.png) |
| 신스 | Marie Claire Korea | [원본·이용조건](https://www.youtube.com/watch?v=lyjf1hH9xR4) |
| 어글리덕 | Ming J | [원본·이용조건](https://www.youtube.com/watch?v=WM683j1TI3U) |
| 업타운 | SBS Radio 에라오 | [원본·이용조건](https://www.youtube.com/watch?v=3tKu376NFBI) |
| 오디 | K-POPIT 케이팝잇 | [원본·이용조건](https://www.youtube.com/watch?v=oa6Kv86Aynw) |
| 올티 | K-POPIT 케이팝잇 | [원본·이용조건](https://www.youtube.com/watch?v=v5rlhWsSPHY) |
| 우디 고차일드 | K-pop Profiles | [원본·이용조건](https://commons.wikimedia.org/wiki/File:Woodiegochild.jpg) |
| 원썬 | K-POPIT 케이팝잇 | [원본·이용조건](https://www.youtube.com/watch?v=voB6Yk1yo00) |
| 이그니토 | K-POPIT 케이팝잇 | [원본·이용조건](https://www.youtube.com/watch?v=ZYXtXS1NDCU) |
| 이현배 | 젬비씨 JEMBC | [원본·이용조건](https://www.youtube.com/watch?v=bMR6mLwcVlE) |
| 제리케이 | LET IT VIDEO | [원본·이용조건](https://www.youtube.com/watch?v=U0qR8gk7HR4) |
| 제이제이케이 | MIC SWAGGER | [원본·이용조건](https://www.youtube.com/watch?v=tLsGbtSJrSs) |
| 조광일 | SBS Radio 에라오 | [원본·이용조건](https://commons.wikimedia.org/wiki/File:Jo_Gwangil_20220129.png) |
| 조원우 | K-POPIT 케이팝잇 | [원본·이용조건](https://www.youtube.com/watch?v=WHJzmNuyrhg) |
| 주비트레인 | acrofan.com | [원본·이용조건](https://commons.wikimedia.org/wiki/File:Buga_Kingz_from_acrofan.jpg) |
| 지스트 | BRANDNEW MUSIC | [원본·이용조건](https://www.youtube.com/watch?v=E9VfxH3HEZ0) |
| 지토 | Ming J | [원본·이용조건](https://www.youtube.com/watch?v=I17FKnWTH2Q) |
| 쿤타 | SBS Radio 에라오 | [원본·이용조건](https://www.youtube.com/watch?v=ZM2Orff_fj4) |
| 퀸 와사비 | GROOVL1N | [원본·이용조건](https://www.youtube.com/watch?v=29k4Cp2DBzA) |
| 테드 박 | POPDUST | [원본·이용조건](https://commons.wikimedia.org/wiki/File:Ted_Park_(born_1994)_in_a_2021_interview_for_Popdust.png) |
| 테이크원 | Ming J | [원본·이용조건](https://www.youtube.com/watch?v=WM683j1TI3U) |
| 행주 | NewsInStar | [원본·이용조건](https://www.youtube.com/watch?v=r9GOzoyEIvU) |
| 허클베리피 | Yellocean Show | [원본·이용조건](https://www.youtube.com/watch?v=ojSU2e2agqs) |


## 2차 조사: 남은 107명 전원 반영

사용자의 재조사 요청에 따라 수집 범위를 공개 음원 서비스·공연 프로필·인터뷰 사진까지 확대했다. 기존 CC 사진 674장은 보존하고, 핵심 107장을 추가하여 핵심 268/268명(100%), 전체 781/2,756명이 됐다. 추가 사진은 벅스 102장, 아츠로 2장(블랙넛·마미손), iChart 1장(션이슬로우), 인터뷰 2장(룸나인·제이권도)이다. 그룹도 카탈로그의 한 아티스트로 집계한다. 전체 카탈로그에는 아직 1,975명의 사진이 없다.

**이번 107장의 개별 재사용 허락은 미확인이다.** 공개되어 있다는 사실을 사용허락으로 간주하지 않으며, 제공 사이트를 사진 촬영자로 표기하지 않는다. 명시된 CC 라이선스 사진과 구분하여 `rights.status=unconfirmed`, 출처 귀속, 저작자 미표기, 다음 권리 확인 행동을 보존한다. 게시 승인에 있는 `publicationBasis=public-source-reference`는 인물·출처·크롭을 검토한 참조 사진의 게시 판단이며 권리자의 허락이 아니다. `portrait-permissions.json`에는 허락 기록을 추가하지 않았다. 크레딧·수집 현황·방법론·양쪽 README에서 같은 구분을 공개한다.

- 매니악·기린·CK·호미들의 루이는 동명이인 검색 결과를 교체하고 발매곡 및 그룹 소속을 대조했다. 김디지는 Beatbox DG·Dizzy와 구분한다.
- MYK는 솔튼페이퍼 프로필과 공식 발매 소개의 활동명 관계를 확인했다. 서리(30)는 여성 솔로 Seori와 구분한다.
- 피노다인 로고, 음원 서비스 기본 이미지, 마미손의 일러스트는 제외했다. 마미손은 실제 복면 사진을 사용하며 다른 인물의 맨얼굴로 대체하지 않는다.
- 제이권도는 기사에서 박재진으로 명시한 왼쪽 인물을 선택했다. 룸나인은 본명·발매작을 확인한 인터뷰 사진의 오른쪽 옆얼굴을 골랐다.
- 107장 모두 정사각형 및 원형 표시를 검토했다. 옷·배경을 잡거나 얼굴 일부만 남긴 자동 크롭을 수동 교정했다. 그룹 사진은 전체 프레임과 원형 표시용 여백을 보존한다. MFBTY는 실제 세 멤버가 담긴 사진을 선택했다.
- 일부 초기 사진의 낮은 원본 해상도, 옆얼굴·후드·복면·손에 가린 포즈는 남아 있다. 얼굴을 합성하거나 원본 색상을 보정하지 않았다. 이는 모든 사진이 최신의 정면 고화질 사진이라는 뜻은 아니다.

[107장의 선택 기록](../data/portrait-profile-selections.json)에 원본 URL, 바이트 SHA-256, 크기, 크롭 좌표, 인물 대조 근거를 고정했다. 원본이 바뀌면 재현기가 중단하므로 다른 사진을 같은 승인으로 게시할 수 없다. 공개 웹페이지에는 256×256 WebP만 포함한다.

```sh
python3 scripts/stage-profile-portraits.py
python3 scripts/test-portraits.py
# 해당 후보의 인물·출처·실제 크롭과 권리 상태를 검토한 뒤 승인 파일에 WebP 해시를 기록한다.
# --artist를 반복 지정하여 검토한 배치만 게시할 수 있다.
python3 scripts/survey-portraits.py --publish-only --artist joosuc
npm run build
```

후속 과제는 이번 107장의 사진별 저작자·사용허락 확인 및 대체 가능한 명시 라이선스 사진 확보, 전체 카탈로그의 나머지 1,975명 수집이다. 핵심 사진 100%와 전체 수집·권리 확인의 완료를 혼동하지 않는다.
