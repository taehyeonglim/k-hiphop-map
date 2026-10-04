#!/usr/bin/env python3
"""Import curator-selected early albums from source-attributed track tables.

Selections and identity crosswalks are explicit. Unknown people stay unlinked
in the album inventory; writer/composer cells are never performer evidence.
"""
import argparse
import json
import re
from bs4 import BeautifulSoup
from collect import Client, ROOT, NOW, norm
from archive_support import is_instrumental_title


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--publish', action='store_true')
    args = parser.parse_args()
    config = json.loads((ROOT / 'data/maniadb-releases.json').read_text())
    dataset = json.loads((ROOT / 'data/catalog.json').read_text())
    names = {}
    for artist in dataset['artists']:
        for name in [artist['name'], artist['nameEn'], *artist['aliases']]:
            names.setdefault(norm(name), set()).add(artist['id'])
    def resolve(anchor):
        mid = anchor['href'].rsplit('/', 1)[-1]
        if mid in config['artists']:
            return config['artists'][mid]
        # Suggestions are not automatic identity decisions.
        return None
    client = Client()
    output = {'artists': config.get('artistRecords', []), 'recordings': [], 'releases': []}
    candidates = []
    for selection in config['releases']:
        mid = selection['id']; url = 'https://www.maniadb.com/album/' + mid
        soup = BeautifulSoup(client.get(url, json_response=False), 'html.parser')
        tables = soup.select('table.trackinfo')
        if len(tables) != selection['expectedTracks']:
            raise ValueError(f'{mid}: track table count {len(tables)} != {selection["expectedTracks"]}')
        src = {'id': 'src-maniadb-album-' + mid, 'provider': 'maniadb', 'url': url, 'fetchedAt': NOW, 'license': 'CC BY-NC-SA 2.0 KR',
               'note': '음반 메타데이터와 트랙 표의 실연자·featuring 표기만 전사. 작사·작곡·편곡과 가사 본문은 제외.'}
        tracks = []; records = []
        for index, table in enumerate(tables, 1):
            title_node = table.select_one('div.song a')
            performer_node = table.select_one('td.performer')
            if not title_node or not performer_node:
                raise ValueError(f'{mid}/{index}: missing title/performer table')
            title = title_node.get_text(' ', strip=True)
            credits = []; unresolved = []
            # Only the performer column and explicit featuring column are used.
            nodes = [(a, 'main') for a in performer_node.select('a[href*="/artist/"]')]
            nodes += [(a, 'featured') for a in table.select('.featuring a[href*="/artist/"]')]
            for anchor, role in nodes:
                aid = resolve(anchor)
                if aid:
                    credits.append({'artistId': aid, 'role': role, 'verification': 'reviewed' if aid in config.get('verifiedPerformers', []) else 'pending', 'sourceIds': [src['id']]})
                else:
                    suggestions = sorted(names.get(norm(anchor.get_text(strip=True)), set()))
                    unresolved.append(anchor.get_text(strip=True))
                    candidates.append({'album': mid, 'track': index, 'name': anchor.get_text(strip=True), 'url': 'https://www.maniadb.com' + anchor['href'], 'suggestedIds': suggestions})
            credited = performer_node.get_text(' ', strip=True)
            item = {'disc': 1, 'position': index, 'number': str(index), 'title': title, 'creditedAs': credited, 'sources': [src], 'status': 'pending'}
            partial_feature = bool(re.search(r'\bfea(?:t|turing)?\.', title, re.I)) and not any(role == 'featured' for _, role in nodes)
            if is_instrumental_title(title):
                item.update(status='excluded', reason='기악·MR: 수록 목록 보존, 보컬 협업 집계 제외')
            elif credits and not unresolved:
                song_img = table.select_one('img[id^="S"]')
                songid = song_img['id'].split('_')[-1] if song_img else mid + '-' + str(index)
                rid = 'maniadb-' + songid
                item['recordingId'] = rid
                records.append({'id': rid, 'title': title, 'year': int(selection['date'][:4]), 'date': selection['date'], 'releaseIds': ['maniadb-' + mid],
                                'credits': list({c['artistId']: c for c in credits}.values()), 'sources': [src], 'isrcs': [], 'kind': 'official', 'verification': 'pending' if partial_feature else 'source-confirmed'})
                if partial_feature:
                    item['reason'] = '제목에 명시된 피처링 참여자의 식별·역할 추가 검토 필요'
            else:
                item['reason'] = '곡별 실연자 식별·역할 근거 보완 필요' + (': ' + ', '.join(unresolved) if unresolved else '')
            tracks.append(item)
        release = {'id': 'maniadb-' + mid, 'title': selection['title'], 'date': selection['date'], 'year': int(selection['date'][:4]), 'type': selection['type'],
                   'artistIds': selection.get('artistIds', []), 'source': src, 'sources': [src], 'url': url, 'labels': selection.get('labels', []),
                   'aliases': selection.get('aliases', []), 'recordingIds': [r['id'] for r in records], 'tracks': tracks,
                   'inventory': {'status': 'complete', 'expectedTracks': len(tracks), 'checkedAt': NOW}}
        output['releases'].append(release);output['recordings'].extend(records)
        print(f'{selection["title"]}: {len(tracks)} tracks; {len(records)} recordings linked', flush=True)
    path = ROOT / '.cache/archive-run/maniadb-overlay.json'
    path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
    (ROOT / '.cache/archive-run/maniadb-identity-candidates.json').write_text(json.dumps(candidates, ensure_ascii=False, indent=2) + '\n')
    if args.publish:
        dest = ROOT / 'data/archive-manual.json'
        old = json.loads(dest.read_text()) if dest.exists() else {}
        for kind in ('artists', 'recordings', 'releases'):
            byid = {r['id']: r for r in old.get(kind, [])}
            byid.update({r['id']: r for r in output[kind]})
            output[kind] = list(byid.values())
        dest.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()
