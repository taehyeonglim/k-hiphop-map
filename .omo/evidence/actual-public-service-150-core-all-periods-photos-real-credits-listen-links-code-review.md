# Code quality review: K-HIPHOP MAP service

Goal reviewed: deliver an actual public web service for Korean hip-hop collaboration mapping with at least 150 core artists, all periods from 1995 to present, portraits, real credits, listening links, static export readiness, and a usable graph explorer.

Review mode: read-only source review plus verification runs. No source fixes were made by this reviewer. Per coordination instructions, I did not start an independent `npm run build` and did not run GPU/browser E2E or stress tests while root/QA owned those final checks. I reviewed the current source, frozen data, generated static artifacts served from `out/`, and non-GPU validation.

Required skill-perspective check: completed. I consulted `remove-ai-slops` and `programming` skill instructions from the local OMO skill cache, including the TypeScript/Python programming references. The current tests are not deletion-only, tautological, brittle prompt checks, or implementation-constant mirrors in a way that affects approval. The data validation and collector regression tests exercise required launch boundaries rather than unnecessary production parsing scope. No remaining issue violates either skill perspective at CRITICAL/HIGH severity.

## Status

- `codeQualityStatus`: CLEAR
- `recommendation`: APPROVE

## CRITICAL findings

None.

## HIGH findings

None.

## MEDIUM findings

None.

## LOW findings

None requiring change before approval.

## Loader and version consistency review

`src/app/page.tsx` now reads the generated graph snapshot at build time and passes only summary metadata to the client bootstrap:

- `src/app/page.tsx:5`
- `src/app/page.tsx:7`

```tsx
const snapshot: GraphSnapshot = JSON.parse(readFileSync('public/data/graph.json', 'utf8'));
return <MapBootstrap summary={{ ...snapshot, nodes: [], edges: [] }} />;
```

`src/components/MapBootstrap.tsx` then fetches the map dataset separately using the summary version as a cache-busting query parameter. It validates the loaded shape, rejects version mismatches, offers refresh for stale-version cases, offers retry for network/data-load failures, and aborts pending fetches on unmount:

- `src/components/MapBootstrap.tsx:8`
- `src/components/MapBootstrap.tsx:20`
- `src/components/MapBootstrap.tsx:24`
- `src/components/MapBootstrap.tsx:33`
- `src/components/MapBootstrap.tsx:48`

This addresses the cold-load issue by keeping the initial HTML summary-only while retaining user-facing loading/error/retry states.

## Re-audited prior blockers

### Mobile share accessibility

Resolved. The share button keeps a stable accessible name even though the visual text is hidden in the mobile layout:

- `src/components/MapExplorer.tsx:150`

```tsx
<button className="share-button" onClick={share} aria-label="지도 공유"><Share2 size={14} /><span>지도 공유</span></button>
```

### Static-export production preview script

Resolved. `npm start` serves the static export:

- `package.json:8`

```json
"start": "serve out"
```

The running preview returned HTTP 200 for `/map/`.

### Pinodyne and membership identity validation

Resolved in the frozen catalog. Direct catalog audit found `invalidMemberships: 0`; `pinodyne` is a group record and its memberships point at the canonical `pinodyne` id.

### Lee Young-ji and Louie identity corrections

The frozen catalog has one Lee Young-ji display identity:

```json
{ "id": "lee-young-ji", "name": "이영지", "nameEn": "Lee Young-ji", "kind": "person", "core": true }
```

Louie identities are separated as `louie` for Geeks and `louie-homies` for Homies, with no membership validation errors found in the reviewed frozen data.

## Verification performed

Commands and probes run against the final reviewed state:

- Direct catalog audit: `version 2026.10.01-73d5c2c3`, `asOf 2026-10-01`, `artists 2611`, `recordings 12324`, `memberships 85`, `invalidMemberships 0`.
- Seed/review audit: `data/resolved-seeds.json` has 283 entries, `data/seeds.json` has 294 total seeds, `data/pending.json` has 11 pending entries, `data/identity-review.json` has 46 entries, and `data/recording-review.json` has 13 entries.
- `python3 scripts/test-collector.py` — passed, 10 collector regression tests.
- `npm run data:validate:launch` — passed with `errors: []`. Reported snapshot stats: `artists 731`, `coreArtists 268`, `recordings 11208`, `collaborations 4054`, `releases 2693`, `portraits 132`, `edgeCount 6344`. All launch eras had nonzero sourced recordings. Remaining warnings were shared-ISRC pending-version-review warnings only.
- `npm run typecheck` — passed.
- `npm test` — passed, 4 files / 16 tests.
- Static preview artifact check on the running `npm start` server at `http://127.0.0.1:3100`:
  - `/map/` returned HTTP 200 with `Content-Length: 10387`, confirming the map route is summary/bootstrap HTML rather than embedding the full dataset.
  - `/data/map.json` returned HTTP 200 with `Content-Length: 6270746`, confirming the real map dataset is served separately.
  - `/data/manifest.json` returned `version 2026.10.01-73d5c2c3-c92fd5a3`, matching the expected catalog version plus portrait asset hash.
  - Manifest stats matched launch validation: `coreArtists 268`, `recordings 11208`, `portraits 132`.
  - `/sitemap.xml` returned HTTP 200, included `/map/`, and included artist URLs.
- Initial HTML content check: served `/map/` contained the Korean loading text from `MapBootstrap`, did not include graph recording payload fields such as `recordingIds`, and did not inline the map dataset.

Coordination note: root reported the final build passed all 2,618 static routes, including sitemap, with launch validation at zero errors; root also reported 16 unit tests and 10 collector regressions passed. QA owned the 22 functional browser/GPU checks. This review did not duplicate those GPU/browser checks by instruction.

## Blockers before approval

None.
