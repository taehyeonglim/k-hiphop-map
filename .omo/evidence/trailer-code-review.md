# Trailer code review

- codeQualityStatus: CLEAR
- recommendation: APPROVE
- reportPath: `.omo/evidence/trailer-code-review.md`
- reviewed scope: `src/lib/trailer.ts`, `src/components/TrailerOverlay.tsx`, `src/components/MapBootstrap.tsx`, `src/components/MapExplorer.tsx`, `src/app/layout.tsx`, `src/app/trailer.css`, `src/components/CreatorCredit.tsx`, `src/app/credits/page.tsx`, `tests/trailer.e2e.spec.ts`, trailer media docs/scripts/assets at a smoke level, and `vercel.json` trailer cache headers.
- full static QA/build status: pending with root/QA at the time of this report. This approval is for corrected code review and targeted evidence only.
- skill-perspective check: completed. I consulted the required `remove-ai-slops` and `programming` perspectives before judging maintainability and tests. The corrected diff does not violate either perspective: the trailer state logic sits at the browser-storage/media boundary where validation and defensive handling are appropriate, and the added trailer tests exercise observable behavior rather than implementation constants or deletion-only assertions.

## Evidence checked

- `npm run typecheck -- --pretty false` passed.
- `npm test -- --run` passed: 5 test files, 27 tests.
- Targeted browser regressions passed against `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000`:
  - `tests/trailer.e2e.spec.ts:223` — first client-side return from `/credits/` opens the unseen introduction.
  - `tests/trailer.e2e.spec.ts:291` — reduced-motion first visit shows the manual poster and makes no MP4 request until play.
- Helper-level stale-boot repro now returns the expected result: `{ expected: 'show', actual: 'show', seen: null }` when current path is `/`, search is empty, no seen flag exists, and `window.__hiphopTrailerBoot` contains an old `skip` marker.
- Public media files exist and manifest byte sizes match disk for both MP4s:
  - `public/media/trailer/v1/landscape.mp4` — 1280×720, manifest bytes match disk.
  - `public/media/trailer/v1/portrait.mp4` — 720×1280, manifest bytes match disk.
- Earlier `ffprobe` smoke check on both MP4s reported 30.000000 seconds, video+audio streams, and the expected dimensions.

## CRITICAL

None.

## HIGH

None.

## MEDIUM

None.

## LOW

None.

## Resolved review items

- The stale boot-state blocker is fixed. `readTrailerVisit()` in `src/lib/trailer.ts:20-32` now recomputes against the current `window.location` and storage state instead of returning a stale `window.__hiphopTrailerBoot` value from the original document route. The regression at `tests/trailer.e2e.spec.ts:223-233` covers client-side `/credits/` → home navigation.
- The reduced-motion eager-download issue is fixed. `TrailerOverlay` now omits the video `src` before an explicit play gesture in the manual/reduced-motion path (`src/components/TrailerOverlay.tsx:113-119`) and binds the source from `play()` only when needed (`src/components/TrailerOverlay.tsx:138-147`). The regression at `tests/trailer.e2e.spec.ts:291-310` verifies zero MP4 requests before play.
- Paused orientation changes preserve position and mute state through source rebinding (`src/components/TrailerOverlay.tsx:110-135`), with regression coverage at `tests/trailer.e2e.spec.ts:235-262`.
- Trailer media cache headers are scoped to `/media/trailer/v1/:path*` in `vercel.json:5-10`, matching the versioned media path used by the UI.

## Blockers

None.
