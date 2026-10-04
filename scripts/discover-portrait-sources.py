#!/usr/bin/env python3
"""Find photo/video candidates beyond Wikipedia infoboxes; never auto-publish.

Searches Commons captions and photographers' Flickr records using Korean and
English names. A hit is evidence to review, not an identity or reuse approval.
Flickr NC candidates are explicitly marked; ND images cannot become crops.
"""
import argparse
import datetime as dt
import fcntl
import hashlib
import importlib.util
import json
import re
import subprocess
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('portraits', ROOT / 'scripts/collect-portraits.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)
CACHE = ROOT / '.cache/portrait-discovery'
OUTPUT = ROOT / 'data/portrait-discovery.json'


def names(artist):
    return list(dict.fromkeys(n for n in (artist['name'], artist.get('nameEn')) if n))


def commons_query(artist):
    # CirrusSearch treats these parentheses as literal text, hiding valid hits.
    return ' OR '.join('"' + n.replace('"', '') + '"' for n in names(artist))


def commons(artist):
    query = commons_query(artist)
    data = p.api('commons.wikimedia.org', action='query', list='search',
                 srsearch=query, srnamespace=6, srlimit=50)
    return [query], [dict(title=r['title'], sourceUrl='https://commons.wikimedia.org/wiki/' +
                         urllib.parse.quote(r['title'].replace(' ', '_')), description=p.clean_text(r.get('snippet', '')))
                     for r in data.get('query', {}).get('search', [])
                     if re.search(r'\.(jpe?g|png|webp|webm|ogv)$', r['title'], re.I)]


def fetch(url):
    path = CACHE / (hashlib.sha256(url.encode()).hexdigest() + '.html')
    if path.exists() and time.time() - path.stat().st_mtime < 30 * 86400:
        return path.read_text()
    time.sleep(1.1)
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': p.USER_AGENT}), timeout=30) as response:
        text = response.read(8_000_000).decode()
    path.write_text(text)
    return text


def flickr_rows(text):
    # Parse the site's public search response; no private API key or login.
    if 'modelExport: ' not in text:
        raise ValueError('Flickr search response unavailable; this is not a no-result search')
    data = json.JSONDecoder().raw_decode(text.split('modelExport: ', 1)[1])[0]
    models = data.get('main', {}).get('search-photos-lite-models')
    if models is None:
        raise ValueError('Flickr search model changed')
    rows = []
    for model in models:
        for item in model['data']['photos']['data']['_data']:
            row = item['data']
            sizes = [s['data'] for s in row.get('sizes', {}).get('data', {}).values()]
            sizes = [s for s in sizes if s.get('url') and s.get('width') and s.get('height')]
            if not sizes:
                continue
            size = max(sizes, key=lambda s: s['width'] * s['height'])
            url = size['url']
            rows.append(dict(title=row.get('title', ''), description=p.clean_text(row.get('description', '')),
                             sourceUrl=f"https://www.flickr.com/photos/{row['ownerNsid']}/{row['id']}/",
                             originalUrl='https:' + url if url.startswith('//') else url,
                             author=row.get('realname') or row['username'], licenseId=row.get('license'),
                             width=size['width'], height=size['height']))
    return rows


def flickr(artist):
    queries, rows = [], {}
    for name in names(artist):
        url = 'https://www.flickr.com/search/?' + urllib.parse.urlencode(
            {'text': '"' + name.replace('"', '') + '"', 'license': '1,2,4,5,9,10,11,12,14,15'})
        queries.append(url)
        for row in flickr_rows(fetch(url)):
            rows[row['sourceUrl']] = row
    return queries, list(rows.values())


def youtube(artist):
    queries, rows = [], {}
    for name in names(artist):
        query = '"' + name.replace('"', '') + '"' + (' 힙합' if len(name) < 4 else '')
        url = 'https://www.youtube.com/results?' + urllib.parse.urlencode(
            {'search_query': query, 'sp': 'EgIwAQ%3D%3D'})
        queries.append(url)
        response = subprocess.run(['yt-dlp', '--skip-download', '--no-warnings',
                                   '--flat-playlist', '--dump-single-json', '--playlist-end', '8', url],
                                  capture_output=True, text=True, check=True, timeout=90)
        data = json.loads(response.stdout)
        for item in data.get('entries', []):
            if not item or not re.fullmatch(r'[A-Za-z0-9_-]{11}', item.get('id', '')):
                continue
            source = 'https://www.youtube.com/watch?v=' + item['id']
            rows[source] = dict(title=item.get('title'), sourceUrl=source,
                                author=item.get('channel'), duration=item.get('duration'))
    # CC-filtered search can include unrelated/reuploaded footage. Publication
    # separately verifies the selected video's license and actual author.
    return queries, list(rows.values())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--provider', choices=['commons', 'flickr', 'youtube'], required=True)
    parser.add_argument('--limit', type=int)
    parser.add_argument('--artist', action='append', help='Repeat for selected artist IDs; includes existing portraits')
    parser.add_argument('--retry-days', type=int, default=30)
    args = parser.parse_args()
    CACHE.mkdir(parents=True, exist_ok=True)
    p.CACHE.mkdir(parents=True, exist_ok=True)
    artists = json.loads((ROOT / 'data/catalog.json').read_text())['artists']
    assets = json.loads((ROOT / 'data/portraits.json').read_text())
    data = json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {}
    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=args.retry_days)
    pending = [a for a in artists if a['id'] in args.artist] if args.artist else [a for a in artists if a['core'] and a['id'] not in assets]
    if args.limit:
        pending = pending[:args.limit]
    for artist in pending:
        aid = artist['id']
        previous = data.get(aid, {}).get(args.provider, {})
        if previous.get('status') == 'searched' and dt.datetime.fromisoformat(previous['checkedAt']) >= cutoff:
            continue
        row = {'checkedAt': dt.datetime.now(dt.timezone.utc).isoformat()}
        try:
            queries, candidates = globals()[args.provider](artist)
            row.update(status='searched', queries=queries, candidates=candidates)
        except Exception as error:
            row.update(status='retry', reason=str(error))
        # Other provider runs can finish while a network request is pending.
        with (CACHE / 'write.lock').open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            data = json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {}
            data.setdefault(aid, {})[args.provider] = row
            p.write_json(OUTPUT, data)
        print(aid, args.provider, row['status'], len(row.get('candidates', [])), flush=True)


if __name__ == '__main__':
    main()
