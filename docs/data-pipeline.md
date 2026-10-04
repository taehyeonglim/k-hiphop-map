# 데이터 갱신 / Catalog maintenance

[한국어 README](../README.md) · [English README](../README.en.md) · [초기 음반·사진 수집 계획](archive-collection.md)

## 준비와 후보 수집

일반 사이트 실행에는 Python이 필요하지 않습니다. 메타데이터 수집은 Python 3.10+, 음반 표와 공식 프로필 파싱은 Beautiful Soup, 사진 처리는 Pillow를 사용합니다.

```sh
python3 -m pip install -r requirements.txt
python3 scripts/collect-releases.py --discover
python3 scripts/import-maniadb-releases.py
python3 scripts/survey-portraits.py
python3 scripts/survey-profile-sources.py --merge-review
```

`collect-releases.py`는 1995–2009년의 기존 발매, 핵심 아티스트의 발매/트랙 참여 browse, 레이블과 제목 후보를 대조합니다. `--refresh`는 캐시를 갱신하고 `--limit N`은 처리할 발매 수를 제한합니다. 검색 결과는 `.cache/archive-run/`에만 생성합니다. maniadb 수입 대상과 인물 대응은 `data/maniadb-releases.json`에 명시해야 합니다. 곡별 벅스 참여정보가 필요하면 `python3 scripts/collect-credit-evidence.py ALBUM_ID`로 후보 근거를 수집합니다. 가사 본문은 공개 결과물에 넣지 않습니다.

Portrait discovery stages reusable candidates under `.cache/portraits/candidates/`. It records every current artist, failed requests, unresolved identities and next actions. Official profile images are evidence candidates, not automatically licensed assets. Weekly CI refreshes music sources and revisits unresolved portraits after 30 days; it uploads candidates without publishing or committing them.

## 검토와 반영

전체 트랙 순서를 확보한 것과 모든 실연자를 확인한 것은 다릅니다. 검토 파일은 출처 URL·조사 시점·역할·판본 근거를 포함해야 합니다.

| 파일 | 역할 |
| --- | --- |
| `data/catalog.json` | 공개 카탈로그 정본 |
| `data/archive.json` | MusicBrainz 전체 트랙 목록과 관련 녹음의 지속 가능한 오버레이 |
| `data/archive-manual.json` | 출처를 대조한 수동/추가 DB 음반·인물 |
| `data/release-selection.json` | 전체 참여자 조사 대상과 검토한 제외 항목 |
| `data/release-audit.json`, `data/release-backlog.json` | 수집 결과·페이지 오류·자료 미확보 후보 |
| `data/release-review.json`, `data/track-review.json` | 판본·추가 출처와 곡별 실연 승인 |
| `data/artist-aliases.json` | 출처로 확인한 활동명 통합과 이전 URL 대응 |
| `data/portrait-review.json` | 모든 아티스트의 사진 조사 상태·사유·다음 행동 |
| `data/portrait-source-candidates.json` | 공식 프로필·DB에서 발견한 이미지 후보와 접근 결과 |
| `data/portrait-permissions.json` | Wikimedia 이외 사진의 사진별 사용허락 근거. 허락된 사진이 없으면 빈 객체 |
| `data/portrait-approvals.json` | 검토한 후보 원본 URL, `reviewedAt`, `identityConfirmed`, `cropApproved`, 검토 파일의 `imageSha256` |
| `data/portraits.json` | 실제 게시 사진의 원본·저작자·라이선스·변형 내역 |
| `data/catalog.sqlite`, `.cache/` | 비공개 원본 응답·다운로드·조사 캐시, Git 제외 |
| `public/data/`, `data/catalog.enriched.json` | 빌드 생성물. 직접 수정하지 않음 |

곡별 실연 승인은 해당 크레딧에 직접 근거가 있어야 합니다. 한 곡에 공식 출처가 추가되어도 근거 없는 다른 참여자는 승인하지 않습니다. 작사·작곡·프로듀싱만의 참여, 불명확한 신원·역할은 연결선에서 제외합니다. 그룹은 개인과 구분하며, 재발매·리마스터의 동일 녹음은 중복 집계하지 않습니다. 서로 다른 DB의 제목 일치만으로 동일 녹음이라 가정하지 않습니다.

검토가 끝난 후보만 다음 명령으로 반영합니다.

```sh
python3 scripts/collect-releases.py --publish
python3 scripts/import-maniadb-releases.py --publish
python3 scripts/collect.py --normalize-only
python3 scripts/survey-portraits.py --publish-only
npm run data:build
npm run data:validate:launch
```

`--publish-only`는 승인 파일과 후보의 원본 URL·이미지 해시가 일치하는 사진만 `public/images/artists/`로 복사합니다. 크롭·인물·이용조건 검토를 생략하는 옵션이 아닙니다. 공식 사진 허락 자료에는 `identitySource`, `permissionUrl`, `author`, `license`, `sourceUrl`, `originalUrl`, `allowCrop`을 기록합니다. 편집을 허용하지 않은 사진은 원래 구도를 유지합니다.

The general artist collector remains available as `npm run data:collect`. It uses stable paginated release/recording browse and reapplies the reviewed archive and per-track overlays when rebuilding the catalog. Publish only after checking candidates; unknown or failed source responses must remain explicit.

## 데이터 모델과 검증

[구조](architecture.md), [수집 감사](data-audit.md), [출처 검증](source-verification.md), [사진 감사](image-audit.md)를 참고하세요. 앨범 수록 수는 출처에 있는 트랙 위치를 확인한 범위이며, 한국 힙합 전체의 디스코그래피 수록률이 아닙니다. 사진 미확보는 사진이 존재하지 않는다는 뜻이 아닙니다.

검증기는 고유 ID·양방향 녹음/발매 참조·트랙 위치와 총수·출처·검토 보류 사유·사진 파일/귀속·지도 및 인덱스 버전의 일치를 확인합니다. 브라우저 회귀 검증에는 한자 제목 검색, 전체 트랙, 복구한 실연 크레딧, 미확보 사진 현황, 통신 오류 후 재시도가 포함됩니다.
