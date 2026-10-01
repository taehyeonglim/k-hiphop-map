# K-HIPHOP MAP

1995년부터 현재까지, 실제 녹음 크레딧을 바탕으로 한국 힙합의 협업을 탐험하는 비영리 웹 아카이브.

Live service: [K-HIPHOP MAP](https://k-hiphop-map.vercel.app/).

## Run locally

Requires Node.js22+ and Python3.10+.

```sh
npm ci
npm run data:build
npm run dev
```

Open http://localhost:3000. The repository includes the collected catalog and licensed portraits. Browsing the site requires no API credentials or music-service login.

## Verify and build

```sh
npm run typecheck
npm test
python3 scripts/test-collector.py
npm run data:validate:launch
npm run build
npm run test:e2e
```

`npm start` serves the exported `out/` directory on port3000. Use `npm start -- --listen 3100` for a separate production-preview port.

The launch gate requires 150+ core artists, source-backed recordings in every era, unique IDs, valid credit evidence, all local image assets with attribution, and every edge traceable to its recordings. Browser tests use installed Google Chrome or Playwright Chromium.

## Update the catalog

```sh
npm run data:collect
python3 -m pip install -r requirements.txt
python3 scripts/collect-portraits.py
npm run data:build
npm run data:validate:launch
```

The collector stores original responses, identity decisions, and review candidates in ignored data/catalog.sqlite. MusicBrainz calls are serialized and rate-limited; HTTP failures retry with backoff. data/seeds.json is the curated discovery manifest. data/pending.json records ambiguity; unresolved identities never produce accepted ties. Source-confirmed official additions and corrections belong in data/official.json. The scheduled workflow gathers a candidate artifact for review; publication uses the checked-in reviewed catalog.

## Data flow

Collectors → SQLite cache and evidence → data/catalog.json → deterministic full-period ForceAtlas2 + weighted Louvain → public/data/map.json, graph.json and per-artist/per-recording detail chunks → static Next.js site.

The initial HTML carries a small versioned summary. The browser loads the map dataset separately, then fetches artist and recording evidence when selected. Interrupted downloads can be retried; a changed dataset version prompts a page refresh.

- Tie thickness: logarithmic unique co-recording count.
- Layout: ensemble-size correction and strength normalization; static full-period positions, optional worker recalculation for the selected period.
- Scope: rap/vocal artist credits; groups are separate entities, membership does not infer individual performances.
- First-release years drive timeline filters; repeat releases do not add ties.
- Core Korean hip-hop nodes plus optional one-hop collaborators.
- No audio or lyrics are hosted. Listening links point to external services.
- Coverage counts describe collected evidence, not exhaustive discography completeness.

## Deployment

The application exports to out/. `vercel --prod` publishes with the authenticated Vercel account. vercel.json runs the full npm build lifecycle, including snapshot generation and launch validation. NEXT_PUBLIC_SITE_URL sets absolute metadata URLs at build time. Every production update runs data validation, typechecking, unit tests, build and browser smoke checks. To revert, promote the previous ready Vercel deployment; catalog.json is versioned separately from generated snapshots.

## Attribution

Code is MIT. Music metadata has its own source-specific terms: [MusicBrainz core metadata is CC0, while supplementary tags and genre associations retain CC BY-NC-SA 3.0](https://musicbrainz.org/doc/About/Data_License). This distinction also applies to the cached profiles in data/artist-metadata.json and derivatives of supplementary data. maniadb-derived data retains CC BY-NC-SA 2.0 KR. Do not assume the code license relicenses data, photographs, or source material. Each included image carries author, file page, license URL, and transformation details. Local fonts are Anton and Barlow Condensed, under SIL Open Font License; their licenses are in public/fonts/.

The site exposes /methodology/, /credits/, /artists/<id>/ and direct recording-source links. For corrections, open an issue with artist, recording, and a verifiable source URL.
