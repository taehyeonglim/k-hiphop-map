# 구조와 상태 계약 / Architecture

```mermaid
flowchart LR
  Sources[MusicBrainz · maniadb · 공식 근거] --> Review[수집 캐시 · 수동 검토]
  Review --> Catalog[검토한 catalog.json]
  Catalog --> Build[결정적 레이아웃 · 검증]
  Build --> Map[가벼운 MapDataset]
  Build --> Detail[버전이 있는 ArtistDetail · RecordingDetail]
  Map --> UI[정적 Next.js · React · Sigma]
  Detail --> UI
  UI --> Counter[별도 Vercel 방문자 함수]
```

## 경계

- `MapDataset`: 아티스트 탐색·좌표·사진 참조와 녹음 ID·연도·참여 역할·검증 상태. 곡명·출처·발매작은 상세 요청으로 분리합니다.
- `ArtistDetail`: `version`, 전체 아티스트 정보, 녹음, 발매작, 그룹 관계.
- `RecordingDetail`: `{ version, recording }`.
- `Dataset`: 수집·검증·정적 아티스트 페이지의 전체 자료.
- `GraphDataset`: 지도/전체 자료에서 그래프 계산에 필요한 공통 입력.

Initial map data deliberately contains no empty stand-ins for missing evidence. Detail fetches validate identity and dataset version, support retry and abort, and never overwrite a newer selection with an older response. Graph construction preserves performer eligibility, first-release years, deduplication and ensemble normalization.

## URL

| Parameter | Meaning / 의미 | Default |
| --- | --- | --- |
| `from`, `to` | 첫 발매 연도 범위 | 1995–dataset year |
| `mode` | `range`, `cumulative`, `year` | range |
| `min` | 두 아티스트의 최소 공동곡, 정수 1–20 | 1 |
| `extended` | 한 단계 협업자 확장 | omitted / false |
| `artist`, `target` | 출발·도착 아티스트 ID | omitted |
| `view` | `map` 또는 `list` | map |

기본값은 생략합니다. 기존 `artist=`와 `/map/` 링크를 계속 받으며 canonical은 `/`입니다. 모드·연도·ID 정규화는 `map-state` 모듈 한 곳에서 수행합니다. 누적 모드 시작은 1995년, 한 해 모드는 시작과 끝이 같습니다. 잘못된 ID와 출발점 없는 도착점은 제거합니다.

아티스트 선택·경로 확정·보기 전환은 `pushState`, 연속 필터 변경은 `replaceState`를 사용합니다. `popstate`는 전체 공유 상태를 복원합니다. 검색어·모달·상세 펼침은 URL에 넣지 않습니다.

Selection, completed paths and view changes add history entries; continuous filter changes replace the current entry. Search text and sheet size remain local UI state. Clearing selection preserves filters; resetting filters preserves selection and view.

## 화면과 접근성

1,200px 이상은 검색/지도/선택 상세, 768–1,199px는 상단 검색과 오른쪽 상세, 767px 이하는 상단 검색과 하단 요약·확장 패널을 사용합니다. 모바일에서 펼친 상세는 검색창 아래 지도 영역을 채우며, 접으면 지도로 돌아갑니다. CSS 변수에서 색상·타입·간격·패널 크기를 관리합니다. 검색은 IME와 combobox 키보드 조작을 지원합니다. 그래프는 목록을 통한 동등한 탐색 경로를 제공합니다.

The trailer loads only after an explicit request. Reduced motion retains manual playback and reduced graph motion. Modal focus is contained and restored. The browser's initial map download and subsequent details have independent recovery states.
