# Browser QA evidence

The browser suite exercises the real generated catalog through development, built-static, or public servers. It does not substitute a synthetic catalog for product data. The performance test temporarily injects a graph into the same Sigma renderer in development only, then restores the actual map.

## Reproduction

```sh
npm run data:build
npm run dev
PLAYWRIGHT_BASE_URL=http://localhost:3000 PLAYWRIGHT_OUTPUT_DIR=test-results/functional PLAYWRIGHT_REPORT_DIR=playwright-report/functional npm run test:e2e
PLAYWRIGHT_BASE_URL=http://localhost:3000 PLAYWRIGHT_OUTPUT_DIR=test-results/performance PLAYWRIGHT_REPORT_DIR=playwright-report/performance npm run test:performance
PLAYWRIGHT_BASE_URL=https://k-hiphop-map.vercel.app PLAYWRIGHT_OUTPUT_DIR=test-results/public-functional PLAYWRIGHT_REPORT_DIR=playwright-report/public-functional npm run test:e2e
PLAYWRIGHT_BASE_URL=https://k-hiphop-map.vercel.app PLAYWRIGHT_OUTPUT_DIR=test-results/public-loading PLAYWRIGHT_REPORT_DIR=playwright-report/public-loading npx playwright test tests/performance.spec.ts --grep 'five fresh'
```

Run browser commands sequentially and keep source files and generated data unchanged during measurement. HMR can remount the graph during a test and invalidate its fixture size. When no existing server is supplied, Playwright starts the development server locally; CI uses `npm start` to serve the previously built static export. The same functional suite can target a production preview or deployed URL through `PLAYWRIGHT_BASE_URL`.

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

