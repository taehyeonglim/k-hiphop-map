# 기여하기 / Contributing

한국어와 영어 제안을 모두 환영합니다. / Contributions in Korean and English are welcome.

## 데이터 정정

[데이터 정정 양식](https://github.com/taehyeonglim/k-hiphop-map/issues/new?template=data-correction.yml)에 인물·곡·현재 문제·올바른 내용·검증 가능한 출처 URL을 적어 주세요. 지도 상세의 ‘수정 제안’ 링크는 ID와 데이터 버전을 채워 줍니다. 화면의 이름만으로 동명이인을 합치거나 그룹 크레딧을 멤버 개인에게 배분하지 마세요. 확인되지 않은 정보는 검토 후보로 남깁니다.

Use the correction form with an artist, recording, proposed change and source URL. Prefer explicit recording credits. Do not infer individual performances from group membership or merge identities solely by name. See [catalog maintenance](docs/data-pipeline.md).

## 코드 변경

1. Node.js 22+에서 `npm ci`, `npm run data:build`, `npm run dev`를 실행합니다.
2. 설치된 `node_modules/next/dist/docs/`의 관련 문서를 확인합니다. 정적 export 구조를 유지합니다.
3. 변경한 동작에 맞는 검증을 추가합니다. 화면 변경에는 실제 데스크톱·모바일 화면을 첨부합니다.
4. PR에 문제, 결과, 검증, 데이터·출처 영향을 기록합니다.

```sh
npm run typecheck
npm test
npm run api:check
python3 scripts/test-collector.py
npm run build
npm run test:e2e
```

Use a focused branch and PR. Read the installed Next.js documentation, preserve static-export compatibility, and test actual behavior. Generated snapshots, caches, credentials and test artifacts do not belong in a commit. Keep `README.md` and `README.en.md` synchronized; use the PR checklist to record validation.

## 자료와 이용조건

새 사진은 저작자·원본 URL·라이선스 URL·변형 내역이 필요합니다. 코드의 MIT 라이선스는 데이터·사진·음원에 적용되지 않습니다. 노래·가사·확인되지 않은 사진을 추가하지 마세요. 공개 PR과 이슈에 API 키나 방문자 카운터 비밀키를 넣지 마세요.

Every new portrait needs an author, original page, license URL and transformation notes. The code license does not relicense data or media. Keep secrets out of issues and pull requests.
