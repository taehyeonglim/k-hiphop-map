# Selected network focus + node drag code review

Date: 2026-10-02 KST  
Reviewer: `/root/code_review`  
Scope: read-only review of the selected artist neighborhood, shortest-path focus, spring node dragging, Sigma captor cancellation, reduced-motion camera durations, final visual-fit overlay avoidance, URL/list restoration tests, and the `allowedDevOrigins` config change.

## Result

- `codeQualityStatus`: CLEAR
- `recommendation`: APPROVE
- `blockers`: []

This is a code-quality approval for the frozen source reviewed here. Browser/GPU/static-preview QA was explicitly owned by root/QA; the final 34-case static/browser run with the new geometry assertion was still running when this report was updated, so I did not claim that evidence as passed.

## Changed files reviewed

- `README.md`
- `next.config.ts`
- `src/app/globals.css`
- `src/components/GraphCanvas.tsx`
- `src/components/MapExplorer.tsx`
- `src/lib/graph-view.ts`
- `src/lib/drag-physics.ts`
- `tests/e2e.spec.ts`
- `tests/graph-view.test.ts`
- `tests/drag-physics.test.ts`

## Skill-perspective check

Completed. I consulted:

- `/Users/taehyeong/.codex/plugins/cache/sisyphuslabs/omo/4.16.2/skills/remove-ai-slops/SKILL.md`
- `/Users/taehyeong/.codex/plugins/cache/sisyphuslabs/omo/4.16.2/skills/programming/SKILL.md`
- `/Users/taehyeong/.codex/plugins/cache/sisyphuslabs/omo/4.16.2/skills/programming/references/typescript/README.md`

Remove-ai-slops perspective: I did not find deletion-only tests, tests that merely assert a removed behavior, tautological tests, or production parsing/normalization added outside the feature boundary. The new tests exercise observable graph focus, hidden-node picking, path edge filtering, node drag/release, reduced motion, and cancellation behavior.

Programming perspective: the implementation keeps the new physics code in a small pure module and uses project-level typechecking. I noted two non-blocking watch items below: `GraphCanvas.tsx` remains oversized, and `DragPhysics` uses local non-null assertions for Map invariants. Neither creates a release blocker because the assertions are inside a closed invariant and the risky runtime behavior is covered by targeted tests. The final visual-fit patch adds bounded camera math inside the existing Sigma boundary rather than a new abstraction.

## Evidence inspected

- Source inspection:
  - `src/components/GraphCanvas.tsx:234-279` resets Sigma mouse/touch captor state on true cancellation.
  - `src/components/GraphCanvas.tsx:330-365` preserves Sigma's freshly armed captor state for fresh node downs and two-finger touch transitions via `cancelInteraction(false, false)`.
  - `src/components/GraphCanvas.tsx:350-355` replaces pending camera animation before disabling the camera, using a 1 ms same-state animation to avoid Sigma's duration-zero division path.
  - `src/components/GraphCanvas.tsx:312`, `668-670` use 1 ms reduced-motion camera durations instead of `0`.
  - `src/components/GraphCanvas.tsx:326-336` fits the focused neighborhood into a usable viewport rectangle below/above the opaque UI regions by deriving the desired viewport midpoint in framed graph coordinates and reflecting the camera center to place the graph center there.
  - `src/components/GraphCanvas.tsx:35-43`, `178-195` reserve right-side mobile label space and stop force-labeling every small mobile neighbor while preserving the selected/path emphasis.
  - `src/lib/graph-view.ts:5-27` implements one-hop selected neighborhoods and consecutive-edge-only shortest paths.
  - `src/lib/drag-physics.ts:8-99` implements bounded local spring physics with cancel/release/reduced-motion behavior.
  - `src/components/MapExplorer.tsx:41-44`, `129-132`, `164-178` wire selected focus, counts, clearing, list view, and shortest-path focus.
- Local dependency inspection:
  - `node_modules/sigma/package.json` reports Next dependency environment uses Sigma 3.0.3.
  - `node_modules/sigma/dist/sigma.esm.js:220-223` confirms `Camera.animate` cancels an existing `nextFrame` when a new animation is scheduled.
  - `node_modules/sigma/dist/sigma.esm.js:624-640` confirms mouse `moveBody` handlers run before Sigma checks `sigmaDefaultPrevented` and before panning.
  - `node_modules/sigma/dist/sigma.esm.js:809-834`, `914-952`, `967-1008` confirm touch start/move state and two-finger camera gesture depend on preserving `touchMode` and `startTouchesPositions`.
  - `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/allowedDevOrigins.md:10-21` confirms `allowedDevOrigins` is the documented dev-server origin config, host-only and development-scoped.
