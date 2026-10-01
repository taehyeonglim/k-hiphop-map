# Visitor counter code review

- `codeQualityStatus`: CLEAR
- `recommendation`: APPROVE
- `reportPath`: `.omo/evidence/visitor-counter-code-review.md`
- `blockers`: none

## Scope reviewed

Reviewed the visitor counter implementation and tests in read-only mode:

- `api/visitors.ts`
- `server/visitor-counter.ts`
- `src/lib/visitor-counter.ts`
- `src/components/VisitorCounter.tsx`
- `src/app/visitor-counter.css`
- Header integration in `src/app/layout.tsx`, `src/components/MapBootstrap.tsx`, and `src/components/MapExplorer.tsx`
- `tests/visitor-counter.test.ts`
- `tests/visitor-counter-client.test.ts`
- `tests/visitor-counter.e2e.spec.ts`
- Visitor-counter README/deployment notes

## Findings

### CRITICAL

None.

### HIGH

None.

### MEDIUM

None.

### LOW

None.

## Evidence

- TypeScript check passed:

  ```text
  npm run typecheck -- --pretty false
  > tsc --noEmit --pretty false
  ```

- Visitor counter unit/client behavior tests passed:

  ```text
  npm test -- --run tests/visitor-counter.test.ts tests/visitor-counter-client.test.ts
  Test Files  2 passed (2)
  Tests  35 passed (35)
  Duration  202ms
  ```

- I inspected the Playwright visitor-counter spec but did not run Playwright in this review turn to avoid duplicating the active QA browser run. The spec covers the loading-to-map replacement request de-dupe, retry/error display, malformed payload handling, restricted storage, formatted large totals, and header geometry around the new counter.

- Vercel API compatibility: `api/visitors.ts` exports a Web `fetch(request: Request)` handler. Vercel's Node.js runtime docs state that TypeScript files inside `/api` can export this Web Standard handler format without additional configuration. See Vercel docs: https://vercel.com/docs/functions/runtimes/node-js and https://vercel.com/docs/functions.

- CountAPI behavior: the implementation uses `/get/<key>` for reads and `/hit/<key>` for increments, matching the public CountAPI endpoint meanings at https://countapi.mileshilliard.com/. The maintainer-pinned CountAPI source returns numeric `value` for `hit` and numeric conversion for digit-only `get` values; the implementation's strict numeric parser is therefore consistent with the pinned runtime source: https://github.com/syntaxerror019/countapi/blob/d6277dce282e0d9560159d51d1b59070eb34f547/api/index.py.

- Secret/key exposure scan: I scanned the repository excluding generated/dependency/deploy output directories for `VISITOR_COUNTER_KEY`, `__Host-khiphop-visit`, `countapi.mileshilliard.com`, and 48-64 character lowercase hex strings. Findings were limited to expected implementation/tests/README references plus unrelated generated hashes in `tsconfig.tsbuildinfo`, `docs/source-verification.md`, and trailer credit hashes. I did not find a committed visitor counter secret or client-side key.

## Review notes

- Server count integrity and security paths are covered by code and tests. `server/visitor-counter.ts:53-80` rejects unsupported methods, rejects non-canonical POST origins/hosts before storage access, requires a private 48-64 hex server key, treats identifiable bots as read-only, signs the Seoul-day receipt into a `__Host-` HttpOnly/Secure/SameSite cookie, and only sets that cookie after a successful provider response.

- Error behavior is retriable. `server/visitor-counter.ts:68-80` returns `503` without a cookie on provider failures or malformed provider payloads, and `src/lib/visitor-counter.ts:121-143` tests that client failures do not write the daily receipt and require explicit retry.

- Client de-duplication is appropriate for the stated browser-visit metric. `src/lib/visitor-counter.ts:50-93` shares a module-level in-flight request across StrictMode/remounts, checks local storage by Seoul day, rechecks storage inside the Web Lock callback, and falls back to the signed server cookie when storage or Web Locks are unavailable. The remaining limitation for simultaneous posts in browsers without Web Locks is inherent to a browser-side once-per-day counter and is documented as browser-visit, not unique-person, measurement.

- Frontend integration keeps the counter isolated. `VisitorCounter.tsx:7-16` uses `useSyncExternalStore`, announces status with `role="status"`/`aria-live`, shows an explicit retry button on error, and avoids inventing a total when the API is unavailable. The header CSS has targeted mobile breakpoints and the Playwright spec asserts no clipping/overlap for large totals.

- Static export plus sidecar function is documented. README lines for the visitor counter explain that `npm start` serves the exported static app without the standalone API, while Vercel deploys the root `/api` function alongside `out/`.

## Skill-perspective check

I consulted the `remove-ai-slops` and `programming` skill perspectives before judging test relevance and maintainability, including the TypeScript reference under the programming skill.

- `remove-ai-slops`: no actionable slop finding. The new tests are behavior-focused and cover concrete security/count-integrity/browser-state paths; they are not deletion-only, tautological, or mere constant mirrors. The production code adds the minimum boundary parsing/dedup logic needed for an external counter and first-party daily receipt flow.

- `programming`: no actionable violation for this repository change. I reviewed the strict TypeScript guidance against the diff. The boundary validation and catch blocks are tied to external HTTP/storage/cookie boundaries; they are not redundant defensive code. The implementation uses this project's existing npm/Vitest/Next stack. The JSON parsing code uses narrow runtime checks before publishing state, and the tests exercise invalid payloads and retry behavior, so I did not classify it as an untyped escape-hatch blocker.
