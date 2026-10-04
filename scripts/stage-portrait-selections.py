#!/usr/bin/env python3
"""Reproduce manually selected, attributed photo crops; never approve/publish.

Requires Pillow, ffmpeg and yt-dlp (with its JS runtime dependencies) for video
sources. Only an explicit file license qualifies: a search result or an official
channel alone is insufficient. Cached originals stay outside the public site.
"""
import argparse
import datetime as dt
import hashlib
import importlib.util
import json
import re
import subprocess
import time
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('portraits', ROOT / 'scripts/collect-portraits.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)
CACHE = ROOT / '.cache/portraits/selections'
STAGING = ROOT / '.cache/portraits/candidates'
YOUTUBE_CC = 'Creative Commons Attribution license (reuse allowed)'


def video_attribution(info, video_id):
    if info.get('id') != video_id or info.get('license') != YOUTUBE_CC:
        raise ValueError('The selected video must explicitly allow Creative Commons reuse')
    if not info.get('channel') or not info.get('title'):
        raise ValueError('Missing video author/title')
    source = 'https://www.youtube.com/watch?v=' + video_id
    # The watch page labels CC BY without a version; do not infer a version from
    # the upload date. Link the platform's actual license destination.
    return dict(originalUrl=source, sourceUrl=source, author=info['channel'],
                title=info['title'], license='CC BY (YouTube)',
                licenseUrl='https://www.youtube.com/t/creative_commons')


def crop_image(image, selection, kind):
    image = ImageOps.exif_transpose(image).convert('RGB')
    if list(image.size) != selection['sourceSize']:
        raise ValueError(f"Source dimensions changed: {image.size} != {selection['sourceSize']}")
    left, top, right, bottom = selection['box']
    if not (0 <= left < right <= image.width and 0 <= top < bottom <= image.height):
        raise ValueError('Crop lies outside the source image')
    if min(right-left, bottom-top) < 100:
        raise ValueError('Selected face crop is too small')
    if kind == 'group':
        if selection['box'] != [0, 0, image.width, image.height]:
            raise ValueError('Group portraits must preserve all members in the selected frame')
        return ImageOps.pad(image, (256, 256), color='#151719')
    if right-left != bottom-top:
        raise ValueError('Person portraits require a square crop without distortion')
    return image.crop(selection['box']).resize((256, 256), Image.Resampling.LANCZOS)


def video_info(video_id, executable):
    path = CACHE / (video_id + '.info.json')
    if not path.exists() or time.time() - path.stat().st_mtime > 30 * 86400:
        result = subprocess.run([executable, '--js-runtimes', 'node', '--skip-download',
                                 '--no-warnings', '--dump-json', 'https://www.youtube.com/watch?v=' + video_id],
                                capture_output=True, text=True, check=True, timeout=90)
        # Retain identity/license proof, not transient signed CDN URLs or cookies.
        info = json.loads(result.stdout)
        p.write_json(path, {k: info.get(k) for k in
                           ('id', 'title', 'channel', 'channel_url', 'license', 'upload_date', 'duration')})
    return json.loads(path.read_text())


def selected_frame(selection, executable):
    video_id = selection['videoId']
    if not re.fullmatch(r'[A-Za-z0-9_-]{11}', video_id):
        raise ValueError('Invalid YouTube video identifier')
    info = video_info(video_id, executable)
    metadata = video_attribution(info, video_id)
    evidence_path = ROOT / 'data/portrait-video-evidence.json'
    evidence = json.loads(evidence_path.read_text()) if evidence_path.exists() else {}
    checked = dt.datetime.fromtimestamp((CACHE / (video_id + '.info.json')).stat().st_mtime, dt.timezone.utc)
    evidence[metadata['sourceUrl']] = {**info, 'checkedAt': checked.isoformat(),
                                       'licenseDestination': metadata['licenseUrl']}
    p.write_json(evidence_path, evidence)
    timestamp = selection['timestamp']
    if not isinstance(timestamp, (int, float)) or not 0 <= timestamp < info['duration']:
        raise ValueError('Frame timestamp outside the video')
    frame = CACHE / f'{video_id}-{timestamp}.png'
    if not frame.exists():
        media = next((CACHE / (video_id + ext) for ext in ('.mp4', '.webm')
                      if (CACHE / (video_id + ext)).exists()), None)
        if media is None:
            # Download only the selected scene; no audio is needed for a photo.
            start = max(0, timestamp - 2)
            scene_key = f'{video_id}-{timestamp}-scene'
            template = str(CACHE / (scene_key + '.%(ext)s'))
            subprocess.run([executable, '--js-runtimes', 'node', '--no-progress',
                            '--no-warnings', '-f', 'bestvideo[height<=720]/best[height<=720]',
                            '--download-sections', f'*{start}-{timestamp + 2}',
                            '--force-keyframes-at-cuts', '-o', template, metadata['sourceUrl']],
                           check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=240)
            media = next((CACHE / (scene_key + ext) for ext in ('.mp4', '.webm', '.mkv')
                          if (CACHE / (scene_key + ext)).exists()), None)
            if media is None:
                raise ValueError('Selected video scene was not downloaded')
            offset = timestamp-start
        else:
            offset = timestamp
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(offset),
                        '-i', str(media), '-frames:v', '1', str(frame)], check=True, timeout=60)
        # A bounded scene is specific to this timestamp, so cannot be reused as
        # an original for a different selection.
        for scene in CACHE.glob(f'{video_id}-{timestamp}-scene.*'):
            scene.unlink()
    metadata['crop'] = f'영상 {timestamp:g}초의 정지 장면. '
    return frame, metadata


