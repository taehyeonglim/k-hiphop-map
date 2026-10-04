#!/usr/bin/env python3
"""Collect complete early-era release inventories without inventing vocal ties.

Default writes review candidates in .cache; --publish persists the source-backed
archive overlay. Unknown performers stay pending; per-track reviews are separate.
"""
from __future__ import annotations
import argparse
import copy
import json
import re
import sys
import urllib.parse
from pathlib import Path
from collect import Client, Collector, ROOT, NOW, ASOF, browse_all, evidence, norm, normalize_dataset, dataset_version, PRODUCTION_ONLY
from archive_support import merge_archive, apply_track_reviews, is_instrumental_title

SPECIAL = {'89ad4ac3-39f7-470e-963a-56509c546377', '125ec42a-7229-4250-afc5-e057484327fe'}
LABELS = ['Master Plan', 'Soul Company', 'Big Deal Records', 'Independent Records', '신의의지', '한량사', '가라사대']
LABEL_IDS = {'Master Plan': ['e2ed0227-5f07-4dcb-ba74-60d2664a6ef1']}
QUERIES = ['BLEX', '검은소리', 'SNP', 'Show N Prove', 'The Bangerz', 'Official Bootleg', '절정신운 한아', '힙합구조대', '대한민국', 'Master Plan']
PRIORITY = ['808a79a6-9b81-4313-b871-60c6496bb7b1', 'b6740a67-4c09-4efb-afa4-cb68e7935787', '70a083b8-2a42-46f0-9022-c984c09daa68', '1cd891be-0d23-457e-8f64-2c2e57a1bf70', '093f285e-0689-44c8-a79e-6be77875c280', '738fb14a-47bf-4126-b394-7e33cbe9b80d', 'e3e22e16-f6e9-479a-ae72-0f5f9ea81209', 'feb733a7-1a00-4ba1-bf03-e9e1e1ace63c', '76e4ad54-bb04-472e-8442-c3b316bed263', 'cd513236-e02a-4378-a94e-f83b118e4c6c']
CACHE = ROOT / '.cache/archive-run'


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    temp.replace(path)


def source(url, provider='MusicBrainz', note=''):
    item = evidence(provider, url, note)
    if provider != 'MusicBrainz':
        item.pop('license', None)
    return item


def raw_credits(value):
    return [r for r in value.get('artist-credit', []) if isinstance(r, dict) and r.get('artist')]


def billing(rows):
    return ''.join(row.get('name', row['artist']['name']) + row.get('joinphrase', '') for row in rows)


def fetch_release(client, mbid):
    path = CACHE / 'releases' / (mbid + '.json')
    if path.exists() and not client.refresh:
        return json.loads(path.read_text())
    raw = client.mb('release/' + mbid, inc='recordings+artist-credits+release-groups+labels+isrcs')
    save(path, raw)
    return raw


