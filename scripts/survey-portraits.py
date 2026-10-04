#!/usr/bin/env python3
"""Survey every catalog artist; stage candidates until explicit visual review.

Discovery is resumable per artist. An unsuccessful request is never recorded as
no photo. --publish only copies candidates approved in portrait-approvals.json.
"""
import argparse
import datetime as dt
import importlib.util
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('portraits', ROOT / 'scripts/collect-portraits.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)
STAGING = ROOT / '.cache/portraits/candidates'
NOW = dt.datetime.now(dt.timezone.utc).isoformat().replace('+00:00', 'Z')


def save(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    p.write_json(path, obj)


def valid_image(asset):
    return all(asset.get(k) for k in ('src', 'originalUrl', 'sourceUrl', 'author', 'license', 'licenseUrl')) and (ROOT / 'public' / asset['src'].lstrip('/')).exists()


def approved_candidate(asset, approval, path):
    return (approval.get('sourceUrl') == asset['sourceUrl'] and bool(approval.get('reviewedAt'))
            and approval.get('identityConfirmed') is True and approval.get('cropApproved') is True
            and path.is_file() and approval.get('imageSha256') == hashlib.sha256(path.read_bytes()).hexdigest())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--retry-days', type=int, default=30)
    parser.add_argument('--limit', type=int)
    parser.add_argument('--publish', action='store_true')
    parser.add_argument('--publish-only', action='store_true')
    args = parser.parse_args()
    p.CACHE.mkdir(parents=True, exist_ok=True)
    STAGING.mkdir(parents=True, exist_ok=True)
    p.DESTINATION = STAGING
    artists = json.loads((ROOT / 'data/catalog.json').read_text())['artists']
    assets_path = ROOT / 'data/portraits.json'
    assets = json.loads(assets_path.read_text())
    review_path = ROOT / 'data/portrait-review.json'
    review = json.loads(review_path.read_text()) if review_path.exists() else {}
    staged_path = p.CACHE / 'candidates.json'
    staged = json.loads(staged_path.read_text()) if staged_path.exists() else {}
    extra_candidates = p.CACHE / 'core-candidates.json'
    if extra_candidates.exists():
        staged.update(json.loads(extra_candidates.read_text()))
    approval_path = ROOT / 'data/portrait-approvals.json'
    approvals = json.loads(approval_path.read_text()) if approval_path.exists() else {}
    permission_path = ROOT / 'data/portrait-permissions.json'
    permissions = json.loads(permission_path.read_text()) if permission_path.exists() else {}
    # Every artist has a durable entry, including artists added during an audit.
    for artist in artists:
        aid = artist['id']
        row = review.setdefault(aid, {'state': 'unsearched', 'attempts': [], 'nextAction': '이름·별칭과 식별자로 사진 출처 조사'})
        if aid in assets and valid_image(assets[aid]):
            row.update(state='included', checkedAt=NOW, nextAction='정기 파일·귀속 정보 점검', sources=[assets[aid]['sourceUrl']])
        elif aid in assets:
            row.update(state='retry', reason='기존 사진 파일 또는 필수 출처 정보 불완전')
    save(review_path, review)
    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=args.retry_days)
    pending = [a for a in artists if review[a['id']]['state'] != 'included' and
               (review[a['id']]['state'] in ('unsearched', 'retry') or not review[a['id']].get('checkedAt') or
                dt.datetime.fromisoformat(review[a['id']]['checkedAt'].replace('Z', '+00:00')) < cutoff)]
    pending.sort(key=lambda a: (not a['core'], a['name']))
    if args.limit:
        pending = pending[:args.limit]
    if args.publish_only:
        pending = []
    for start in range(0, len(pending), 30):
        batch = pending[start:start+30]
        queries = {a['id']: p.wiki_candidates(a) for a in batch}
        try:
            en_pages = p.wiki_pages([t for en, ko in queries.values() for t in en], 'en')
            ko_pages = p.wiki_pages([t for en, ko in queries.values() for t in ko], 'ko')
            qids = [page['pageprops']['wikibase_item'] for page in [*en_pages.values(), *ko_pages.values()] if page.get('pageprops', {}).get('wikibase_item')]
            entities = p.entities(qids)
        except Exception as error:
            for artist in batch:
                row = review[artist['id']]
                row.update(state='retry', checkedAt=NOW, reason=str(error), nextAction='출처 API 요청 재시도')
                row['attempts'].append({'provider': 'Wikimedia', 'checkedAt': NOW, 'result': 'request-failed'})
            save(review_path, review)
            print(f'Batch {start}: retry: {error}', flush=True)
            continue
        for artist in batch:
            aid = artist['id']; en, ko = queries[aid]
            row = review[aid]
            row.update(checkedAt=NOW, queries=en+ko)
            pages = [en_pages[t] for t in en if t in en_pages] + [ko_pages[t] for t in ko if t in ko_pages]
            files = [p.FILE_OVERRIDES[aid]] if aid in p.FILE_OVERRIDES else []
            identity_sources, official_urls = [], []
            for page in pages:
                qid = page.get('pageprops', {}).get('wikibase_item')
                entity = entities.get(qid, {})
                if not p.eligible_entity(entity, artist):
                    continue
                identity_sources.append('https://www.wikidata.org/wiki/' + qid)
                for prop, bucket in [('P18', files), ('P856', official_urls)]:
                    for claim in entity.get('claims', {}).get(prop, []):
                        value = claim.get('mainsnak', {}).get('datavalue', {}).get('value')
                        if value:
                            bucket.append('File:' + value if prop == 'P18' else value)
                if page.get('pageimage'):
                    files.append('File:' + page['pageimage'])
            errors = []
            for filename in dict.fromkeys(files):
                try:
                    metadata = p.reusable_metadata(filename)
                    if not metadata:
                        continue
                    staged[aid] = {**p.download_portrait(artist, metadata), 'identitySources': identity_sources, 'checkedAt': NOW,
                                   'permission': {'basis': 'license', 'url': metadata['licenseUrl']}}
                    row.update(state='visual-review', sources=identity_sources+[metadata['sourceUrl']], nextAction='후보 사진 인물·화질·크롭 시각 검토')
                    break
                except Exception as error:
                    errors.append(str(error))
            if aid not in staged:
                row.update(state='retry' if errors else 'not-found', reason='; '.join(errors) if errors else 'Wikimedia에서 식별자·이용조건이 확인된 사진을 확보하지 못함',
                           sources=identity_sources, officialUrls=list(dict.fromkeys(official_urls)),
                           nextAction='공식 프로필·프레스킷의 사진과 재사용 조건 확인' if official_urls else '이전 활동명·공식 프로필·사진가 자료 추가 조사')
            row['attempts'].append({'provider': 'Wikimedia', 'checkedAt': NOW, 'result': row['state'], 'candidateFiles': list(dict.fromkeys(files))})
            # Explicit permission records can cover non-Wikimedia originals.
            # The record must identify the artist and separately record rights.
            allowed = permissions.get(aid)
            if allowed:
                if not isinstance(allowed.get('allowCrop'), bool) or not all(allowed.get(k) for k in ('identitySource', 'permissionUrl', 'author', 'license', 'sourceUrl', 'originalUrl')):
                    row.update(state='permission-needed', nextAction='신원·재사용 범위·편집 허용 근거 보완')
                else:
                    try:
                        shape = artist if allowed['allowCrop'] is True else {**artist, 'kind': 'group'}
                        asset = p.download_portrait(shape, {**allowed, 'downloadUrl': allowed['originalUrl'], 'licenseUrl': allowed['permissionUrl']})
                        staged[aid] = {**asset, 'identitySources': [allowed['identitySource']], 'checkedAt': NOW, 'permission': {'basis': 'permission', 'url': allowed['permissionUrl']}}
                        row.update(state='visual-review', nextAction='허용 사진 시각 검토')
                    except Exception as error:
                        row.update(state='retry', reason=str(error), nextAction='허용 원본 다운로드 재시도')
            save(staged_path, staged)
            save(review_path, review)
        print(f'Portrait survey {min(start+30,len(pending))}/{len(pending)}; {len(staged)} staged candidates', flush=True)
    if args.publish or args.publish_only:
        for aid, approval in approvals.items():
            asset = staged.get(aid)
            if aid not in review or not asset or approval.get('sourceUrl') != asset['sourceUrl']:
                continue
            path = STAGING / Path(asset['src']).name
            if not approved_candidate(asset, approval, path):
                review[aid].update(state='identity-review' if approval.get('identityConfirmed') is False else 'visual-review',
                                   reason=approval.get('reason', '승인한 사진 파일과 현재 후보를 다시 확인해야 함'),
                                   nextAction=approval.get('nextAction', '인물·파일·크롭 재검토'))
                continue
            destination = ROOT / 'public' / asset['src'].lstrip('/')
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, destination)
            assets[aid] = {**asset, 'identitySources': list(dict.fromkeys(asset.get('identitySources', []))), 'reviewedAt': approval['reviewedAt']}
            review[aid].update(state='included', checkedAt=NOW, sources=[asset['sourceUrl']], nextAction='정기 파일·귀속 정보 점검')
        save(assets_path, assets)
        save(review_path, review)
        p.write_audit(artists, assets, review)
    counts = {}
    for artist in artists:
        state = review[artist['id']]['state']; counts[state] = counts.get(state, 0) + 1
    print(json.dumps(counts, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
