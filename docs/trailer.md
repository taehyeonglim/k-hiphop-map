# 한국힙합 연결고리 — 30-second trailer

Creator: **임태형 a.k.a. Lyricist** ([profile](https://github.com/taehyeonglim)). The trailer introduces the archive through real artist photographs, source-backed collaboration data and recordings of the working service. Its original instrumental moves from boom-bap percussion to a trap section across twelve bars.

## Storyboard

The film lasts exactly 30 seconds at 30 fps. One 96 BPM bar in 4/4 lasts 2.5 seconds, so the visual cuts align with the twelve-bar score.

| Time | Bars | Picture and purpose |
| --- | --- | --- |
| 0–2.5 s | 1 | Opening typography introduces a connection made by one song. |
| 2.5–7.5 s | 2–3 | “씬을 만든 목소리들.” Garion and Drunken Tiger introduce the early scene. |
| 7.5–12.5 s | 4–5 | “함께 만든 곡이, 연결을 만든다.” Six actual Garion ties and recording titles explain a source-backed connection. |
| 12.5–20 s | 6–8 | “한 명을 누르면 연결이 보인다.” / “당기면 씬이 움직인다.” Actual product footage shows selection and elastic node dragging. |
| 20–25 s | 9–10 | “1995—지금. 세대를 잇다.” CHANGMO, BewhY and Lee Young-ji appear above the real full-period network. |
| 25–30 s | 11–12 | The map becomes an invitation to explore, with project and creator credit. |

The renderer has independently composed landscape and portrait scenes. The portrait version rearranges typography, portraits and graph elements instead of cropping the landscape film. Artist photographs remain documentary images; their presence does not imply participation in or endorsement of the trailer.

## Reproduce the assets and film

Use Node.js 22+, Python 3.11+, FFmpeg/ffprobe on `PATH`, and Google Chrome or an installed Playwright Chromium. The pinned NumPy/SciPy soundtrack dependencies require Python 3.11 or later; font preparation requires fontTools and Brotli. `sharp` and Playwright are installed by `npm ci`.

```sh
npm ci
python3 -m pip install -r scripts/trailer/requirements.txt
python3 -m pip install fonttools brotli
npm run data:build
npm run dev
```

Keep the application running on port 3000. In a second terminal:

```sh
npm run trailer:render
```

The command runs `prepare-assets.mjs` → `beat.py` → `capture.mjs` → `render.mjs`. It prepares source-attributed photos and the Korean font, synthesizes the score, captures the live local product, and renders both web films. An alternate running site can be selected explicitly:

```sh
TRAILER_BASE_URL=http://127.0.0.1:3100 npm run trailer:render
```

`PLAYWRIGHT_CHROME_PATH` selects a Chrome executable for product capture. On machines without a Chrome executable available to the scripts, install the fallback browser with `npx playwright install chromium`.

After the preparation, audio and capture outputs exist, individual render passes can be run without recapturing the product:

```sh
node scripts/trailer/render.mjs --format landscape
node scripts/trailer/render.mjs --format portrait
node scripts/trailer/render.mjs --preview
node scripts/trailer/render.mjs --master
```

`--format all` is the default. `--preview` produces contact-sheet frames for visual review. The optional 1080p masters belong in ignored `.cache/trailer/masters/`; only the smaller web videos and posters are deployed. Raw captures, full-resolution photo inputs, frames and the PCM audio also stay under ignored `.cache/trailer/`.

The font input is pinned to the [Google Fonts revision recorded in the manifest](https://github.com/google/fonts/blob/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf). Its WOFF2 subset is renamed **K HipHop Trailer Sans**, and the upstream copyright/OFL notice is included. Photo preparation uses the existing verified portrait inventory, preferring cached originals. The audio uses seed `19952026` and a 48 kHz grid. Browser captures reflect the running catalog and interface, so a different service version can produce different captured frames.

## Outputs

| Asset | Format and purpose | Repository file |
| --- | --- | --- |
| Landscape web film | 1280×720, 30 fps, 30 seconds; each MP4 under 8 MB | [landscape.mp4](../public/media/trailer/v3/landscape.mp4) |
| Portrait web film | 720×1280, 30 fps, 30 seconds; each MP4 under 8 MB | [portrait.mp4](../public/media/trailer/v3/portrait.mp4) |
| Landscape poster | Static WebP fallback | [poster-landscape.webp](../public/media/trailer/v3/poster-landscape.webp) |
| Portrait poster | Static WebP fallback | [poster-portrait.webp](../public/media/trailer/v3/poster-portrait.webp) |
| Source receipt | Authors, source links, licenses and transformations | [credits.json](../public/media/trailer/v3/credits.json) |

Public downloads: [landscape MP4](https://k-hiphop-map.vercel.app/media/trailer/v3/landscape.mp4) and [portrait MP4](https://k-hiphop-map.vercel.app/media/trailer/v3/portrait.mp4). Attribution and the accessible text description are available at [/credits/#trailer](https://k-hiphop-map.vercel.app/credits/#trailer).

Revision 2 centers both `가리온` and `GARION` on the Garion portrait in the roots scene, with clear space between the name and circle. The versioned URL prevents an immutable cached revision 1 movie from hiding the correction. Revisions 1 and 2 remain available for existing links. Revision 3 uses explicit playback and ignores the old seen-visit storage key.

## Original score

**1995 → NOW — Original Trailer Beat**, for 임태형 a.k.a. Lyricist: 96 BPM, 4/4, twelve bars, 30 seconds, F♯ minor. All sounds are synthesized in `scripts/trailer/beat.py`: original keyboard chords and motif, kick/snare/hat/clap, procedural vinyl hiss, warm bass, gliding 808 and spatial delays. There are no third-party recordings, loops, artist voices or audio samples.

The intermediate `.cache/trailer/beat.wav` is stereo 48 kHz, 24-bit PCM. The script writes `.cache/trailer/beat-analysis.json`, including the source seed, section markers, duration, loudness, true peak and clipping count. The score is normalized around −14 LUFS with peak headroom; the encoded MP4 audio must be checked separately because encoding can change the measured peak.

## Optional playback

The map opens immediately, including first visits and shared links. **30초 소개 영상** is the only way to open the introduction. The overlay, poster and MP4 are lazy-loaded after that request. The previous `khiphopmap:trailer:v1:seen` value is ignored, and no storage probing or first-paint script controls the experience.

Playback starts muted and inline after opening. Sound, pause, close and direct map entry remain available. Autoplay rejection displays the poster and a play button; a media failure offers retry. Reduced motion waits for an additional explicit play action. Orientation changes choose the matching film and preserve playback position and sound preference. Closing or completing the video restores the trigger's keyboard focus and preserves the map's selection and filters.

Revision 3 captures the redesigned search, map and mobile sheet. Rendering reads the reviewed enriched catalog for recording titles; it must not infer titles from the lean map transport. Previous version directories remain available for existing links.

## Attribution and reuse

The video credit page retains the full existing service portrait list and separately renders the fourteen photographs selected for the film. `credits.json` records each title, author, original file URL, license URL and transformations: proportional resizing, WebP conversion, clipping, and animated positioning/scaling. The roots scene also applies grayscale and a 1.12 contrast adjustment to the Garion and Drunken Tiger portraits; other appearances retain their original color. Its full service photo inventory is an attribution inventory, not a claim that every listed photo appears in every shot.

Photographs retain their individual CC BY or CC BY-SA terms. Applicable share-alike conditions are retained for adapted BY-SA photographic material. The original score, project graphics, photographs, font software and source data have separate rights; the project does not assign a single blanket license to the entire combined film. [Creative Commons' license guide](https://creativecommons.org/cc-licenses/) explains the attribution and share-alike conditions.

Anton and Barlow Condensed retain their included SIL OFL 1.1 notices. The Korean subset retains Adobe's upstream copyright and OFL notice, with the modified family name disclosed. OFL governs font software; it does not determine the license of artwork made with that font. See the [official OFL FAQ](https://openfontlicense.org/ofl-faq/).

The service and trailer are published as a noncommercial archive. The manifest distinguishes MusicBrainz CC0 core metadata from supplementary CC BY-NC-SA 3.0 tags/genre associations and Maniadb-derived CC BY-NC-SA 2.0 KR metadata where displayed. Those source conditions remain attached to their material. Metadata checks do not establish complete discography coverage or independent truth of every third-party credit.

## Verification

Run project checks after rendering and before publication:

```sh
npm run typecheck
npm test
npm run build
npm start -- --listen 3100
```

In another terminal, test the built export:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npm run test:e2e
```

Inspect both films and preview contact sheets for legible typography, complete group photographs, independent portrait composition, actual product interaction and correct credit. Probe MP4 duration, dimensions, streams and file sizes; listen through the complete score and its closing transition. Check that fresh, repeated and shared visits request no trailer assets; then check manual playback, genuine completion, close, restricted storage, blocked autoplay, media error, reduced motion, focus restoration and orientation switching.

This document specifies reproduction and the checks to run. It does not certify a rendered release, browser compatibility or visual QA; actual release results belong in [docs/qa.md](qa.md) with the tested commit, files and evidence paths.
