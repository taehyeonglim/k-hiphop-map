"""Reviewed album overlays survive artist-centric refreshes and normalization."""
import copy
import json
import re


def is_instrumental_title(title):
    # The honorific in “Mr. Domino” is not an MR/backing-track marker.
    return bool(re.search(r'\b(instrumental|inst\.?|karaoke|music video|data track)\b|반주', title, re.I)
                or re.search(r'(?:^|\s)MR\s*$', title)
                or re.search(r'[\[(]\s*m\.?r\.?\s*[\])]', title, re.I))


def merge_archive(dataset, root):
    paths = [root / 'data/archive.json', root / 'data/archive-manual.json']
    if not any(path.exists() for path in paths):
        return dataset
    overlay = {kind: [] for kind in ('artists', 'recordings', 'releases')}
    for path in paths:
        if path.exists():
            extra = json.loads(path.read_text())
            for kind in overlay:
                overlay[kind].extend(extra.get(kind, []))
    for kind in ('artists', 'recordings', 'releases'):
        rows = {row['id']: row for row in dataset[kind]}
        for item in copy.deepcopy(overlay.get(kind, [])):
            old = rows.get(item['id'])
            if old and kind == 'artists':
                old['sources'] = list({s['id']: s for s in old['sources'] + item['sources']}.values())
                old['aliases'] = list(dict.fromkeys(old['aliases'] + item['aliases']))
                old['externalIds'].update(item['externalIds'])
                continue
            if old and kind == 'recordings':
                old['releaseIds'] = sorted(set(old['releaseIds'] + item['releaseIds']))
                old['sources'] = list({s['id']: s for s in old['sources'] + item['sources']}.values())
                # Existing reviewed credits have precedence over raw archive billing.
                continue
            if old and kind == 'releases':
                item['recordingIds'] = sorted(set(item['recordingIds'] + old['recordingIds']))
            rows[item['id']] = item
        dataset[kind] = list(rows.values())
    return dataset


def apply_track_reviews(dataset, root):
    path = root / 'data/track-review.json'
    reviews = json.loads(path.read_text()) if path.exists() else {}
    release_path = root / 'data/release-review.json'
    release_reviews = json.loads(release_path.read_text()) if release_path.exists() else {}
    artists = {a['id']: a for a in dataset['artists']}
    for recording in dataset['recordings']:
        # Normalization may have merged an alternate recording ID.
        ids = [recording['id']] + ['mb-' + s['url'].rsplit('/', 1)[-1]
                                  for s in recording['sources'] if '/recording/' in s['url']]
        review = next((reviews[rid] for rid in ids if rid in reviews), None)
        if not review:
            continue
        evidence = review['sources']
        source_ids = {s['id'] for s in evidence}
        credits = copy.deepcopy(review['credits'])
        for credit in credits:
            credit['artistId'] = dataset.get('artistAliases', {}).get(credit['artistId'], credit['artistId'])
            if credit['artistId'] not in artists or not credit['sourceIds'] or not set(credit['sourceIds']).issubset(source_ids):
                raise ValueError(f'Invalid reviewed performance credit: {recording["id"]}')
        recording['credits'] = credits
        recording['sources'] = list({s['id']: s for s in recording['sources'] + evidence}.values())
        recording['verification'] = review.get('verification', 'reviewed')
    recs = {r['id']: r for r in dataset['recordings']}
    for release in dataset['releases']:
        patch = release_reviews.get(release['id'], {})
        for field in ('title', 'aliases', 'series', 'labels', 'editionGroup', 'type'):
            if field in patch:
                release[field] = copy.deepcopy(patch[field])
        if patch.get('sources'):
            release['sources'] = list({s['id']: s for s in release.get('sources', [release['source']]) + patch['sources']}.values())
        for track in release.get('tracks', []):
            rec = recs.get(track.get('recordingId'))
            if rec:
                track['status'] = 'pending' if rec['verification'] == 'pending' or any(c['verification'] == 'pending' for c in rec['credits']) else 'linked'
    by_artist = {}
    for recording in dataset['recordings']:
        for aid in {c['artistId'] for c in recording['credits']}:
            by_artist.setdefault(aid, []).append(recording)
    for artist in dataset['artists']:
        rows = by_artist.get(artist['id'], [])
        artist['coverage'].update(recordingCount=len(rows), releaseCount=len({v for r in rows for v in r['releaseIds']}),
                                 pendingCount=sum(r['verification'] == 'pending' or any(c['artistId'] == artist['id'] and c['verification'] == 'pending' for c in r['credits']) for r in rows))
    return dataset
