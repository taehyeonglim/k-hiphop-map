# 운영과 배포 / Operations

[한국어 README](../README.md) · [English README](../README.en.md)

## 정적 사이트 배포

`npm run build`는 prebuild 단계에서 카탈로그 스냅샷 생성과 출시 검증을 실행합니다. Next.js는 `out/`을 만들고, Vercel은 루트 `api/visitors.ts`를 별도 함수로 배포합니다. Next.js의 Server Actions나 기본 이미지 최적화 서버에 의존하지 않습니다.

```sh
npm run typecheck
npm test
npm run api:check
python3 scripts/test-collector.py
npm run build
npm start -- --listen 3100
# 다른 터미널 / In another terminal
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npm run test:e2e
```

운영 환경의 `NEXT_PUBLIC_SITE_URL`은 canonical·sitemap·공유 메타데이터의 원본 주소입니다. 미리보기 환경에서 실서비스 방문 수를 증가시키지 않습니다. 배포 전 미리보기에서 지도, 기존 공유 링크, 아티스트 상세, 근거 링크와 방문자 API를 확인합니다.

The build generates a static export and versioned data envelopes together. Test the built output, not just the development server. Preview deployments must not increment the production counter. Keep the production site URL stable when generating canonical metadata.

인증된 Vercel 프로젝트에서 `vercel`로 미리보기를 만들고, 검증된 배포를 운영으로 승격합니다. 실패 시 이전 정상 배포를 승격해 복구합니다. 카탈로그 변경은 코드와 함께 버전 관리하며 생성물은 직접 편집하지 않습니다.

## 데이터 배포와 캐시

지도·아티스트·녹음 응답은 동일한 데이터 `version`을 사용합니다. 클라이언트는 지도와 다른 상세 버전을 거부하고 새로고침을 안내합니다. 상세 요청은 버전을 쿼리에 포함하고 재검증하며, 캐시는 버전과 ID로 구분하고 최근 40개로 제한합니다. 갱신 가능한 `/data/` 경로에는 장기 immutable 캐시를 설정하지 마세요. 영상은 새 버전 디렉터리에 생성하고 기존 버전을 덮어쓰지 않습니다.

Map and detail data must ship in one deployment. Changed or missing versions require a refresh; never merge evidence from two releases. Only immutable, version-specific trailer assets use long-lived caching.

## Visitor counter

The map footer shows cumulative browser visits since this feature was enabled, counting each browser once per Korean calendar day. A local day marker, cross-tab Web Lock, and signed HttpOnly first-party cookie avoid counting refreshes and normal repeated visits. This measures browser visits rather than unique people; cleared storage, different browsers, or an ambiguous network failure can affect the total. Development, previews, and identifiable crawlers do not increment it.

`api/visitors.ts` is a separate Vercel Node.js Function alongside the static export. `GET /api/visitors` reads the persistent total; same-origin production `POST` records a visit and returns a signed receipt only on success. The upstream [CountAPI service](https://countapi.mileshilliard.com/) uses an atomic Redis increment. Its private random counter key is held only in the secret production environment variable `VISITOR_COUNTER_KEY` (48–64 hex characters); never put it in `NEXT_PUBLIC_*`, the repository, or frontend code. The provider receives the server's counter request, not visitor identifiers or IP addresses from the application. This community service does not provide a storage/availability SLA. Errors show `—` with a retry control rather than an invented total. Preserve the key when redeploying; changing it starts a different counter.

`npm run dev` and `npm start` serve the static application without the standalone API, so local counter checks mock its responses. Use `vercel dev` with an appropriately configured environment to exercise the actual function, and use `npm test` for signed-cookie, date-boundary, storage-failure, and origin behavior.


## Release evidence

[QA 기록](qa.md)에 커밋/데이터 버전, 브라우저·기기·네트워크, 명령, 결과, 미검증 항목을 기록합니다. 에뮬레이션을 실기기 측정으로 표기하지 않습니다. / Record the version, environment, commands, outcomes and unverified scenarios in the QA log.

## Source upload boundary

`vercel deploy --dry --json`으로 전송할 파일 목록을 먼저 확인한다. `.vercelignore`는 `out`, `public/data`, `test-results`, `playwright-report`, `artifacts` 등 디렉터리 이름 자체도 제외한다. Vercel CLI 59.7.0의 `--archive=tgz` 경로에서는 끝의 `/`만으로 제외한 디렉터리 엔트리를 tar가 다시 순회하는 동작을 확인했다. 압축 업로드 크기가 소스 목록과 다르면 중단하고, 검증한 커밋을 `git archive`로 별도 폴더에 추출한 뒤 일반 업로드를 사용한다. 환경 파일·수집 캐시·로컬 빌드 결과를 배포 소스에 포함하지 않는다.

프로덕션 환경으로 빌드하되 도메인을 아직 연결하지 않으려면 `vercel deploy --prod --skip-domain`을 사용한다. 준비된 배포에서 데이터 버전과 공개 파일을 확인한 뒤 `vercel promote DEPLOYMENT_URL`로 서비스 도메인에 연결한다. 방문자 API 검증은 GET으로 수행하며, 브라우저 QA의 방문 등록 요청은 모의 응답으로 처리한다.
