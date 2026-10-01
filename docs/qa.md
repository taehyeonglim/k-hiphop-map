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
- Alias search, empty search results, distinct person/group identities, and actual canvas node selection.
- Collaborative recordings with participating artists, source URLs, and external listening links after detail fetch completes.
- Range, single-year, cumulative, and minimum-song filters against the source catalog.
- Period-specific ForceAtlas2 worker relayout, responsive search during computation, completion, and restoration of the baseline after filter changes.
- A two-step collaboration path supported by actual credited recordings, with selection, period, target, and list state restored in a fresh page.
- WebGL initialization failure with usable list exploration, and failed portrait requests with named initials fallback.
- Legend and keyboard Escape, methodology, image credits, and standalone artist discography.

Latest preliminary native-GPU run: desktop 10/10 passed; mobile 9/10 passed. The remaining mobile failure is the share icon's missing accessible label, also identified by code review. This includes proof that a browser worker was created and actual graph coordinates changed during relayout. Final acceptance still awaits the final catalog freeze and a complete rerun.

Visual inspection found and prompted fixes for invalid border GLSL, additive glow, overlapping faces, hidden labels, and an unusably short mobile artist scroll area. Updated native-GPU desktop/mobile screenshots show circular portraits, separated nodes, readable labels, and usable selected-artist sheets. Earlier SwiftShader/concurrent-HMR runs are diagnostic only and are not valid performance evidence.

## Performance evidence requirements

`tests/performance.spec.ts` requests exactly 1,000 nodes and 10,000 unique undirected edges in the production renderer, measures actual Sigma `afterRender` frames during three 2-second camera animations, and checks the median against 45fps desktop / 30fps mobile-viewport thresholds. Each measurement must retain the requested graph size. JSON measurements, the WebGL renderer name, and a screenshot are stored in each test result directory.

The `five fresh contexts` case measures initial map readiness five times for each viewport. It records median and empirical p95 against a 3-second target, without network throttling. Five samples' empirical p95 is their maximum; this is not a population estimate. A fresh context resets the HTTP cache, while the browser process and operating system remain reused. Readiness means a positive Sigma node count after initialization and does not include completion of every portrait download. Run this case against the public URL with `--grep 'five fresh'` and the native stress case against development with `--grep '1000 artists'`.

The mobile project emulates viewport, touch, user agent, and device scale on the same computer. It **does not certify frame rate on physical mobile hardware**. A physical-device measurement remains a separate requirement.

## Evidence and limitations

Local artifacts are in ignored `test-results/` and `playwright-report/`: screenshots, failure traces, the HTML report, and performance JSON. They can be regenerated with the commands above.

The suite establishes UI behavior and source-to-view consistency. It does not establish complete discography coverage, the truth of every third-party music credit, physical mobile performance, or public deployment. Dataset validation and manual source review are separate evidence.
