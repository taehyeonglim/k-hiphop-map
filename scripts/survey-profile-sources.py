#!/usr/bin/env python3
"""Inspect known profile/homepage candidates without inferring photo permission."""
import concurrent.futures
import argparse
import datetime as dt
import json
import time
import urllib.request
import urllib.parse
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
NOW = dt.datetime.now(dt.timezone.utc).isoformat().replace('+00:00', 'Z')


def inspect(item):
    aid, url = item
    record = {'artistId': aid, 'url': url, 'checkedAt': NOW}
    try:
        request = urllib.request.Request(url, headers={'User-Agent': 'KHipHopMap/1.0 (artist profile attribution research)'})
        with urllib.request.urlopen(request, timeout=15) as response:
            text = response.read(2_000_000)
            final = response.url
        soup = BeautifulSoup(text, 'html.parser')
        image = soup.select_one('meta[property="og:image"], meta[name="twitter:image"]')
        candidate = urllib.parse.urljoin(final, image.get('content', '')) if image else None
        record.update(status='candidate' if candidate else 'no-profile-image', imageUrl=candidate,
                      licenseHints=[a['href'] for a in soup.select('a[href*="creativecommons.org/"]')][:8],
                      nextAction='페이지 이미지의 인물과 사진별 재사용 허용 근거 확인' if candidate else '공식 프레스킷·작가 자료 추가 확인')
    except Exception as error:
        record.update(status='retry', reason=str(error), nextAction='프로필 페이지 접근 재시도 또는 보존된 공식 페이지 확인')
    return record


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--retry-days', type=int, default=30)
    parser.add_argument('--merge-review', action='store_true', help='Append profile evidence to the all-artist review registry after discovery.')
    args = parser.parse_args()
    reviews = json.loads((ROOT / 'data/portrait-review.json').read_text())
    artists = json.loads((ROOT / 'data/catalog.json').read_text())['artists']
    selected = set()
    for artist in artists:
        row = reviews.get(artist['id'], {})
        if row.get('state') == 'included':
            continue
        urls = list(row.get('officialUrls', []))
        urls += [s['url'] for s in artist['sources'] if s['provider'] == 'official']
        if artist.get('externalIds', {}).get('maniadb'):
            urls.append('https://www.maniadb.com/artist/' + artist['externalIds']['maniadb'])
        for url in urls:
            if urllib.parse.urlparse(url).scheme in ('http', 'https'):
                selected.add((artist['id'], url))
    path = ROOT / 'data/portrait-source-candidates.json'
    previous = json.loads(path.read_text()) if path.exists() else []
    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=args.retry_days)
    done = {(r['artistId'], r['url']) for r in previous if r['status'] != 'retry' and r.get('checkedAt') and
            dt.datetime.fromisoformat(r['checkedAt'].replace('Z', '+00:00')) >= cutoff}
    rows = {(r['artistId'], r['url']): r for r in previous}
    # Distinct URLs can share hosting. Process each host serially, hosts in parallel.
    hosts = {}
    for item in sorted(selected - done):
        hosts.setdefault(urllib.parse.urlparse(item[1]).netloc, []).append(item)
    def host_batch(items):
        results = []
        for item in items:
            time.sleep(0.5)
            results.append(inspect(item))
        return results
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        for batch in executor.map(host_batch, hosts.values()):
            for result in batch:
                rows[(result['artistId'], result['url'])] = result
            path.write_text(json.dumps(list(rows.values()), ensure_ascii=False, indent=2) + '\n')
            print(f'Profile sources checked: {len(rows)}', flush=True)
    if args.merge_review:
        # Re-read at the merge boundary so discovery never replaces newer reviews.
        review_path = ROOT / 'data/portrait-review.json'
        reviews = json.loads(review_path.read_text())
        for row in rows.values():
            review = reviews.get(row['artistId'])
            if not review or review['state'] == 'included':
                continue
            attempt = {'provider': 'profile', 'checkedAt': row['checkedAt'], 'result': row['status'], 'url': row['url']}
            if attempt not in review['attempts']:
                review['attempts'].append(attempt)
            review['sources'] = list(dict.fromkeys(review.get('sources', []) + [row['url']]))
            if row['status'] == 'candidate' and review['state'] in ('not-found', 'retry'):
                review.update(state='identity-review', checkedAt=row['checkedAt'],
                              reason='프로필·음악 DB 페이지에서 이미지 후보를 발견했으나 인물과 사진별 이용조건 미확인',
                              nextAction='후보가 해당 아티스트의 사진인지 대조하고 사진별 사용허락 근거 확인')
        review_path.write_text(json.dumps(reviews, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()