- Local commands run by this reviewer:
  - `npm test -- --run tests/graph-view.test.ts tests/drag-physics.test.ts tests/graph.test.ts tests/graph-benchmark.test.ts tests/layout-worker.test.ts` → PASS, 5 files / 27 tests.
  - `npx tsc --noEmit --pretty false` → PASS, exit 0.
  - `git diff --check` → PASS, exit 0.
- Root-reported evidence not independently rerun by this reviewer per instruction:
  - final post-visual-fix `next build` exited 0 with all 2618 static routes.
  - root/unit/collector validation passed.
  - QA static/browser run of 34 cases, including the new opaque-overlay geometry assertion, was running at the time of this update.

## Findings by severity

### CRITICAL

None.

### HIGH

None.

The previous blocker around stale Sigma captor state after `blur`/`pointercancel`/`touchcancel` is fixed in the reviewed source. True cancel paths reset mouse and touch captor activation and timers, while fresh down and multi-touch paths preserve Sigma's active captor state so normal background pan and native two-finger camera gestures can continue.

### MEDIUM

None.

### LOW

1. `src/components/GraphCanvas.tsx` is still large at 632 pure LOC after this change. The file now owns rendering setup, reducers, layout controls, camera fitting, interaction cancellation, drag integration, and test instrumentation. This is a maintainability watch item under the programming skill's size lens, but I am not blocking because the pure physics behavior was extracted to `src/lib/drag-physics.ts`, the Sigma-specific coupling is localized inside the canvas boundary, and the new risky cases have E2E/unit coverage.

2. `src/lib/drag-physics.ts:67-79` uses non-null assertions on `Map.get()` results after the constructor filters invalid springs and initializes forces for every body. This is a local invariant escape hatch rather than a current correctness bug. The unit suite covers outside-node springs and finite positions, so I do not recommend blocking on it.

3. `src/components/GraphCanvas.tsx:253-279` directly mutates Sigma captor fields. This is a private-API coupling risk on future Sigma upgrades, but it is justified by the verified Sigma event ordering and by the absence of a public cancellation API for the stale captor bug. Keep the cancellation E2E when upgrading Sigma.

## Test relevance review

The new tests are relevant to the requested behavior:

- `tests/graph-view.test.ts:24-57` covers selected one-hop node visibility, current-period absence, full-map clearing, and consecutive shortest-path edge filtering.
- `tests/drag-physics.test.ts:8-62` covers pinned dragging, propagation through real springs, bounded settle-back, reduced motion, cancel, non-finite pointer rejection, and ignoring springs to outside nodes.
- `tests/e2e.spec.ts:73-89`, `197-244` covers actual hidden-node rendering/picking, focus clearing from the canvas/background/list controls, source-backed neighborhood counts, and focused node centers staying outside opaque UI overlays.
- `tests/e2e.spec.ts:240-260` covers filtered URL restoration of the same source-backed focused neighborhood.
- `tests/e2e.spec.ts:262-376` covers real mouse/touch drag behavior, camera stability, spring settling, and reduced-motion behavior.
- `tests/e2e.spec.ts:378-423` covers the stale-captor regression after mouse blur/pointercancel and mobile touchCancel.
- `tests/e2e.spec.ts:467-502` covers shortest-path URL restoration and consecutive route edges only.

I did not find tests that merely mirror implementation constants or provide false confidence. Some E2E assertions use `window.__hiphopGraph` instrumentation, but they assert the rendered graph's observable visible nodes/edges, camera state, and interaction state needed to test WebGL/Sigma behavior that is otherwise difficult to inspect through DOM-only selectors.

## Final visual-fit amendment

Reviewed after the mobile overlap patch landed. The event and physics APIs are unchanged. The camera fit now computes a usable viewport area with mobile/desktop insets, calculates the graph coordinate under that desired area midpoint at the fitted ratio, and reflects the camera center so the selected neighborhood center appears in that usable area. This is consistent with Sigma's framed graph transforms and does not mutate graph/world coordinates. The label change is similarly bounded: mobile gets a 54 px right reserve, and only emphasized nodes keep forced labels on small viewports.

I did not rerun unit or browser tests after this visual-only patch. Root reported the post-patch build completed successfully, and QA owns the full 34-case browser rerun with the new geometry assertion.

## Deployment note

No code-quality blockers remain. Deployment should still wait for the owner of the browser/static-preview QA pass to report its final result, because the post-visual-fix 34-case run was pending and not independently rerun here.
