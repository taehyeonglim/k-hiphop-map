# Browser QA evidence

The browser suite exercises the real generated catalog through the Next.js development server. It does not substitute a synthetic catalog for product data. The performance test temporarily injects a graph into the same Sigma renderer in development only, then restores the actual map.

## Reproduction

```sh
npm run data:build
npm run dev
PLAYWRIGHT_BASE_URL=http://localhost:3000 PLAYWRIGHT_OUTPUT_DIR=test-results/functional PLAYWRIGHT_REPORT_DIR=playwright-report/functional npm run test:e2e
PLAYWRIGHT_BASE_URL=http://localhost:3000 PLAYWRIGHT_OUTPUT_DIR=test-results/performance PLAYWRIGHT_REPORT_DIR=playwright-report/performance npm run test:performance
PLAYWRIGHT_BASE_URL=https://YOUR-DEPLOYMENT.vercel.app PLAYWRIGHT_OUTPUT_DIR=test-results/public-loading PLAYWRIGHT_REPORT_DIR=playwright-report/public-loading npx playwright test tests/performance.spec.ts --grep 'five fresh'
```

Run the two commands sequentially and keep source files and generated data unchanged during measurement. HMR can remount the graph during a test and invalidate its fixture size. When no existing server is supplied, Playwright starts the development server locally; CI uses `npm start` to serve the previously built static export. The same functional suite can target a production preview or deployed URL through `PLAYWRIGHT_BASE_URL`.

The macOS configuration uses installed Google Chrome with native ANGLE Metal. `PLAYWRIGHT_CHROME_PATH` can select another installed Chrome. Linux/CI uses the Playwright Chromium installation and explicitly enables software WebGL for functional checks. CI runs the functional suite; GPU performance is measured separately on an available native renderer.

## Functional scenarios

- Real WebGL graph, zoom/reset controls, no page exceptions, no horizontal overflow, and screenshots at 1600×1000 and 390×844 CSS pixels.
- Failed initial map JSON download, visible recovery action, and successful retry into the real network.
- Alias search, empty search results, distinct person/group identities, and actual canvas node selection.
- Collaborative recordings with participating artists, source URLs, and external listening links after detail fetch completes.
- Range, single-year, cumulative, and minimum-song filters against the source catalog.
- Period-specific ForceAtlas2 worker relayout, responsive search during computation, completion, and restoration of the baseline after filter changes.
- A two-step collaboration path supported by actual credited recordings, with selection, period, target, and list state restored in a fresh page.
- WebGL initialization failure with usable list exploration, and failed portrait requests with named initials fallback.
- Legend and keyboard Escape, methodology, image credits, and standalone artist discography.

Corrected built-static run at `http://127.0.0.1:3100`, version `2026.10.01-73d5c2c3-c92fd5a3`: **22/22 passed in 35.6 seconds** (11 desktop, 11 mobile). The corrected catalog has 268 core artists and 11,208 eligible recordings. Source identity pins were corrected and independently re-audited before this run. The suite includes proof that a browser worker was created and actual graph coordinates changed during relayout. The mobile share button's accessible name, collaborator sheet, and new map-download recovery action are verified by actual clicks. The older `1753171e` run is superseded and is not source-acceptance evidence for this release.

Visual inspection found and prompted fixes for invalid border GLSL, additive glow, overlapping faces, hidden labels, and an unusably short mobile artist scroll area. Updated native-GPU desktop/mobile screenshots show circular portraits, separated nodes, readable labels, and usable selected-artist sheets. Earlier SwiftShader/concurrent-HMR runs are diagnostic only and are not valid performance evidence.

Corrected functional artifacts: `test-results/corrected-functional/` and `playwright-report/corrected-functional/`. Desktop/mobile map screenshots are stored under each `e2e-the-real-source-backed-...` result directory. Full names appear on focus, selection, and suitable zoom levels rather than all at once in the overview. The initial HTML now contains a small bootstrap, while map data is fetched separately with failure/retry and version-mismatch handling.

## Performance evidence requirements

`tests/performance.spec.ts` requests exactly 1,000 nodes and 10,000 unique undirected edges in the production renderer, measures actual Sigma `afterRender` frames during three 2-second camera animations, and checks the median against 45fps desktop / 30fps mobile-viewport thresholds. Each measurement must retain the requested graph size. JSON measurements, the WebGL renderer name, and a screenshot are stored in each test result directory.

The `five fresh contexts` case measures initial map readiness five times for each viewport. It records median and empirical p95 against a 3-second target, without network throttling. Five samples' empirical p95 is their maximum; this is not a population estimate. A fresh context resets the HTTP cache, while the browser process and operating system remain reused. Readiness means a positive Sigma node count after initialization and does not include completion of every portrait download. Run this case against the public URL with `--grep 'five fresh'` and the native stress case against development with `--grep '1000 artists'`.

The mobile project emulates viewport, touch, user agent, and device scale on the same computer. It **does not certify frame rate on physical mobile hardware**. A physical-device measurement remains a separate requirement.

Final native stress run: **2/2 passed in 17.5 seconds**. Renderer: `ANGLE (Apple, ANGLE Metal Renderer: Apple M4, Unspecified Version)`.

| Viewport | Measured fps | Median | Target | Fixture verified |
| --- | --- | --- | --- | --- |
| Desktop 1600×1000 | 54, 60, 60 | 60 | ≥45 | 1,000 nodes / 10,000 ties in each measurement |
| Mobile emulation 390×844 | 58, 60, 60 | 60 | ≥30 | 1,000 nodes / 10,000 ties in each measurement |

Native stress artifacts: `test-results/final-performance/` and `playwright-report/final-performance/`. Each result includes `navigation-performance.json` and the rendered stress screenshot. The stress run used the same unchanged renderer before the source-only correction and bootstrap addition; its synthetic graph size and drawing programs are unaffected by those changes.

Preliminary public latency at `https://k-hiphop-map.vercel.app`, older version `1753171e`: desktop samples 3,862 / 630 / 591 / 610 / 641ms (median 630ms; empirical p95 3,862ms, target failed), mobile-emulation samples 647 / 743 / 618 / 625 / 639ms (median 639ms; empirical p95 743ms, target passed). There were no page errors or same-origin HTTP failures. The slow first sample remains in the results. These preliminary numbers prompted moving the large dataset out of SSR props; they do not validate the corrected optimized deployment. Public verification and loading measurements for the corrected version remain pending.

## Evidence and limitations

Local artifacts are in ignored `test-results/` and `playwright-report/`: screenshots, failure traces, the HTML report, and performance JSON. They can be regenerated with the commands above.

The suite establishes UI behavior and source-to-view consistency. It does not establish complete discography coverage, the truth of every third-party music credit, physical mobile performance, or public deployment. Dataset validation and manual source review are separate evidence.
