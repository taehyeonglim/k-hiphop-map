# 데이터 수집·정제 감사 기록

이 서비스의 공개 지도는 1995년부터 수집 기준일까지의 **확인한 녹음별 협업**을 보여준다. 대한민국 힙합 전체 발매곡의 완전한 목록이나 아티스트의 실제 친분을 주장하지 않는다. 최신 규모와 시대별 수록 현황은 `npm run data:validate`의 출력과 공개 `/methodology` 화면에서 확인한다.

## 출처와 검증 경로

- MusicBrainz의 [공식 Web Service](https://musicbrainz.org/doc/MusicBrainz_API)에서 아티스트 식별자, 녹음별 아티스트 표기, 최초 발매일, 수록 음반을 수집한다. MusicBrainz는 커뮤니티 음악 DB이며 모든 항목이 레이블의 공식 크레딧을 대신하는 것은 아니다. [핵심 메타데이터의 CC0 조건](https://musicbrainz.org/doc/About/Data_License)을 적용한다.
- 아티스트 표기는 [누가 어떻게 대표 크레딧에 표기됐는가](https://musicbrainz.org/doc/Artist_Credits)에 관한 정보다. 그것만으로 가창이나 랩을 단정하지 않는다. 확인한 핵심 래퍼·그룹, 명시된 singer/rapper/vocalist 정체성, 직접 검토한 공식 크레딧에 한해 공연 참여자로 사용한다. 역할을 확인하지 못한 주변 참여자는 `Credit.verification: pending`으로 보존하고 연결선에서 제외한다.
- [maniadb의 공개 API](https://www.maniadb.com/api)를 25명·5시대 표본에 실제 조회했다. `data/source-audit.json`에는 검색 URL, 정확한 이름 후보, 음반 검색 건수와 오류가 남는다. 검색 결과 수는 실제 디스코그래피 수록률이 아니며 해당 API의 한도·동명이인·다른 아티스트의 피처링 음반을 포함할 수 있다. XML 검색 결과를 그대로 협업 사실로 가져오지 않는다.
- 무료 공개곡은 아티스트·레이블의 직접 공개 근거를 요구한다. 예시 [RM - Rap Monster 공식 블로그](https://bangtan.tistory.com/285)의 2015-03-20 무료 믹스테이프 11곡을 MusicBrainz의 같은 녹음 ID에 연결했다. `Rush`의 Krizz Kaliko만 명시된 피처링으로 추가했다. 원래 비트를 만든 J. Cole·Drake 등의 이름은 참여 크레딧에 넣지 않는다.
- 그룹 멤버는 MusicBrainz의 명시된 `member of band` 관계를 별도 `Membership`으로 저장한다. 가리온 명의의 녹음을 MC 메타·나찰 개인의 협업으로 자동 전환하지 않는다.

## 식별자·역할·중복 처리

- 발견용 한글명·영문명·별칭은 `data/seeds.json`에 보관한다. **녹음 참여자의 이름을 문자열로 접어 다른 아티스트에 연결하지 않는다.** 독립적으로 확인한 MBID만 핵심 아티스트에 결합한다. 직접 검토한 동명이인·이전 명의는 `data/identity-review.json`에 근거 URL과 함께 남는다.
- 긱스의 루이와 호미들의 루이, 배치기의 탁과 동명의 작곡가, MC 그리와 김심야처럼 이름이 겹치는 인물을 구분한다. SUGA/Agust D의 같은 사람 관계는 공식 BIGHIT 근거를 확인한 별도 MBID 매핑으로 처리한다.
- 알려진 프로듀서와 DJ·기악 참여자는 `producer`/`instrumental` 역할로 보관하고 가창 협업선에서 제외한다. 단순히 `DJ`로 시작하는 이름을 일괄 제거하지 않는다. [DJ Wegun의 공식 프로필](https://www.aomgofficial.com/djwegun)은 턴테이블·프로듀싱 역할의 검토 근거다.
- 녹음 MBID를 기준으로 싱글·음반·재발매의 중복을 합친다. 같은 ISRC와 같은 참여자 집합은 같은 녹음으로 합치며, ISRC가 같아도 참여자가 다르면 검토 대상으로 남긴다. 리마스터·공간 음향 표기만 달라진 녹음은 같은 공연으로 취급한다. 참여진이 바뀐 리믹스는 구분한다.
- G.D.M의 공백 표기 차이, Drunken Tiger의 같은 앨범 CD/디지털 `Blues`, j-hope의 같은 `NEURON` 공간 음향 판본은 원본 ID·참여자·길이·음반 정보를 대조한 예다. 근거 URL은 병합된 녹음의 `sources`에 모두 남는다.
- 불명확한 판본, 공식 발매 근거가 없는 Bootleg/Promotion/Pseudo-Release, 연도 불명 항목은 공개 집계에서 제외한다. 악기 반주·카라오케·데이터 트랙·음소거·영상 편집본도 제외한다.
- MusicBrainz 자체의 잘못된 인물 연결도 검토한다. 미국·이탈리아 Young B가 YANGHONGWON의 MBID에 연결된 항목과 해외 전자음악 YDG의 표기가 한국 래퍼에 붙은 항목은 `data/recording-review.json`에서 보류한다. MBID가 맞는다는 이유만으로 알려진 오류를 공개 관계에 포함하지 않는다.

## 수집 상태와 재현

`data/catalog.sqlite`는 원본 HTTP 응답·조회 시각·동명이인 후보·오류 로그를 보존한다. MusicBrainz 요청은 공유 SQLite 시계로 시작 시각을 직렬화해 초당 1회를 넘지 않게 한다. 의미 있는 User-Agent, 재시도, 원본 캐시를 사용한다. 중단 뒤 같은 명령으로 재실행하면 확인된 응답을 재사용한다. 기본 원본 캐시는 7일 뒤 만료하며 `--refresh`는 즉시 다시 조회한다.

```sh
python3 scripts/collect.py
python3 scripts/import-official.py
python3 scripts/enrich-performers.py
python3 scripts/collect.py
python3 scripts/audit-data.py
npm run data:build
npm run data:validate -- --launch
```

`import-official.py`는 공식 블로그의 알려진 제목·무료 배포·게스트 표기를 다시 확인하고 그룹 멤버십을 재생성한다. `enrich-performers.py`는 개별 가창 역할을 추측하지 않고 아티스트의 명시된 직업 설명으로 주변 참여자의 검토 정책을 보완한다. 검토 파일은 수집 결과와 분리해 재수집이 수동 판단을 덮어쓰지 않게 한다.

각 아티스트의 coverage에는 확인한 녹음·관련 발매작·검토 보류 항목 수와 확인일이 기록된다. 가장 오래된 **수집 녹음의 연도**를 실제 데뷔 연도로 표시하지 않는다. 데이터 버전은 날짜와 정규화된 내용의 해시를 포함해 같은 날의 크레딧 수정도 새 버전으로 배포한다.

## 표본의 해석

표본은 1995–2004·2005–2009·2010–2014·2015–2019·2020–현재의 주요 활동 시기를 기준으로 각 5팀을 골랐다. 시대 라벨은 표본 구성 기준이며 실제 데뷔 연도에 관한 주장으로 사용하지 않는다. 완전한 기준 디스코그래피가 없으므로 검색 건수로 누락률이나 DB 우열을 계산하지 않는다. 초기 DB 조회·직접 출처 확인·정제 감사는 `docs/source-verification.md`에 추가로 기록된다.
