#!/usr/bin/env python3
"""Stage distributor track metadata for review; never store lyrics in exports."""
import argparse
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup
from collect import Client, ROOT, NOW


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('albums', nargs='+')
    args = parser.parse_args()
    client = Client()
    path = ROOT / '.cache/archive-run/bugs-evidence.json'
    albums = json.loads(path.read_text()) if path.exists() else {}
    for album_id in args.albums:
        url = 'https://music.bugs.co.kr/album/' + album_id
        soup = BeautifulSoup(client.get(url, json_response=False), 'html.parser')
        tracks = []
        for row in soup.select('tr[trackid]'):
            track_id = row['trackid']
            track_url = 'https://music.bugs.co.kr/track/' + track_id
            detail = BeautifulSoup(client.get(track_url, json_response=False), 'html.parser')
            credits = []
            for table in detail.select('table.info'):
                caption = table.find('caption')
                if not caption or caption.get_text(strip=True) != '참여 정보':
                    continue
                for tr in table.select('tr'):
                    role = tr.find('th')
                    if not role:
                        continue
                    for anchor in tr.select('td a[href*="/artist/"]'):
                        artist_url = anchor['href'].split('?')[0]
                        credits.append({'role': role.get_text(strip=True), 'name': anchor.get_text(strip=True), 'artistUrl': artist_url})
            title = row.select_one('.title a')
            tracks.append({'id': track_id, 'url': track_url, 'title': title.get_text(strip=True) if title else '', 'credits': credits, 'checkedAt': NOW})
        albums[album_id] = {'url': url, 'tracks': tracks, 'checkedAt': NOW}
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(albums, ensure_ascii=False, indent=2) + '\n')
        print(f'Bugs album {album_id}: {len(tracks)} track credit records', flush=True)


if __name__ == '__main__':
    main()
