#!/usr/bin/env python3
"""Collect source-attributed, reusable Wikimedia portraits for catalogue artists.

Run: python3 scripts/collect-portraits.py --input data/seeds.json
Requires Pillow; requests are deliberately sequential and cached. This collector
does not infer permission from a search result or use Wikipedia fair-use images.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import io
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

try:
    import cv2
    import numpy as np
except ImportError:
    cv2 = None

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache' / 'portraits'
DESTINATION = ROOT / 'public' / 'images' / 'artists'
OUTPUT = ROOT / 'data' / 'portraits.json'
USER_AGENT = 'KHipHopMap/0.1 (https://github.com/taehyeonglim; Wikimedia portrait attribution)'

# Disambiguated Wikipedia article names, not arbitrary search-result matches.
ARTICLE_OVERRIDES = {
    'garion': 'Garion (band)', 'drunken tiger': 'Drunken Tiger',
    'dynamic duo': 'Dynamic Duo (South Korean duo)',
    'supreme team': 'Supreme Team (band)', 'crush': 'Crush (singer)',
    'zion.t': 'Zion.T', 'dean': 'Dean (South Korean singer)',
    'dok2': 'Dok2', 'e sens': 'E Sens', 'simon dominic': 'Simon Dominic',
    'b-free': 'B-Free', 'swing': 'Swings (rapper)', 'swings': 'Swings (rapper)',
    'the quiett': 'The Quiett', 'bewhy': 'Bewhy', 'changmo': 'Changmo',
    'loopy': 'Loopy (rapper)', 'nafla': 'Nafla', 'ash island': 'Ash Island',
    'penomeco': 'Penomeco', 'bobby': 'Bobby (rapper)', 'b.i': 'B.I',
    'zico': 'Zico (rapper)', 'mino': 'Mino (rapper)', 'miryo': 'Miryo',
    'jessi': 'Jessi (musician)', 'haon': 'Haon', 'gaeko': 'Gaeko',
    'choiza': 'Choiza', 'double k': 'Double K (musician)',
    'giriboy': 'Giriboy', 'san e': 'San E', 'loco': 'Loco (rapper)',
    'sleepy': 'Sleepy (rapper)', 'dindin': 'DinDin', 'sik-k': 'Sik-K',
    'dpr live': 'DPR Live', 'dpr ian': 'DPR Ian', 'ph-1': 'PH-1',
    'heize': 'Heize', 'jvcki wai': 'Jvcki Wai', 'punch': 'Punch (singer)',
    'huh': 'Huh (rapper)', 'yungin': 'Yungin', 'yang dong geun': 'Yang Dong-geun',
    'gil': 'Gill (musician)', 'gary': 'Gary (rapper)',
    'gray': 'Gray (singer)', 'iron': 'Iron (rapper)',
    'keem hyo-eun': 'Kim Hyo-eun (rapper)', 'yankie': 'Yankie (rapper)',
    'nada': 'Nada (rapper)',
}

# Visually reviewed focal positions for stage/profile photographs where a
# frontal-face detector misses the artist or detects clothing. Coordinates are
# normalized x/y; the last value is square side / original image width.
CROP_OVERRIDES = {
    'paloalto': (0.51, 0.13, 0.55), 'simon-dominic': (0.69, 0.22, 0.60),
    'dean': (0.60, 0.22, 0.70), 'giriboy': (0.44, 0.20, 0.75),
    'kid-milli': (0.60, 0.18, 0.70), 'jvcki-wai': (0.30, 0.45, 0.45),
    'penomeco': (0.55, 0.42, 0.65), 'zico': (0.56, 0.18, 0.65),
    'park-kyung': (0.56, 0.29, 0.50), 'big-naughty': (0.56, 0.20, 0.65),
    'okasian': (0.56, 0.36, 0.35), 'sleepy': (0.49, 0.24, 0.68),
    'basick': (0.63, 0.24, 0.80), 'bassagong': (0.62, 0.41, 0.92),
    'ra-d': (0.51, 0.17, 0.62), 'gaeko': (0.50, 0.30, 0.95),
}

# Commons description and category explicitly identify this rapper; useful
# where the Wikipedia/Wikidata infobox has no image declaration.
FILE_OVERRIDES = {'nada': 'File:Nada for Marie Claire Korea 2016 (2).jpg'}


def clean_text(value: str) -> str:
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', value))).strip()


def write_json(path: Path, value):
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(path)


def api(host: str, **params) -> dict:
    params = {'format': 'json', **params}
    query = urllib.parse.urlencode(sorted(params.items()))
    url = f'https://{host}/w/api.php?{query}'
    cache_path = CACHE / (hashlib.sha256(url.encode()).hexdigest() + '.json')
    if cache_path.exists() and time.time() - cache_path.stat().st_mtime < 30 * 24 * 60 * 60:
        return json.loads(cache_path.read_text())
    for attempt in range(6):
        try:
            time.sleep(1.05)
            request = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
            with urllib.request.urlopen(request, timeout=35) as response:
                data = json.load(response)
            if 'error' in data:
                raise ValueError(f"{host}: {data['error']}")
            cache_path.write_text(json.dumps(data, ensure_ascii=False))
            return data
        except (urllib.error.URLError, ValueError, TimeoutError) as error:
            if attempt == 5:
                raise RuntimeError(f'API request failed: {host}: {error}') from error
            retry_after = error.headers.get('Retry-After') if isinstance(error, urllib.error.HTTPError) else None
            delay = max(5, 2 ** attempt, int(retry_after or 0))
            print(f'Waiting {delay}s before retrying {host} ({error})', flush=True)
            while delay:
                interval = min(55, delay)
                time.sleep(interval)
                delay -= interval
    raise AssertionError('unreachable')


def batches(values: list, size: int = 40):
    for start in range(0, len(values), size):
        yield values[start:start + size]


def wiki_pages(titles: list[str], language: str, cached_only: bool = False) -> dict[str, dict]:
    found = {}
    batch_list = list(batches(list(dict.fromkeys(titles))))
    if cached_only:
        results = [json.loads(path.read_text()) for path in CACHE.glob('*.json')]
        batch_list = [list(dict.fromkeys(titles))] * len(results)
    else:
        results = []
    for index, batch in enumerate(batch_list):
        result = results[index] if cached_only else api(f'{language}.wikipedia.org', action='query',
                 titles='|'.join(batch), redirects=1, prop='pageprops|pageimages', piprop='name', pilicense='free')
        query = result.get('query', {})
        aliases = {row['from']: row['to'] for row in query.get('normalized', [])}
        aliases.update({row['from']: row['to'] for row in query.get('redirects', [])})
        pages = {page['title']: page for page in query.get('pages', {}).values()
                 if 'missing' not in page and 'disambiguation' not in page.get('pageprops', {})}
        for title in batch:
            resolved, visited = title, set()
            while resolved in aliases and resolved not in visited:
                visited.add(resolved)
                resolved = aliases[resolved]
            if resolved in pages:
                found[title] = pages[resolved]
    return found


def wiki_candidates(artist: dict) -> tuple[list[str], list[str]]:
    name = artist.get('nameEn') or artist.get('en') or artist['name']
    names = [name, *artist.get('aliases', [])]
    names = [n for n in names if n and not re.search(r'[가-힣]', n)][:4]
    english = []
    # Wikipedia article titles are case-sensitive after the first letter.
    # Stage names such as DON MALIK and BIGONE also occur as Don Malik/Bigone.
    for name in dict.fromkeys(n for original in names for n in (original, original.title())):
        if name.lower() in ARTICLE_OVERRIDES:
            english.append(ARTICLE_OVERRIDES[name.lower()])
        english.extend([name, name + ' (rapper)', name + ' (musician)',
                        name + ' (singer)', name + ' (band)'])
    korean = [qualified for n in [artist['name'], *artist.get('aliases', [])]
              if re.search(r'[가-힣]', n)
              for qualified in (n, n + ' (가수)', n + ' (래퍼)', n + ' (음악 그룹)')]
    return list(dict.fromkeys(english)), list(dict.fromkeys(korean))


def entities(ids: list[str]) -> dict:
    found = {}
    for batch in batches(list(dict.fromkeys(ids))):
        found.update(api('www.wikidata.org', action='wbgetentities', ids='|'.join(batch),
                         props='claims|descriptions|labels').get('entities', {}))
    return found


def eligible_entity(entity: dict, artist: dict) -> bool:
    claims = entity.get('claims', {})
    instances = [claim.get('mainsnak', {}).get('datavalue', {}).get('value', {}).get('id')
                 for claim in claims.get('P31', [])]
    if artist.get('kind') == 'person' and 'Q5' not in instances:
        return False
    if artist.get('kind') == 'group' and 'Q5' in instances:
        return False
    mbids = [claim.get('mainsnak', {}).get('datavalue', {}).get('value')
             for claim in claims.get('P434', [])]
    external = artist.get('externalIds', {})
    mbid = external.get('musicbrainz') or external.get('MusicBrainz') or artist.get('mbid') or artist.get('musicbrainz')
    if mbid and mbids:
        return mbid in mbids
    # A same-name musician in another country is still an identity conflict.
    countries = {'KR': 'Q884', 'US': 'Q30', 'CN': 'Q148', 'PH': 'Q928', 'NZ': 'Q664', 'GB': 'Q145', 'JP': 'Q17', 'CA': 'Q16', 'AU': 'Q408'}
    origin = [claim.get('mainsnak', {}).get('datavalue', {}).get('value', {}).get('id')
              for prop in ('P27', 'P495') for claim in claims.get(prop, [])]
    expected = countries.get(artist.get('country'))
    if expected and origin and expected not in origin:
        return False
    # Articles reached through an exact name/qualified-title redirect still need
    # a music-related entity, e.g. prevent Mino (city) and Crush (drink) matches.
    descriptions = ' '.join(row['value'] for row in entity.get('descriptions', {}).values())
    musician = bool(re.search(r'rapper|musician|singer|hip.?hop|music(al)? (duo|group)|힙합|래퍼|가수',
                             descriptions, re.IGNORECASE))
    korean = bool(re.search(r'Korea|한국|대한민국|корей|corean', descriptions, re.IGNORECASE))
    return musician and (artist.get('country') != 'KR' or korean)


def reusable_metadata(file_title: str) -> dict | None:
    # Some freely licensed images live locally on Wikipedia; its fair-use
    # images are still rejected by the same affirmative license checks.
    for host in ['commons.wikimedia.org', 'en.wikipedia.org', 'ko.wikipedia.org']:
        result = api(host, action='query', titles=file_title, redirects=1, prop='imageinfo',
                     iiprop='url|extmetadata|size', iiurlwidth=512)
        for page in result.get('query', {}).get('pages', {}).values():
            infos = page.get('imageinfo', [])
            if not infos:
                continue
            info = infos[0]
            metadata = info.get('extmetadata', {})
            field = lambda key: clean_text(metadata.get(key, {}).get('value', ''))
            license_name = field('LicenseShortName')
            license_url = field('LicenseUrl')
            author = field('Artist')
            allowed = re.match(r'^(CC[ -]BY([ -]SA)?[ -]\d|CC0|Public domain)', license_name, re.IGNORECASE)
            if not allowed or not license_url or not author:
                continue
            if not license_url.startswith('http'):
                license_url = 'https:' + license_url if license_url.startswith('//') else license_url
            if not license_url.startswith('https://') and not license_url.startswith('http://'):
                continue
            return {'downloadUrl': info.get('thumburl') or info['url'],
                    'originalUrl': info['url'].split('?')[0],
                    'sourceUrl': info['descriptionurl'], 'author': author,
                    'license': license_name, 'licenseUrl': license_url,
                    'fileTitle': page['title']}
    return None


def crop_square(image: Image.Image, center_x: float, center_y: float, side: float):
    side = min(side, *image.size)
    left = max(0, min(image.width - side, center_x - side / 2))
    top = max(0, min(image.height - side, center_y - side / 2))
    return image.crop((left, top, left + side, top + side)).resize((256, 256), Image.Resampling.LANCZOS)


def crop_person(image: Image.Image, position: tuple, artist_id: str) -> tuple[Image.Image, str]:
    if artist_id in CROP_OVERRIDES:
        x, y, side = CROP_OVERRIDES[artist_id]
        return (crop_square(image, x * image.width, y * image.height, side * image.width),
                'Visually reviewed face-centred square crop, resized to 256×256; colour unchanged.')
    if cv2 is not None:
        classifier = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        eye_classifier = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye_tree_eyeglasses.xml')
        gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
        boxes = classifier.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=5, minSize=(24, 24))
        boxes = [box for box in boxes if len(eye_classifier.detectMultiScale(
                 gray[int(box[1]):int(box[1] + box[3] * .65), int(box[0]):int(box[0] + box[2])],
                 scaleFactor=1.1, minNeighbors=3, minSize=(8, 8)))]
        if len(boxes):
            x, y, width, height = max(boxes, key=lambda box: int(box[2]) * int(box[3]))
            side = min(max(width, height) * 2.6, *image.size)
            center_x, center_y = x + width / 2, y + height * 0.9
            return (crop_square(image, center_x, center_y, side),
                    'Face-centred square crop, resized to 256×256; colour unchanged.')
    return (ImageOps.fit(image, (256, 256), centering=position, method=Image.Resampling.LANCZOS),
            'Upper-centred square crop, resized to 256×256; colour unchanged.')


def download_portrait(artist: dict, metadata: dict, position: tuple = (0.5, 0.08)) -> dict:
    artist_id = str(artist.get('id') or artist.get('mbid'))
    safe_id = re.sub(r'[^a-zA-Z0-9_-]', '-', artist_id)
    original_path = CACHE / ('image-' + hashlib.sha256(metadata['originalUrl'].encode()).hexdigest())
    if not original_path.exists():
        for attempt in range(4):
            try:
                request = urllib.request.Request(metadata['downloadUrl'], headers={'User-Agent': USER_AGENT})
                with urllib.request.urlopen(request, timeout=45) as response:
                    original_path.write_bytes(response.read())
                break
            except (urllib.error.URLError, TimeoutError):
                if attempt == 3:
                    raise
                time.sleep(2 ** attempt)
    with Image.open(original_path) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        if artist.get('kind') == 'group':
            image = ImageOps.pad(image, (256, 256), color='#151719', centering=(0.5, 0.5))
            crop = 'Resized to 256×256 with dark letterboxing; complete group image preserved.'
        else:
            image, crop = crop_person(image, position, artist_id)
        image.save(DESTINATION / f'{safe_id}.webp', 'WEBP', quality=88)
    return {'src': f'/images/artists/{safe_id}.webp',
            **{key: metadata[key] for key in ['originalUrl', 'sourceUrl', 'author', 'license', 'licenseUrl']},
            'crop': crop}


def load_artists(path: Path) -> list[dict]:
    source = json.loads(path.read_text())
    if isinstance(source, list):
        return source
    return source['artists']


def write_audit(artists: list[dict], portraits: dict, status: dict):
    # Report the current catalogue, not only the input seed subset.
    catalog_path = ROOT / 'data/catalog.json'
    if catalog_path.exists():
        artists = load_artists(catalog_path)
    review_path = ROOT / 'data/portrait-review.json'
    if review_path.exists():
        status = json.loads(review_path.read_text())
    def asset_for(artist):
        external = artist.get('externalIds', {})
        keys = [artist['id'], external.get('musicbrainz'), 'mb-' + external.get('musicbrainz', ''),
                external.get('mbid'), artist.get('name'), artist.get('nameEn'), *artist.get('aliases', [])]
        return next((portraits[key] for key in keys if key in portraits), None)
    present = [(artist, asset_for(artist)) for artist in artists if asset_for(artist)]
    core = [a for a in artists if a.get('core')]
    core_present = sum(bool(a.get('core')) for a, _ in present)
    counts = {}
    for artist in artists:
        state = status.get(artist['id'], {}).get('state', 'unsearched')
        counts[state] = counts.get(state, 0) + 1
    lines = ['# Portrait source audit', '',
             'This report is regenerated when reviewed candidates are published. It covers every artist in the current catalogue. '
             'Discovery does not itself approve a portrait: identity, source, rights status and the actual crop must be reviewed. Public availability does not establish reuse permission.', '',
             f'- Current catalogue artists: {len(artists)}',
             f'- Artists with a published portrait: {len(present)}',
             f"- Public-source references with unconfirmed reuse permission: {sum(asset.get('rights', {}).get('status') == 'unconfirmed' for _, asset in present)}",
             f'- Core artist coverage: {core_present}/{len(core)} ({core_present / len(core) * 100:.1f}%)' if core else '- Core artist coverage: 0',
             '- Output: 256×256 same-origin WebP files. People are cropped; group photographs retain the complete image with letterboxing. Changes are disclosed per asset.',
             '- Missing photographs use initials. An unresolved search does not establish that a photograph does not exist.', '',
             '## Survey status', '', '| State | Artists |', '| --- | ---: |']
    for state, count in sorted(counts.items()):
        lines.append(f'| {state} | {count} |')
    lines += ['', 'Every unresolved artist has a reason, checked date and next action in [the review registry](../data/portrait-review.json) and '
              'the searchable [public collection status](https://k-hiphop-map.vercel.app/coverage/). '
              'Known official/profile URLs and access failures are preserved in [profile evidence](../data/portrait-source-candidates.json). '
              'An Open Graph image can be an album cover or site logo; it is not an approved artist portrait.', '',
              'Commons captions, photographer searches and CC video search results are retained in '
              '[expanded discovery](../data/portrait-discovery.json). Manual frame/crop coordinates are in '
              '[portrait selections](../data/portrait-selections.json), with observed per-video license statements in '
              '[video evidence](../data/portrait-video-evidence.json). Public profile/interview selections, source hashes, identity evidence and crop coordinates are in '
              '[public-source selections](../data/portrait-profile-selections.json). See the [expansion record](portrait-expansion.md).', '',
              '## Reproduction', '', '```sh', 'python3 scripts/survey-portraits.py',
              'python3 scripts/survey-profile-sources.py --merge-review',
              'python3 scripts/discover-portrait-sources.py --provider commons',
              'python3 scripts/discover-portrait-sources.py --provider flickr',
              'python3 scripts/discover-portrait-sources.py --provider youtube',
              'python3 scripts/stage-portrait-selections.py',
              'python3 scripts/stage-profile-portraits.py',
              '# Review each staged identity, attribution and crop; record its SHA-256 in portrait-approvals.json.',
              'python3 scripts/survey-portraits.py --publish-only', 'npm run data:build', 'npm run data:validate:launch', '```', '',
              'The survey accepts explicit CC BY, CC BY-SA, CC0 or public-domain file metadata. Non-Wikimedia originals require '
              'photo-specific permission records, explicit CC BY video licenses, or a separately reviewed public-source reference. '
              'Public-source references retain `rights.status=unconfirmed` and require `publicationBasis=public-source-reference` in the approval; this is not permission from the rights holder. '
              'An official channel or CC search result alone is not permission. Video title, author, timestamp and changes are retained. '
              'Wikipedia local fair-use files are excluded. Current published sources and '
              'license conditions are listed below and on the [credits page](https://k-hiphop-map.vercel.app/credits/). '
              'API caches expire after 30 days; transient request failures remain retryable.', '',
              '## Included assets', '', '| Artist | Author / source attribution | License / rights status | Source |', '| --- | --- | --- | --- |']
    def cell(text):
        return str(text).replace('|', '&#124;').replace('\n', ' ')
    for artist, asset in sorted(present, key=lambda row: row[0]['name']):
        lines.append(f"| {cell(artist['name'])} | {cell(asset['author'])} | [{cell(asset['license'])}]({asset['licenseUrl']}) | [Original file]({asset['sourceUrl']}) |")
    lines += ['', '## Core artists requiring follow-up', '', '| Artist | State | Reason | Next action |', '| --- | --- | --- | --- |']
    for artist in sorted(core, key=lambda a: a['name']):
        if asset_for(artist):
            continue
        row = status.get(artist['id'], {})
        lines.append(f"| {cell(artist['name'])} | {cell(row.get('state', 'unsearched'))} | {cell(row.get('reason', 'Not yet checked'))} | {cell(row.get('nextAction', 'Identity and source research'))} |")
    (ROOT / 'docs/image-audit.md').write_text('\n'.join(lines) + '\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, default=ROOT / 'data' / 'seeds.json')
    parser.add_argument('--retry-missing', action='store_true')
    parser.add_argument('--cached-discovery', action='store_true',
                        help='Use cached Wikipedia discovery while still retrieving licenses and files.')
    parser.add_argument('--limit', type=int)
    parser.add_argument('--recrop', action='store_true', help='Regenerate local crops without API requests.')
    args = parser.parse_args()
    CACHE.mkdir(parents=True, exist_ok=True)
    DESTINATION.mkdir(parents=True, exist_ok=True)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    artists = load_artists(args.input)
    portraits = json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {}
    status_path = CACHE / 'status.json'
    status = json.loads(status_path.read_text()) if status_path.exists() else {}
    if args.recrop:
        for artist in artists:
            artist_id = str(artist.get('id') or artist.get('mbid'))
            if artist_id in portraits:
                asset = portraits[artist_id]
                portraits[artist_id] = download_portrait(artist, {**asset, 'downloadUrl': asset['originalUrl']})
        write_json(OUTPUT, portraits)
        write_audit(artists, portraits, status)
        print(f'Recropped {len(portraits)} portraits from cached originals.')
        return
    pending = [a for a in artists if str(a.get('id') or a.get('mbid')) not in portraits
               and (args.retry_missing or str(a.get('id') or a.get('mbid')) not in status)]
    if args.limit:
        pending = pending[:args.limit]
    candidates = {str(a.get('id') or a.get('mbid')): wiki_candidates(a) for a in pending}
    en_pages = wiki_pages([title for en, ko in candidates.values() for title in en], 'en', args.cached_discovery)
    ko_pages = wiki_pages([title for en, ko in candidates.values() for title in ko], 'ko', args.cached_discovery)
    qids = [page['pageprops']['wikibase_item'] for page in [*en_pages.values(), *ko_pages.values()]
            if page.get('pageprops', {}).get('wikibase_item')]
    entity_data = entities(qids)
    for index, artist in enumerate(pending, 1):
        artist_id = str(artist.get('id') or artist.get('mbid'))
        en, ko = candidates[artist_id]
        pages = [en_pages[t] for t in en if t in en_pages] + [ko_pages[t] for t in ko if t in ko_pages]
        files = [FILE_OVERRIDES[artist_id]] if artist_id in FILE_OVERRIDES else []
        for page in pages:
            entity = entity_data.get(page.get('pageprops', {}).get('wikibase_item'), {})
            if not eligible_entity(entity, artist):
                continue
            for claim in entity.get('claims', {}).get('P18', []):
                filename = claim.get('mainsnak', {}).get('datavalue', {}).get('value')
                if filename:
                    files.append('File:' + filename)
            if page.get('pageimage'):
                files.append('File:' + page['pageimage'])
        error = None
        for filename in list(dict.fromkeys(files)):
            try:
                metadata = reusable_metadata(filename)
                if not metadata:
                    continue
                portraits[artist_id] = download_portrait(artist, metadata)
                break
            except Exception as caught:
                error = str(caught)
                print(f"  {artist['name']} candidate failed: {caught}", flush=True)
        status[artist_id] = {'reason': 'included' if artist_id in portraits else
                            error or 'No identity-matched Commons image with complete reusable-license metadata.'}
        write_json(OUTPUT, portraits)
        write_json(status_path, status)
        print(f"[{index}/{len(pending)}] {artist['name']}: {status[artist_id]['reason']}", flush=True)
    write_audit(artists, portraits, status)
    print(f'Finished: {len(portraits)} reusable portraits for {len(artists)} artists.', flush=True)


if __name__ == '__main__':
    main()