The same corrected release at [the public service](https://k-hiphop-map.vercel.app/map/) passed **22/22 in 43.7 seconds**. Public functional artifacts are in `test-results/public-functional/` and `playwright-report/public-functional/`. The [Lee Young-ji profile](https://k-hiphop-map.vercel.app/artists/lee-young-ji/) returned HTTP 200 and links to rapper MusicBrainz ID `0433e75d-70b6-4118-9ff8-9b6f7e534093`.

[GitHub verification for commit `8088c5f`](https://github.com/taehyeonglim/k-hiphop-map/actions/runs/36877065139) also passed on Linux with Node 22, including all 22 built-static functional scenarios. CI uses software WebGL for behavior checks and does not certify native GPU frame rate.

Separate settled visual checks waited for network idle on both viewports. All 160 portrait asset requests in the full artist index succeeded, with no page errors or same-origin HTTP failures and no horizontal overflow. The eligible network includes 132 portrait-bearing artists; the default core view includes 116. Screenshots `test-results/public-visual/desktop-settled.png`, `mobile-settled.png`, and `mobile-selected.png` show the loaded circular portraits and the mobile Garion sheet. `visual-evidence.json` records the checks. Initial graph-ready screenshots can precede completion of the portrait downloads.

## Performance evidence requirements

`tests/performance.spec.ts` requests exactly 1,000 nodes and 10,000 unique undirected edges in the production renderer, measures actual Sigma `afterRender` frames during three 2-second camera animations, and checks the median against 45fps desktop / 30fps mobile-viewport thresholds. Each measurement must retain the requested graph size. JSON measurements, the WebGL renderer name, and a screenshot are stored in each test result directory.

The `five fresh contexts` case measures initial map readiness five times for each viewport. It records median and empirical p95 against a 3-second target, without network throttling. Five samples' empirical p95 is their maximum; this is not a population estimate. A fresh context resets the HTTP cache, while the browser process and operating system remain reused. Readiness means a positive Sigma node count after initialization and does not include completion of every portrait download. Run this case against the public URL with `--grep 'five fresh'` and the native stress case against development with `--grep '1000 artists'`.

The mobile project emulates viewport, touch, user agent, and device scale on the same computer. It **does not certify frame rate on physical mobile hardware**. A physical-device measurement remains a separate requirement.

Final native stress run on the corrected code and bootstrap: **2/2 passed in 17.0 seconds**. Renderer: `ANGLE (Apple, ANGLE Metal Renderer: Apple M4, Unspecified Version)`.

| Viewport | Measured fps | Median | Target | Fixture verified |
| --- | --- | --- | --- | --- |
| Desktop 1600×1000 | 58, 60, 60 | 60 | ≥45 | 1,000 nodes / 10,000 ties in each measurement |
| Mobile emulation 390×844 | 59, 60, 60 | 60 | ≥30 | 1,000 nodes / 10,000 ties in each measurement |

Native stress artifacts: `test-results/corrected-performance/` and `playwright-report/corrected-performance/`. Each result includes `navigation-performance.json` and the rendered stress screenshot. The injected fixture affects the renderer only; the surrounding product counters still describe the real catalog.

Final public initial-map measurements: **2/2 passed in 13.9 seconds**, with all 10 contexts reporting version `2026.10.01-73d5c2c3-c92fd5a3` and 268 initialized graph nodes.

| Viewport | Five samples, ms | Median, ms | Empirical p95, ms | Target |
| --- | --- | --- | --- | --- |
| Desktop | 598, 584, 599, 615, 615 | 599 | 615 | <3,000ms |
| Mobile emulation | 605, 655, 640, 578, 569 | 605 | 655 | <3,000ms |

The native, unthrottled network was measured after functional verification had already accessed the public deployment. Each context had an empty HTTP cache; the browser process, operating system, DNS/TLS infrastructure, and CDN were not reset. There were no page errors or same-origin HTTP failures. HTML was 3,219 encoded bytes; the map payload was 896,251 encoded / 6,270,746 decoded bytes and transferred in 96–130ms across the 10 samples. These values describe this computer and connection, not a throttled mobile network. Results and resource timings are in `test-results/final-public-loading/` and `playwright-report/final-public-loading/`, under `initial-map-performance.json`.

Preliminary public latency on the superseded `1753171e` version remains preserved: desktop samples 3,862 / 630 / 591 / 610 / 641ms (median 630ms; empirical p95 3,862ms, target failed), mobile-emulation samples 647 / 743 / 618 / 625 / 639ms (median 639ms; empirical p95 743ms, target passed). The slow first sample was retained and prompted moving the large dataset out of SSR props. This earlier run had no page errors or same-origin HTTP failures; it is not release evidence for the corrected deployment.

## Evidence and limitations

Local artifacts are in ignored `test-results/` and `playwright-report/`: screenshots, failure traces, the HTML report, and performance JSON. They can be regenerated with the commands above.

The suite establishes UI behavior, source-to-view consistency, and operation of the corrected public release. It does not establish complete discography coverage, the truth of every third-party music credit, or physical mobile performance. Dataset validation and manual source review are separate evidence.

## Neighborhood focus and elastic dragging — 2026-10-02

This interaction revision uses the unchanged catalog `2026.10.01-73d5c2c3-c92fd5a3`. Selecting an artist shows its center and credited direct collaborators, with only center-incident ties. An explicitly chosen route shows only its participating nodes and consecutive ties. Background, full-view control, and the visible reset action restore the overview.

The final visual-corrected static export at `http://127.0.0.1:3100` passed **33 applicable scenarios, with one intentional desktop touch skip, from 34 scheduled cases**, in about one minute. The mobile project dispatches trusted Chromium touch input; it remains device emulation on the Apple M4, rather than physical mobile hardware.

New verification compares actual Sigma hidden-cache node/edge IDs to independently counted, approved catalog credits. It checks stranger hover, neighbor switching, a filtered shared URL, an isolated selected center after minimum-count filtering, and source-supported path-only visibility after URL restoration. Mouse dragging a real collaborator moves the pinned node and its connected neighborhood, follows the actual pointer, keeps the camera stationary, and returns finite coordinates to the pre-gesture layout within the bounded settling period. Reduced motion moves only the pin, retains its released position through a repeat tap, schedules no release oscillation, and restores the baseline on reset.

Cancellation checks hold the physical mouse button after a dispatched blur or pointer-cancel signal, then issue further trusted mouse movements before normal mouseup. Interaction remains inactive, the layout restores, and the camera stays still. Mobile additionally verifies trusted touch start/move/end and touch cancellation.

Pixel inspection found that the first functional-passing mobile build placed upper neighbors behind the opaque focus banner. Camera fitting now reserves the banner/search area and lower controls; mobile labels use collision priority. A geometry regression checks every focused node center against the actual opaque interface rectangles, in addition to no page exceptions, HTTP failures, or horizontal overflow. Final desktop/mobile focused and held-node screenshots were inspected after this correction. The earlier `focus-interaction-static` screenshots are superseded visual evidence.

```sh
npm run build
npm start -- --listen 3100
# Run in another terminal after the static server is ready:
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 PLAYWRIGHT_OUTPUT_DIR=test-results/focus-interaction-final-static PLAYWRIGHT_REPORT_DIR=playwright-report/focus-interaction-final-static npm run test:e2e
```

Final artifacts: `test-results/focus-interaction-final-static/` and `playwright-report/focus-interaction-final-static/`. The `e2e-selected-neighborhoods-...` directories contain `neighborhood-desktop.png` / `neighborhood-mobile.png`; `e2e-dragging-a-collaborato-...` contains `drag-held-desktop.png` / `drag-held-mobile.png`.

Public verification of this interaction revision is pending deployment. The earlier public loading and stress measurements above describe the initial release and do not measure the new dragging interaction.