def selected_photo(selection):
    metadata = p.reusable_metadata(selection['fileTitle'])
    if not metadata:
        raise ValueError('No supported explicit photo license')
    metadata['title'] = selection['fileTitle'].removeprefix('File:')
    key = hashlib.sha256(metadata['originalUrl'].encode()).hexdigest()
    path = CACHE / (key + '.original')
    if not path.exists():
        with urllib.request.urlopen(urllib.request.Request(metadata['originalUrl'],
                                    headers={'User-Agent': p.USER_AGENT}), timeout=60) as response:
            path.write_bytes(response.read(40_000_000))
    if 'timestamp' in selection:
        timestamp = selection['timestamp']
        if not isinstance(timestamp, (int, float)) or timestamp < 0:
            raise ValueError('Invalid frame timestamp')
        frame = CACHE / f'{key}-{timestamp}.png'
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(timestamp),
                        '-i', str(path), '-frames:v', '1', str(frame)], check=True, timeout=60)
        metadata['crop'] = f'영상 {timestamp:g}초의 정지 장면. '
        path = frame
    return path, metadata


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--artist', action='append')
    parser.add_argument('--yt-dlp', default='yt-dlp', help='yt-dlp executable path')
    args = parser.parse_args()
    CACHE.mkdir(parents=True, exist_ok=True)
    STAGING.mkdir(parents=True, exist_ok=True)
    p.CACHE.mkdir(parents=True, exist_ok=True)
    selections = json.loads((ROOT / 'data/portrait-selections.json').read_text())
    artists = {a['id']: a for a in json.loads((ROOT / 'data/catalog.json').read_text())['artists']}
    staged_path = p.CACHE / 'candidates.json'
    staged = json.loads(staged_path.read_text()) if staged_path.exists() else {}
    review_path = ROOT / 'data/portrait-review.json'
    review = json.loads(review_path.read_text())
    failures = []
    for aid, selection in selections.items():
        if args.artist and aid not in args.artist:
            continue
        try:
            if not selection.get('identityNotes') or not selection.get('identitySources'):
                raise ValueError('Selection requires identity evidence and a visual identification note')
            if selection['provider'] == 'youtube':
                source, metadata = selected_frame(selection, args.yt_dlp)
            elif selection['provider'] == 'commons':
                source, metadata = selected_photo(selection)
            else:
                raise ValueError('Unsupported source provider')
            if selection.get('additionalCredit'):
                metadata['author'] += ' · ' + selection['additionalCredit']
            with Image.open(source) as original:
                result = crop_image(original, selection, artists[aid]['kind'])
            result.save(STAGING / (aid + '.webp'), 'WEBP', quality=88)
            now = dt.datetime.now(dt.timezone.utc).isoformat()
            changes = ('전체 그룹 구도 유지·여백 추가. ' if artists[aid]['kind'] == 'group'
                       else f"얼굴 영역 {selection['box']} 크롭. ")
            staged[aid] = {k: metadata[k] for k in
                           ('originalUrl', 'sourceUrl', 'author', 'title', 'license', 'licenseUrl')}
            staged[aid].update(src=f'/images/artists/{aid}.webp', checkedAt=now,
                               identitySources=selection['identitySources'],
                               crop=metadata.get('crop', '') + changes + '256×256 WebP 변환, 색상 변경 없음.',
                               permission={'basis': 'license', 'url': metadata['licenseUrl']})
            row = review[aid]
            # Re-staging an included asset does not unpublish it; publication
            # still requires a matching reviewed SHA-256 in the approvals file.
            if row['state'] != 'included':
                row.update(state='visual-review', checkedAt=now, sources=selection['identitySources'],
                           reason=selection['identityNotes'], nextAction='후보 사진의 실제 인물·얼굴 크롭 시각 검토')
            p.write_json(staged_path, staged)
            p.write_json(review_path, review)
            print(aid, 'staged for visual review', flush=True)
        except Exception as error:
            failures.append(aid)
            print(aid, type(error).__name__, str(error)[:200], flush=True)
    if failures:
        raise SystemExit(f'{len(failures)} selections could not be staged: {", ".join(failures)}')


if __name__ == '__main__':
    main()
