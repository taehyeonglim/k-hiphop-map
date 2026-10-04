#!/usr/bin/env python3
"""Reproduce reviewed public-source portraits; stage only, never auto-approve.

Public availability is not a reuse license. These references retain an explicit
unconfirmed rights state and do not imply permission.
Original bytes and dimensions are pinned so source changes require fresh review.
"""
import argparse
import hashlib
import importlib.util
import json
import urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('selections', ROOT / 'scripts/stage-portrait-selections.py')
s = importlib.util.module_from_spec(spec)
spec.loader.exec_module(s)
CACHE = ROOT / '.cache/portraits/profiles'
STAGING = ROOT / '.cache/portraits/candidates'
RIGHTS_LABEL = '공개 출처 사진 · 재사용 허락 미확인'
RIGHTS_NOTE = '아티스트 식별을 위한 공개 출처의 사진입니다. 개별 사진의 저작자·재사용 허락은 확인되지 않았으며, 출처 표기가 이용허락을 대신하지 않습니다.'


def verified_crop(path, selection, kind):
    if hashlib.sha256(path.read_bytes()).hexdigest() != selection['sourceSha256']:
        raise ValueError('Original bytes changed; source identity and crop require review')
    with Image.open(path) as image:
        return s.crop_image(image, selection, kind)


def attribution(selection):
    if not selection.get('identitySources') or not selection.get('identityNotes'):
        raise ValueError('Identity sources and review notes are required')
    if selection.get('rightsStatus') != 'unconfirmed' or selection.get('permission'):
        raise ValueError('Public-source references must not imply reuse permission')
    return dict(originalUrl=selection['originalUrl'], sourceUrl=selection['sourceUrl'],
                author=selection['attribution'], title=selection['title'],
                license=RIGHTS_LABEL, licenseUrl=selection['sourceUrl'],
                rights={'status': 'unconfirmed', 'note': RIGHTS_NOTE})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--artist', action='append')
    args = parser.parse_args()
    CACHE.mkdir(parents=True, exist_ok=True)
    STAGING.mkdir(parents=True, exist_ok=True)
    selections = json.loads((ROOT / 'data/portrait-profile-selections.json').read_text())
    artists = {a['id']: a for a in json.loads((ROOT / 'data/catalog.json').read_text())['artists']}
    staged_path = ROOT / '.cache/portraits/candidates.json'
    staged = json.loads(staged_path.read_text()) if staged_path.exists() else {}
    failures = []
    for aid, selection in selections.items():
        if args.artist and aid not in args.artist:
            continue
        try:
            metadata = attribution(selection)
            source = CACHE / (selection['sourceSha256'] + '.original')
            if not source.exists():
                request = urllib.request.Request(selection['originalUrl'], headers={'User-Agent': s.p.USER_AGENT})
                with urllib.request.urlopen(request, timeout=90) as response:
                    raw = response.read(60_000_001)
                if len(raw) > 60_000_000:
                    raise ValueError('Source exceeds download limit')
                source.write_bytes(raw)
            result = verified_crop(source, selection, artists[aid]['kind'])
            result.save(STAGING / (aid + '.webp'), 'WEBP', quality=88)
            changes = ('전체 그룹 구도 유지·여백 추가. ' if artists[aid]['kind'] == 'group'
                       else f"얼굴 영역 {selection['box']} 크롭. ")
            staged[aid] = dict(metadata, src=f'/images/artists/{aid}.webp',
                               checkedAt=selection['checkedAt'], identitySources=selection['identitySources'],
                               crop=changes + '256×256 WebP 변환, 색상 변경 없음.')
            s.p.write_json(staged_path, staged)
            print(aid, 'staged; identity, crop and publication basis still require approval', flush=True)
        except Exception as error:
            failures.append(aid)
            print(aid, type(error).__name__, str(error)[:200], flush=True)
    if failures:
        raise SystemExit('Could not stage: ' + ', '.join(failures))


if __name__ == '__main__':
    main()