def release_inventory(raw, collector, record_aliases, expand_all=True):
    """All medium positions survive even if a recording is not graph eligible."""
    relid = 'mb-' + raw['id']
    date = raw.get('date', '')
    if not re.match(r'^\d{4}', date):
        raise ValueError('Release date unavailable; kept in candidate ledger')
    src = source('https://musicbrainz.org/release/' + raw['id'])
    group = raw.get('release-group', {})
    owners = [collector.add_artist(r['artist']) for r in raw_credits(raw) if r['artist']['id'] not in SPECIAL]
    compilation = 'Compilation' in group.get('secondary-types', []) or any(r['artist']['id'] in SPECIAL for r in raw_credits(raw)) or raw['id'] in PRIORITY
    primary = (group.get('primary-type') or 'Album').lower()
    kind = 'compilation' if compilation else 'mixtape' if 'Mixtape/Street' in group.get('secondary-types', []) else primary if primary in ('album', 'ep', 'single') else 'album'
    title = raw['title']
    aliases = [title.replace('大韓民國', '대한민국')]
    for old, new in [('超', '초'), ('大舶', '대박'), ('風流', '풍류')]:
        aliases += [a.replace(old, new) for a in aliases]
    aliases = sorted(set(aliases) - {title})
    series = '대한민국' if '대한민국' in title or '大韓民國' in title else 'Master Plan' if re.search(r'^(MP\b|Master Plan)|Club Master Plan', title, re.I) else None
    tracks, new_recordings, ids = [], [], []
    for medium_index, medium in enumerate(raw.get('media', []), 1):
        for position, track in enumerate(medium.get('tracks', []), 1):
            rec = track.get('recording', {})
            rid = record_aliases.get(rec.get('id'), 'mb-' + rec['id'] if rec.get('id') else None)
            credits = raw_credits(track) or raw_credits(rec)
            name = track.get('title') or rec.get('title', 'Untitled')
            item = {'disc': medium.get('position', medium_index), 'position': position, 'number': track.get('number', str(position)),
                    'title': name, 'creditedAs': billing(credits), 'sources': [src], 'status': 'pending'}
            if track.get('length') or rec.get('length'):
                item['durationMs'] = track.get('length') or rec['length']
            excluded = rec.get('video') or is_instrumental_title(name)
            musical = [r for r in credits if r['artist']['id'] not in SPECIAL]
            if excluded:
                item.update(status='excluded', reason='기악·MR·영상: 수록 목록에 보존하며 보컬 협업 집계에서는 제외')
            elif not musical or not rid:
                item['reason'] = '곡별 아티스트 또는 녹음 식별 근거 보완 필요'
            elif not expand_all and not any(collector.mbid_seed.get(r['artist']['id'], {}).get('core') for r in musical):
                item['reason'] = '관련 장르 모음집의 트랙 목록 보존. 한국 힙합 실연자의 참여 근거 확인 후 녹음 연결'
            else:
                item['recordingId'] = rid
                rs = source('https://musicbrainz.org/recording/' + rec['id'], note='Track artist-credit on release ' + raw['id'] + '; unverified performer roles remain pending.')
                cs = []
                featured = False
                for row in musical:
                    aid = collector.add_artist(row['artist'])
                    role = 'producer' if norm(row['artist']['name']) in PRODUCTION_ONLY else 'featured' if featured else 'main'
                    cs.append({'artistId': aid, 'role': role, 'verification': 'pending', 'sourceIds': [rs['id']]})
                    if re.search('feat|with', row.get('joinphrase', ''), re.I):
                        featured = True
                first = rec.get('first-release-date') or date
                if not re.match(r'^\d{4}', first):
                    first = date
                # Older material on a compilation retains its original year;
                # pre-1995 material is archived without a graph recording.
                if int(first[:4]) < 1995:
                    item.pop('recordingId'); item.update(status='excluded', reason='1995년 이전 녹음: 지도 기간 밖')
                else:
                    new_recordings.append({'id': rid, 'title': rec.get('title', name), 'date': first, 'year': int(first[:4]), 'releaseIds': [relid],
                                           'credits': list({c['artistId']: c for c in cs}.values()), 'sources': [rs, src], 'isrcs': rec.get('isrcs', []),
                                           'kind': 'official', 'verification': 'source-confirmed', 'listenUrl': 'https://www.youtube.com/results?search_query=' + urllib.parse.quote(name + ' ' + billing(credits))})
                    ids.append(rid)
            tracks.append(item)
    expected = sum(m.get('track-count', len(m.get('tracks', []))) for m in raw.get('media', []))
    if expected != len(tracks) or not expected:
        raise ValueError(f'Incomplete release track inventory {len(tracks)}/{expected}')
    release = {'id': relid, 'title': title, 'aliases': aliases, 'artistIds': list(dict.fromkeys(owners)), 'date': date, 'year': int(date[:4]),
               'type': kind, 'source': src, 'sources': [src], 'recordingIds': sorted(set(ids)), 'tracks': tracks, 'url': src['url'],
               'editionGroup': group.get('id', raw['id']), 'labels': sorted({r['label']['name'] for r in raw.get('label-info', []) if r.get('label')}),
               'inventory': {'status': 'complete', 'expectedTracks': expected, 'checkedAt': NOW}}
    if series:
        release['series'] = series
    return release, new_recordings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--discover', action='store_true')
    parser.add_argument('--publish', action='store_true')
    parser.add_argument('--refresh', action='store_true')
    parser.add_argument('--limit', type=int)
    args = parser.parse_args()
    CACHE.mkdir(parents=True, exist_ok=True)
    catalog = json.loads((ROOT / 'data/catalog.json').read_text())
    seeds = json.loads((ROOT / 'data/seeds.json').read_text())
    client = Client(args.refresh)
    collector = Collector(client, seeds)
    collector.artists = {a['id']: copy.deepcopy(a) for a in catalog['artists']}
    for artist in catalog['artists']:
        for k, mbid in artist['externalIds'].items():
            if k.startswith('musicbrainz'):
                collector.mbid_seed[mbid] = artist
    aliases = {}
    for rec in catalog['recordings']:
        for s in rec['sources']:
            if s['provider'] == 'MusicBrainz' and '/recording/' in s['url']:
                aliases[s['url'].rsplit('/', 1)[-1]] = rec['id']
    ledger_path = ROOT / 'data/release-audit.json'
    previous = json.loads(ledger_path.read_text()) if ledger_path.exists() else {}
    selection_path = ROOT / 'data/release-selection.json'
    selection = json.loads(selection_path.read_text()) if selection_path.exists() else {}
    candidates = previous.get('releases', {})
    def candidate(raw, origin):
        mbid = raw['id'].removeprefix('mb-')
        candidates.setdefault(mbid, {'title': raw.get('title', mbid), 'date': raw.get('date', ''), 'origins': [], 'status': 'queued'})
        if origin not in candidates[mbid]['origins']:
            candidates[mbid]['origins'].append(origin)
    for r in catalog['releases']:
        if 1995 <= r['year'] <= 2009 and r['id'].startswith('mb-'):
            candidate(r, 'existing-catalog')
    for mbid in PRIORITY:
        candidate({'id': mbid}, 'compilation-audit')
    discovery = previous.get('discovery', {})
    def checkpoint():
        save(CACHE / 'release-audit.json', {'checkedAt': NOW, 'period': [1995, 2009], 'releases': candidates, 'discovery': discovery})
    if args.discover:
        early_ids = {c['artistId'] for r in catalog['recordings'] if r['year'] <= 2009 for c in r['credits']}
        artists = [a for a in catalog['artists'] if a['core'] and a['id'] in early_ids and a['externalIds'].get('musicbrainz')]
        for index, artist in enumerate(artists):
            identities = sorted({value for name, value in artist['externalIds'].items() if name.startswith('musicbrainz')})
            for relation, identity in ((relation, identity) for identity in identities for relation in ('artist', 'track_artist')):
                key = relation + ':' + artist['id'] + (':alias:' + identity if identity != artist['externalIds']['musicbrainz'] else '')
                if discovery.get(key, {}).get('status') == 'complete' and not args.refresh:
                    continue
                try:
                    rows = browse_all(client, 'release', **{relation: identity}, inc='artist-credits+release-groups', status='official')
                    for row in rows:
                        if '1995' <= row.get('date', '')[:4] <= '2009':
                            candidate(row, key)
                    discovery[key] = {'status': 'complete', 'count': len(rows), 'checkedAt': NOW}
                except Exception as error:
                    discovery[key] = {'status': 'retry', 'reason': str(error), 'checkedAt': NOW}
                checkpoint()
            print(f'Discovery {index+1}/{len(artists)} {artist["name"]}: {len(candidates)} release candidates', flush=True)
        for label in LABELS:
            key = 'label:' + label
            if discovery.get(key, {}).get('status') == 'complete' and not args.refresh:
                continue
            try:
                result = client.mb('label', query='label:"' + label + '"', limit=20)
                matches = ([{'id': lid} for lid in LABEL_IDS[label]] if label in LABEL_IDS else
                           [l for l in result.get('labels', []) if norm(l['name']) == norm(label) and l.get('country') == 'KR'])
                for match in matches:
                    for row in browse_all(client, 'release', label=match['id'], inc='artist-credits+release-groups'):
                        if '1995' <= row.get('date', '')[:4] <= '2009':
                            candidate(row, key)
                discovery[key] = {'status': 'complete' if matches else 'needs-source', 'matches': [l['id'] for l in matches], 'checkedAt': NOW}
            except Exception as error:
                discovery[key] = {'status': 'retry', 'reason': str(error), 'checkedAt': NOW}
            checkpoint()
        for query in QUERIES:
            key = 'title:' + query
            if discovery.get(key, {}).get('status') == 'complete' and not args.refresh:
                continue
            try:
                result = client.mb('release', query='release:"' + query + '" AND country:KR AND date:[1995 TO 2009]', limit=100)
                for row in result.get('releases', []):
                    candidate(row, key)
                discovery[key] = {'status': 'complete' if result.get('count', 0) <= 100 else 'page-cap', 'count': result.get('count', 0), 'checkedAt': NOW}
            except Exception as error:
                discovery[key] = {'status': 'retry', 'reason': str(error), 'checkedAt': NOW}
            checkpoint()
    overlay_path = ROOT / 'data/archive.json'
    overlay = json.loads(overlay_path.read_text()) if overlay_path.exists() else {'artists': [], 'recordings': [], 'releases': []}
    releases = {r['id']: r for r in overlay['releases']}
    recordings = {}
    ordered = sorted(candidates, key=lambda k: (k not in PRIORITY, candidates[k].get('date', ''), k))
    if args.limit:
        ordered = ordered[:args.limit]
        selected_ids = {'mb-' + rid for rid in ordered}
        recordings = {r['id']: r for r in overlay['recordings'] if any(rid not in selected_ids for rid in r['releaseIds'])}
    for index, mbid in enumerate(ordered):
        try:
            raw = fetch_release(client, mbid)
            if mbid in selection.get('excluded', {}):
                candidates[mbid].update(status='out-of-scope', reason=selection['excluded'][mbid], checkedAt=NOW)
                releases.pop('mb-' + mbid, None)
                continue
            if all(origin.startswith('title:') or origin == 'existing-catalog' for origin in candidates[mbid]['origins']) and any(origin.startswith('title:') for origin in candidates[mbid]['origins']):
                participants = [ac['artist']['id'] for medium in raw.get('media', []) for track in medium.get('tracks', []) for ac in (raw_credits(track) or raw_credits(track.get('recording', {})))]
                if not any(collector.mbid_seed.get(aid, {}).get('core') for aid in participants):
                    candidates[mbid].update(status='out-of-scope', reason='제목 검색 결과에만 등장하며 한국 힙합 참여·발매 근거 미확인', checkedAt=NOW)
                    releases.pop('mb-' + mbid, None)
                    continue
            full = (mbid in PRIORITY or mbid in selection.get('fullInventories', [])
                    or any(collector.mbid_seed.get(ac['artist']['id'], {}).get('core') for ac in raw_credits(raw))
                    or any(re.search(r'Master Plan|Soul Company|Big Deal|Independent Records|한량사|가라사대|신의의지', li.get('label', {}).get('name', ''), re.I)
                           for li in raw.get('label-info', []) if li.get('label')))
            rel, recs = release_inventory(raw, collector, aliases, expand_all=full)
            releases[rel['id']] = rel
            for rec in recs:
                if rec['id'] in recordings:
                    recordings[rec['id']]['releaseIds'] = sorted(set(recordings[rec['id']]['releaseIds'] + rec['releaseIds']))
                else:
                    recordings[rec['id']] = rec
            candidates[mbid].update(title=rel['title'], date=rel['date'], status='inventoried', tracks=len(rel['tracks']), checkedAt=NOW)
        except Exception as error:
            candidates[mbid].update(status='retry', reason=str(error), checkedAt=NOW)
        if (index+1) % 10 == 0 or index == len(ordered)-1:
            checkpoint()
            save(CACHE / 'archive.json', {'artists': list(collector.artists.values()), 'recordings': list(recordings.values()), 'releases': list(releases.values())})
            print(f'Inventory {index+1}/{len(ordered)}: {len(releases)} albums, {len(recordings)} linked recordings', flush=True)
    checkpoint()
    used_artists = {c['artistId'] for r in recordings.values() for c in r['credits']} | {a for r in releases.values() for a in r['artistIds']}
    save(CACHE / 'archive.json', {'artists': [a for a in collector.artists.values() if a['id'] in used_artists],
                                'recordings': list(recordings.values()), 'releases': list(releases.values())})
    if args.publish:
        staged = json.loads((CACHE / 'archive.json').read_text())
        excluded = {'mb-' + rid for rid, row in candidates.items() if row['status'] == 'out-of-scope'}
        for bundle in (staged, catalog):
            bundle['releases'] = [r for r in bundle['releases'] if r['id'] not in excluded]
            removed_artists = set()
            kept = []
            for rec in bundle['recordings']:
                if rec['releaseIds'] and set(rec['releaseIds']).issubset(excluded):
                    removed_artists.update(c['artistId'] for c in rec['credits'])
                    continue
                rec['releaseIds'] = [rid for rid in rec['releaseIds'] if rid not in excluded]
                kept.append(rec)
            bundle['recordings'] = kept
            used = {c['artistId'] for r in kept for c in r['credits']} | {aid for r in bundle['releases'] for aid in r['artistIds']}
            bundle['artists'] = [a for a in bundle['artists'] if a['id'] not in removed_artists or a['id'] in used or a['core']]
        save(overlay_path, staged)
        save(ledger_path, json.loads((CACHE / 'release-audit.json').read_text()))
        ds = apply_track_reviews(normalize_dataset(merge_archive(catalog, ROOT)), ROOT)
        ds['asOf'] = ASOF; ds['version'] = dataset_version(ds)
        save(ROOT / 'data/catalog.json', ds)
        print('Published reviewed structure; unresolved performer credits remain pending.', flush=True)


if __name__ == '__main__':
    main()
