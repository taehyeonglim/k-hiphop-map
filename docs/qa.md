# Browser QA evidence

The browser suite exercises the real generated catalog through development, built-static, or public servers. It does not substitute a synthetic catalog for product data. The performance test temporarily injects a graph into the same Sigma renderer in development only, then restores the actual map.

## 2026-10-04 UX and documentation release

This section records redesign commit `6f74539`, based on `2e4a33e`, with dataset `2026.10.01-73d5c2c3-c92fd5a3-map2`. The production-aware browser assertions are in `4b03201`; that follow-up changes tests only. Older sections below describe earlier releases.

### Production deployment and verification

The redesign is live at [the public service](https://k-hiphop-map.vercel.app/), and both READMEs are published on GitHub. The Vercel production build completed with Node 24.x, including **2,618 static pages** and the standalone visitor function. The public functional run checked ready deployment `dpl_92RtzLzDVJgfpbh818LT5UjqxtP6` ([deployment](https://k-hiphop-pcnwi3wjg-taehyeong-lims-projects.vercel.app/)).

- The full public browser suite passed **67 applicable checks in 2.5 minutes**, with one intentional desktop touch skip. This includes the new search/history, responsive details, accessibility, retry/version handling, real trailer playback and visitor-counter scenarios. Evidence: `test-results/counter-public-final/` and `playwright-report/counter-public-final/` (the directory contains the full suite).
- An initial public diagnostic exposed GET-only assumptions in the counter tests. The final checks distinguish production's first daily POST from preview GET, verify that a confirmed same-day reload uses GET, and preserve the prior receipt after invalid or failed responses. Automated browser scenarios intercept counter requests and do not increase the persistent total.
- The home page, `/map/` alias and Garion profile returned HTTP 200 with the expected canonicals. Public map JSON is byte-identical to the generated transport; its SHA-256 is `f9894d1bf0874e59b62b3dcc150153cc2213185f40935bccb2165cafcff6fd45`. The API's separate GET probe returned a valid nonnegative integer with `Cache-Control: no-store`.
- Both revision-3 MP4s returned HTTP 206 for bytes 0–1023, `video/mp4`, the expected full lengths and one-year immutable cache headers. HTTP receipts are in `.cache/redesign-production-delivery.json`. A manual Chrome visit also showed the live map and available visitor total.

[Linux/Node 22 CI for the redesign commit](https://github.com/taehyeonglim/k-hiphop-map/actions/runs/37162263404) passed data and documentation validation, type checking, **75 unit tests**, **10 collector tests**, the native API check, the production build and **67 browser checks with one intentional skip in 8.5 minutes**. No flaky retries were reported. Its downloadable `browser-evidence` artifact contains the report and captures; software WebGL is used for behavior checks, not native GPU timing.

Follow-up verification for test-only commit `4b03201`: [GitHub Actions run](https://github.com/taehyeonglim/k-hiphop-map/actions/runs/37162554445).

Public readiness was measured separately, after functional checks, with five fresh HTTP-cache contexts per viewport, empty storage, a reused browser process and an unthrottled connection. DNS/TLS, the operating system and CDN were not reset; this is not a field percentile or physical-phone benchmark.

| Viewport | Five map-ready samples (ms) | Median | Empirical p95 / maximum |
| --- | --- | --- | --- |
| Desktop | 763, 781, 651, 721, 748 | 748 ms | 781 ms |
| Mobile emulation | 705, 681, 688, 760, 666 | 688 ms | 760 ms |

All ten contexts initialized 268 nodes on the same dataset version, with zero page errors or failed same-origin responses. Both viewports passed the existing 3,000 ms check. Evidence: `test-results/redesign-public-loading/` and `playwright-report/redesign-public-loading/`.

```sh
PLAYWRIGHT_BASE_URL=https://k-hiphop-map.vercel.app PLAYWRIGHT_OUTPUT_DIR=test-results/counter-public-final PLAYWRIGHT_REPORT_DIR=playwright-report/counter-public-final npm run test:e2e
PLAYWRIGHT_BASE_URL=https://k-hiphop-map.vercel.app PLAYWRIGHT_OUTPUT_DIR=test-results/redesign-public-loading PLAYWRIGHT_REPORT_DIR=playwright-report/redesign-public-loading npx playwright test tests/performance.spec.ts --grep 'five fresh'
```

### Verified behavior and build

- `npm run build` completed with the default Turbopack build, including snapshot generation, launch validation and **2,618 static pages**. Map transport and every artist/recording detail envelope carry the same version. The two existing shared-ISRC review warnings remain; there are no validation errors.
- **75/75 Vitest tests**, **10/10 Python collector tests**, TypeScript and the native visitor API check passed. The API check performs no production-counter writes.
- The built export at `http://127.0.0.1:54954` passed **67 browser tests in 2.2 minutes**, with one intentional desktop-only skip for a touch gesture. Port 3100 belonged to another project; no result from that port is used here. Evidence: `test-results/redesign-release/` and `playwright-report/redesign-release/`.
- Coverage includes source-backed selection and edges, actual node drag and cancellation, filters and worker layout, keyboard/IME search, history and shared state, list fallback, detail retry and version mismatch, optional trailer playback/error/rotation/focus, and visitor-counter failure handling.
- Axe found **zero violations** in the checked expanded artist and filter-dialog states on desktop and mobile emulation (`wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`). This is an automated check, not a complete accessibility audit.
- Responsive captures cover **360, 390, 768, 1024 and 1440 CSS pixels**. Manual Chrome inspection also covered a **390×600** short viewport, with the lower evidence, attribution and timeline controls reachable by scrolling. Mobile expansion fills the map workspace while keeping search available at normal viewport heights.
- Built canonical links were checked for `/`, `/map/` and `/artists/garion/`; the sitemap has one canonical map entry.

The initial map JSON decreased from **6,270,746 to 3,777,055 uncompressed bytes (39.8%)**. Validation compares nodes and edges from the actual compact transport against the full catalog across three periods and both core/extended scopes. Recording titles and sources now come from validated detail chunks. This size comparison is not a network-speed measurement.

### Native rendering measurement

The final stress run was sequential, with no capture/render job or source edits in progress. Local environment: macOS, Node **26.0.0**, Chrome **154.0.8037.97**, Next.js **16.3.8** and **ANGLE Metal / Apple M4**. CI uses Node 22 and software WebGL for functional checks, not native GPU performance.

| Viewport | Three measured runs | Median | Required median |
| --- | --- | --- | --- |
| Desktop 1600×1000 | 44, 59, 59 fps | 59 fps | ≥45 fps |
| Mobile emulation 390×844 | 58, 60, 60 fps | 60 fps | ≥30 fps |

All six measurements retained exactly 1,000 nodes and 10,000 ties. The desktop's first run was below 45 fps; the defined acceptance criterion is the three-run median, not every frame or run. This establishes the local renderer check only. Evidence: `test-results/redesign-stress-final/` and `playwright-report/redesign-stress-final/`.

### Initial loading and throttled diagnostic

Five fresh HTTP-cache contexts per viewport used the built static server, empty storage, the same reused browser process and no network throttling. Readiness means a positive Sigma node count after initialization; all portraits need not have finished loading. The trailer was never opened.

| Viewport | Five map-ready samples (ms) | Median | Empirical p95 / maximum |
| --- | --- | --- | --- |
| Desktop | 518, 550, 468, 488, 481 | 488 ms | 550 ms |
| Mobile emulation | 486, 498, 487, 532, 559 | 498 ms | 559 ms |

Both passed the existing 3,000 ms local readiness check, with zero page errors or failed same-origin responses. Evidence: `test-results/redesign-loading-final/` and the matching Playwright report. These are local-server measurements, not public-network or field percentiles.

One separate mobile diagnostic applied **1.6 Mbps download, 150 ms latency and 4× CPU slowdown**. Map readiness was **6,526 ms**; filling a search and waiting for a visible result took **494 ms including automation overhead**. The latter is not a pure input-to-paint or search-algorithm measurement. This diagnostic has no pass/fail performance threshold and must not be presented as a physical-phone result. Its JSON receipt is in `test-results/redesign-artifacts-final/`; the same run generated the final README images.

Reproduce the browser evidence after building and starting the static export on an available port:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:54954 npm run test:e2e
PLAYWRIGHT_BASE_URL=http://127.0.0.1:54954 npx playwright test tests/performance.spec.ts --grep 'five fresh'
PLAYWRIGHT_BASE_URL=http://127.0.0.1:54954 npx playwright test tests/artifacts.performance.spec.ts
```

### Media and documentation

Revision 3 uses new recordings of native selection and node dragging from the redesigned service. Both encoded MP4s passed delivery validation: **30 seconds, 900 frames, H.264/yuv420p, 30 fps and 48 kHz AAC**. Landscape is **4,936,905 bytes** at 1280×720; portrait is **4,967,268 bytes** at 720×1280. Contact sheets were visually inspected in both orientations. The existing original score was reused; this release did not perform a new subjective listening audit.

Encoding evidence is committed in `public/media/trailer/v3/manifest.json`; capture receipts and contact sheets remain in ignored `.cache/trailer/captures/` and `.cache/trailer/renders/`. The browser suite checks actual video decoding and completion. Earlier versioned assets remain available.

README screenshots show the real built interface and an unavailable visitor API, with no invented visitor total. Local documentation links and Korean/English shell-command parity pass `npm run docs:check`. Documentation images are in `docs/images/`; screenshot generation and throttled diagnostics are reproducible with `tests/artifacts.performance.spec.ts`.

### Remaining human and device checks

Physical iOS/Android hardware, Safari, VoiceOver/TalkBack and actual browser zoom at 200% remain **unverified**. Responsive and touch emulation on the development computer must not be described as physical-device testing. Public readiness above covers one computer and connection, not field performance across users or devices.

A five-person usability session remains to be run. Give each person the same five tasks without procedural hints: find an artist, open a collaboration's source, inspect a specified year range, find a two-step path, and restore a shared view. Record completion, time, assistance and the point of failure for each task. Use anonymous participant codes, and report observed results rather than marking this session complete from automated tests.

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

Public interaction verification at [the main service](https://k-hiphop-map.vercel.app/map/) passed **13 applicable checks with one intentional desktop touch skip, from 14 scheduled cases, in 43.2 seconds**. Runtime commit: `7045dd6`; ready production deployment: `dpl_7pgg7fBH73Tw4RJ7NVrR6KXYDZUC` ([deployment URL](https://k-hiphop-labui5tn9-taehyeong-lims-projects.vercel.app/map/)). This targeted public run covered focused geometry, shared filtered/path URLs, mouse dragging, reduced motion, trusted touch, and cancellation on the same native Metal browser configuration. Focus checks recorded no page exceptions, HTTP failures, or horizontal overflow. Public desktop/mobile focused screenshots were inspected and show the neighbors clear of the banner. The full source/archive/bootstrap/fallback scenarios passed in the preceding final static run.

[Linux/Node 22 CI for the interaction commit](https://github.com/taehyeonglim/k-hiphop-map/actions/runs/36883521159) also passed: 27 unit tests and all 33 applicable browser scenarios, with the same intentional desktop touch skip. The browser suite completed in 4.3 minutes using software WebGL; no failures or flaky retries were reported.

```sh
PLAYWRIGHT_BASE_URL=https://k-hiphop-map.vercel.app PLAYWRIGHT_OUTPUT_DIR=test-results/focus-interaction-public PLAYWRIGHT_REPORT_DIR=playwright-report/focus-interaction-public npx playwright test tests/e2e.spec.ts --grep 'selected neighborhoods|shared filtered URL|dragging a collaborator|reduced motion|real touch gesture|cancelled mouse|shortest-path'
```

Public artifacts are in `test-results/focus-interaction-public/` and `playwright-report/focus-interaction-public/`, using the same focused/held screenshot filenames. The earlier public loading and stress measurements above describe the initial release and do not measure the new dragging interaction. No physical-mobile performance claim follows from the touch-input verification.

## First-visit trailer — 2026-10-02

The final built-static export at `http://127.0.0.1:3100` passed **59 applicable checks, with one intentional desktop touch skip, from 60 scheduled cases, in 1.9 minutes**. This consists of all 26 new trailer scenarios (13 for each viewport) plus the existing 33 applicable map scenarios. The source catalog remains `2026.10.01-73d5c2c3-c92fd5a3`. Native Chrome uses the Apple M4 ANGLE Metal renderer; mobile results are browser viewport/touch emulation.

The first-visit tests hold the map JSON download while the actual muted MP4 decodes and its playback clock advances. The overlay stays open when the real map becomes ready underneath. Immediate close works before map download, pauses the video, removes its source, records the visit, and allows a subsequent visit with zero MP4 requests. A real seek/play operation reaches the browser's `ended` event and closes the introduction; no synthetic media event is used.

Replay preserves the selected artists, visible ties, world coordinates, camera, filters, and shared URL while supporting sound, pause, resume, and immediate map entry. Keyboard tests exercise background `inert`, Tab/Shift+Tab containment, Escape closure, and focus restoration. Artist, period, and list URLs enter the map without requesting media; an empty artist or unrelated campaign query still receives the unseen introduction. A same-document Next link from credits verifies the first client-side return to the map. Restricted storage reads and writes skip automatic playback while preserving manual replay.

Reduced motion shows a poster with **zero MP4 requests before explicit Play**. The manual state leaves the video source unassigned, since `preload="none"` alone did not prevent a browser request in the initial diagnostic run. A real aborted media download exposes a usable map exit and successfully retries playback. Rotation swaps the real landscape/portrait MP4 while retaining a paused position at seven seconds and the unmuted preference, then resumes correctly. All trailer scenarios completed without uncaught page errors.

```sh
npm run build
npm start -- --listen 3100
# Run in another terminal after the static server is ready:
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 PLAYWRIGHT_OUTPUT_DIR=test-results/trailer-static PLAYWRIGHT_REPORT_DIR=playwright-report/trailer-static npm run test:e2e
```

Functional artifacts are in `test-results/trailer-static/` and `playwright-report/trailer-static/`. Separate visual checks inspected the decoded final slogan at approximately 26 seconds and the closed map at 1600×1000, 390×844, 320×700, and 844×390 CSS pixels. The exact creator link `임태형 a.k.a. Lyricist` and its GitHub destination, non-overlapping 44px close control, complete frame, and map header remain visible. These checks recorded no horizontal overflow, page exceptions, or same-origin HTTP failures. Captures and geometry are in `test-results/trailer-visual-static/`: `{desktop,mobile,narrow,landscape}-finale-26s.png`, the corresponding `-map-closed.png`, and `visual-evidence.json`. The intro captures use viewport screenshots so the fixed overlay is represented at the actual visible screen size.

Separate built-static WebKit checks at 1440×900 and 390×844 verified advancing muted inline playback, explicit sound, actual ended closure, paused/source-cleared cleanup, stored visit, and zero MP4 requests on revisit. WebKit also verified the reduced-motion poster without a media request and the paused/unmuted seven-second position after rotation to 844×390. Evidence is `.cache/trailer/webkit-qa.json`; no page errors were recorded. This validates the WebKit engine on this computer and does not certify physical iPhone Safari.

Both shipped films are exactly 30 seconds / 900 frames at 30fps, using H.264 yuv420p video and AAC 48kHz audio, with fast-start metadata before media data. Landscape is 5,032,863 bytes; portrait is 4,996,723 bytes. The browser suite verifies media behavior and frame delivery; film content, asset sources, and audio were separately reviewed by the production agents. Existing map/performance contexts now explicitly mark the trailer as seen. Their readiness measurement excludes first-visit viewing, and the older loading/FPS measurements above are not new trailer performance measurements.

The production release at [the main service](https://k-hiphop-map.vercel.app/) passed **all 26 trailer scenarios in 1.1 minutes**, followed by **five applicable neighborhood/drag/touch checks with one intentional desktop touch skip, from six scheduled cases, in 22.7 seconds**. Total public acceptance is 31 applicable checks from 32 scheduled cases. Runtime commit: `c6f667205c34bff784d2bd5164ae92ab18374e4b`; ready deployment: `dpl_36cKWGjnft9qBTLNz6fXsYhF6mmq`. Public real-media playback, closure, replay, shared-link/storage rules, manual reduced-motion playback, error recovery, client navigation, and rotation all passed with no uncaught page errors. Public screenshots of actual decoded film frames, closed maps, focused neighbors, and held-node dragging were inspected. The preceding full static run provides the unchanged source/archive/bootstrap/fallback acceptance.

```sh
PLAYWRIGHT_BASE_URL=https://k-hiphop-map.vercel.app PLAYWRIGHT_OUTPUT_DIR=test-results/trailer-public/trailer PLAYWRIGHT_REPORT_DIR=playwright-report/trailer-public/trailer npx playwright test tests/trailer.e2e.spec.ts
PLAYWRIGHT_BASE_URL=https://k-hiphop-map.vercel.app PLAYWRIGHT_OUTPUT_DIR=test-results/trailer-public/map PLAYWRIGHT_REPORT_DIR=playwright-report/trailer-public/map npx playwright test tests/e2e.spec.ts --grep 'selected neighborhoods|dragging a collaborator|real touch gesture'
```

Public browser artifacts are in `test-results/trailer-public/{trailer,map}/` and the matching `playwright-report/trailer-public/` directories. Separate HTTP delivery verification confirmed home/credits HTTP 200 and that both complete MP4 downloads match the final local byte counts and SHA-256 hashes. Both return `video/mp4`, support a correct HTTP 206 response for bytes 0–1023, and send `Cache-Control: public, max-age=31536000, immutable`; delivery evidence is `.cache/trailer/public-delivery-qa.json`.

[Linux/Node 22 CI for runtime commit `c6f6672`](https://github.com/taehyeonglim/k-hiphop-map/actions/runs/36889108145) passed all required steps: catalog validation, type checking, 27 unit tests, 10 collector tests, production build, and **59 applicable browser scenarios with one intentional desktop touch skip from 60 scheduled cases**. The browser suite completed in 7.1 minutes using software WebGL; no failures or flaky retries were reported. The complete CI log is preserved locally in `.cache/trailer/linux-ci.log`, and the run includes its downloadable `browser-evidence` artifact.

## Garion trailer label correction — 2026-10-02

Runtime revision `2c944a4` centers both `가리온` and `GARION` on the Garion portrait in the roots scene, separates the labels from its circle, and gives the Garion close-up node label an eight-pixel gap. The player and credits now use `/media/trailer/v2/` to avoid stale immutable MP4 caches. Revision 1 links and the existing seen-visit marker remain valid.

All **26 trailer browser cases passed in 58.9 seconds** against the updated development server, with no failures, retries, or uncaught page errors. Four frames decoded from the final v2 MP4s, at 3.7 and 6.2 seconds in both orientations, were visually inspected and show centered names without clipping. Type checking passed. Browser artifacts are in `test-results/trailer-garion-v2/browser/`, its HTML report is `playwright-report/trailer-garion-v2/`, and decoded frames are in `test-results/trailer-garion-v2/frames/`. Both movies retain 900 frames, 30 seconds, H.264 yuv420p, and AAC 48 kHz audio; final bytes are 5,037,282 landscape and 4,997,440 portrait.

The corrected production build passed and is live at [the main service](https://k-hiphop-map.vercel.app/), deployment `dpl_HYiWfL48AGxF6mEHKAtMLvSBuvsH`. Fresh desktop and portrait browser contexts loaded the respective v2 movie, advanced in muted playback, displayed the corrected scene, and closed with the seen marker stored, without page errors. Both public downloads match the final local SHA-256 hashes and return `video/mp4`, immutable cache headers, and correct HTTP 206 byte ranges. Public screenshots and exact delivery evidence are in `test-results/trailer-garion-v2/public/`. Both local 1080p masters were also regenerated and their decoded 6.2-second frames visually checked.

## Persistent visitor counter — 2026-10-02

The counter describes cumulative browser/day registrations, with one registration per browser per Korean calendar day. Completed local validation passed **63/63 unit tests**, type checking, and the native Node ESM API compile/import/request check. The latter imports the emitted handler and verifies an unsupported `DELETE` returns HTTP 405 without a counter write. Unit coverage includes canonical-origin registration, signed-cookie deduplication, Korean midnight rollover, invalid provider data, storage failures, crawler exclusion, and client registration policy.

Targeted native Chrome browser validation passed **10/10 cases in 32.3 seconds**. API responses were intercepted with test fixtures so this verification made no actual public visitor increments. While the map JSON was held, the pending counter displayed `—`, then formatted the confirmed fixture `12345` as `12,345`; replacing the bootstrap with the map issued exactly one GET. A failed response stayed unknown, and explicit retry displayed a genuine API zero. Malformed numeric/counting payloads never fabricated a total or overwrote the prior day marker. Restricted browser storage remained compatible with a valid preview GET. Production POST/cookie behavior is covered by the unit tests, rather than claimed from these mocked preview checks.

The complete built-static suite passed **69 applicable cases with one intentional desktop touch skip, from 70 scheduled scenarios, in 2.3 minutes**. This includes the existing map and trailer regressions plus the counter cases. Native-GPU screenshots and geometry checked five-digit and ten-million fixture totals at 320, 390, 760, 1000, and 1600 CSS-pixel widths. The full creator link, counter, replay, and share controls remain within the header without overlap or horizontal overflow. The added header row leaves selected Garion neighborhood centers clear of the actual opaque controls. Mobile checks are viewport/touch emulation on the same computer, not physical-device validation.

```sh
npm run typecheck
npm test
npm run api:check
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 PLAYWRIGHT_OUTPUT_DIR=test-results/visitor-counter PLAYWRIGHT_REPORT_DIR=playwright-report/visitor-counter npx playwright test tests/visitor-counter.e2e.spec.ts
# After building and starting the static export on port 3100:
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 PLAYWRIGHT_OUTPUT_DIR=test-results/visitor-counter-static PLAYWRIGHT_REPORT_DIR=playwright-report/visitor-counter-static npm run test:e2e
```

Targeted artifacts are in `test-results/visitor-counter/` and `playwright-report/visitor-counter/`; complete static artifacts are in `test-results/visitor-counter-static/` and the matching HTML-report directory. Counter result directories contain bootstrap screenshots, `counter-{12345,10000000}-{width}-{project}.png`, and attached header geometry. Compiled native API artifacts are in `.cache/visitor-api-check/`; `npm run api:check` is also included in CI.

The first counter deployment, revision `8210871`, returned HTTP 500 with `ERR_MODULE_NOT_FOUND` because the emitted ESM handler retained an extensionless import, despite a successful static build. The handler now explicitly imports `../server/visitor-counter.js`, and the native emitted-module check prevents that deployment failure from being hidden by unit-test bundling. All visitor API responses use `Cache-Control: no-store`.

Corrected runtime revision: `d8569df`. Public acceptance on [the main service](https://k-hiphop-map.vercel.app/map/) used the actual persistent API, without response mocks, in desktop 1600×1000 and mobile-emulation 390×844 browser contexts. The initial GET returned a genuine zero. Each fresh context registered one visit, producing totals 1 and 2; each subsequent refresh read the same total. Clearing the local day marker and denying visitor-marker storage both issued POST requests that returned `counted: false`, demonstrating server-cookie deduplication. The receipt was Secure, HttpOnly, and SameSite=Lax. Both contexts displayed the exact confirmed count, retained the correct creator link, initialized the map, and recorded no page errors or horizontal overflow. Screenshots were visually inspected. A foreign-Origin POST returned HTTP 403.

Public evidence is `test-results/visitor-counter-public/evidence.json`, `desktop.png`, and `mobile.png`. These two real QA browser visits are part of the persistent total; the counter was not reset. Acceptance ran after the Git-triggered production deployment of `d8569df`; the subsequent CLI deployment of the same runtime, `dpl_7t6MY5VSZfy6G5atwokohAfcvywC` ([deployment URL](https://k-hiphop-59hefcqk0-taehyeong-lims-projects.vercel.app/map/)), also reached READY. A final main-service GET after that deployment returned HTTP 200, `Cache-Control: no-store`, and the unchanged total of 2, confirming persistence across deployment. The Linux CI run for this revision was still running when this acceptance evidence was recorded; the passed local/static and public checks above are the release evidence.

## Early release archive and all-artist portrait survey — 2026-10-04

Data version: `2026.10.04-04b40bb2-907d4fa2-map2`. The catalogue contains 2,756 artists, 4,017 releases and 13,099 recordings; 457 releases from 1995–2009 have full source track-position inventories. Inventories retain instrumental/MR and unresolved-credit entries and are not a claim that every performer is verified. Twenty-two recording-level reviews document supported performance and instrumental/production roles. The 2000 대한민국 alternative registration retains its list but holds 13 conflicting recording entries out of graph aggregation. Reviewed Young GM links resolve to Bizniz, including the previous artist URL.

Every current artist has a dated portrait review with a next action; none is unsearched. The published catalogue has 633 portraits (previously 160), including 120 of 268 core artists (previously 116). Each of the 532 staged photo candidates has an explicit image-byte-bound decision; 474 were approved and 58 held. One approved asset replaces an existing portrait lookup, so the catalogue gains 473 portraits. Official/profile discovery retains 67 URL checks separately, including failures and images that may be covers or logos. Those discoveries do not grant reuse permission. The public coverage registry and credits are generated from the reviewed data and actual local assets.

Completed non-browser checks: **79/79 unit tests, 21/21 collector regressions, 3/3 portrait publication/identity tests**, TypeScript, native visitor API import/request validation, documentation links/command parity, and the data launch gate. The static production build generated **6,783 pages**. Validation checks complete-track counts, bidirectional recording/release references, photo files/attribution, all-artist registry coverage, and shared versions across map, artist/recording chunks, album index and coverage data. Two existing conflicting-ISRC warnings remain explicitly unresolved.

Visual inspection covered album search, MP 2004 detail, coverage and the selected map at 1600×1000, 390×844 and 320×700. All twelve surfaces had no horizontal overflow or uncaught page errors. Automated WCAG A/AA checks on the three new archive surfaces at desktop and mobile widths reported zero violations after correcting muted-text contrast. These are native Chrome checks with viewport/touch emulation, not physical mobile device certification. Artifacts are `test-results/archive-visual/` and its `evidence.json`; the reviewed album capture is also in `docs/images/album-mobile.webp`.

The graph interaction fixture now distinguishes choosing among overlapping visible portraits from probing a hidden node's position. A cancelled or reduced-motion gesture can clear hover, so explicit single-node scenarios are verified by trusted click/drag outcomes rather than an incidental hover event. The neighborhood, collaborator drag, reduced-motion and cancellation scenarios passed **8/8** in the targeted final rerun (`test-results/archive-gestures-final/`). Product interaction assertions were retained.

The complete final built-static acceptance run passed **75 applicable cases with one intentional desktop-touch skip, from 76 scheduled cases, in 2.4 minutes**, with no retries or failures. It covers album/Hanja search and URL restoration, full compilation lists, recovered five-person MP 2004 credits, source-only albums, coverage, index failure/retry, existing map/gesture behavior, trailer, accessibility and visitor-counter regressions. Counter requests were intercepted, so these tests did not add public visits. Artifacts: `test-results/archive-acceptance/` and `playwright-report/archive-acceptance/`.

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 PLAYWRIGHT_OUTPUT_DIR=test-results/archive-acceptance PLAYWRIGHT_REPORT_DIR=playwright-report/archive-acceptance npm run test:e2e
```

Production runtime revision **`f283f88891f0100b8e8d85428622440da7eca8f7`** was built from a clean tracked-file export and promoted as **`dpl_D2BTCKJ8Ge5aTKDuA4YqgmhBT5E7`** to [the main service](https://k-hiphop-map.vercel.app/). The initial CLI archive upload was cancelled after generated directory entries inflated its size; no deployment was promoted from that upload. Excluding directory names themselves fixes that source-boundary issue. The successful deployment passed Vercel's data/type/build gates and authenticated pre-promotion checks.

Public HTTP verification confirmed the same map/index/coverage/artist version, 4,017 release entries, 2,756 dated photo records with 633 included and none unsearched, album pages, the legacy artist URL's canonical target, and exact SHA-256 matches for new YDG, Ahn Byeong-woong, 45RPM and Miryo photos. The visitor API retained HTTP 200, `no-store` and the existing total of 46 across promotion; verification used GET, with no registrations. Delivery evidence is `.cache/archive-run/public-delivery.json` and `.cache/archive-run/preview-checks.json`.

All **8 public archive browser cases passed in 8.1 seconds** on desktop and mobile emulation. Their evidence is in `test-results/archive-public/` and `playwright-report/archive-public/`. Local static evidence covers the complete 75-case acceptance suite; production checks are reported separately.

A further **4/4 public map checks passed in 14.0 seconds** for identity/alias search and source-backed selected neighborhoods on desktop and mobile emulation. Evidence: `test-results/archive-public-map/` and `playwright-report/archive-public-map/`. Combined public browser acceptance is 12 applicable cases, with no failures.
