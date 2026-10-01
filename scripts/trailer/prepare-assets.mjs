#!/usr/bin/env node
/** Prepare real, attributed trailer photographs and a reproducible OFL font.
 * No image generation and no discovery: every portrait is an existing verified
 * catalogue asset. Run: node scripts/trailer/prepare-assets.mjs
 * Python fontTools + Brotli are used for the Korean WOFF2 subset.
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, '.cache/trailer/portraits');
const FONT_CACHE = path.join(ROOT, '.cache/trailer/fonts');
const FONT_OUT = path.join(ROOT, 'public/fonts/noto-sans-kr-trailer.woff2');
const FONT_LICENSE = path.join(ROOT, 'public/fonts/noto-sans-kr-trailer-OFL.txt');
const CREDITS = path.join(ROOT, 'public/media/trailer/v1/credits.json');
const IDS = ['garion', 'drunken-tiger', 'dynamic-duo', 'e-sens', 'beenzino',
  'changmo', 'bewhy', 'lee-young-ji', 'paloalto', 'dok2', 'verbal-jint',
  'deepflow', 'tablo', 'tiger-jk'];
// Reviewed optional source rectangles, in prepared-image pixels. Group photos
// of Garion and Dynamic Duo are deliberately preserved without member crops.
const FACE_CROPS = {
  'drunken-tiger': { x: 67, y: 0, width: 202, height: 202 },
  paloalto: { x: 123, y: 0, width: 286, height: 286 },
};
const FONT_REV = '9710da1eacb3be272583c3224dcb70f9da6eadbb';
const FONT_BASE = `https://raw.githubusercontent.com/google/fonts/${FONT_REV}/ofl/notosanskr/`;
const FONT_SOURCE = `https://github.com/google/fonts/blob/${FONT_REV}/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf`;
const USER_AGENT = 'KHipHopMap/1.0 (https://github.com/taehyeonglim; source-attributed archive)';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const exists = async p => { try { await access(p); return true; } catch { return false; } };
const writeJSON = async (p, data) => {
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, `${JSON.stringify(data, null, 2)}\n`);
};
const download = async (url, destination) => {
  if (await exists(destination)) return;
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} downloading ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
};

await mkdir(OUT, { recursive: true });
const portraits = JSON.parse(await readFile(path.join(ROOT, 'data/portraits.json'), 'utf8'));
const seeds = JSON.parse(await readFile(path.join(ROOT, 'data/seeds.json'), 'utf8'));
const catalog = JSON.parse(await readFile(path.join(ROOT, 'data/catalog.json'), 'utf8'));
const names = new Map([...seeds, ...catalog.artists].map(a => [a.id, a]));
const assets = [];
for (const id of IDS) {
  const credit = portraits[id];
  const artist = names.get(id);
  if (!credit || !artist) throw new Error(`Missing verified asset/name for ${id}`);
  if (!/^CC[- ]BY(?:[- ]SA)?[- ](?:2\.0(?: kr)?|3\.0|4\.0)$/.test(credit.license)) {
    throw new Error(`Unsupported portrait licence for ${id}: ${credit.license}`);
  }
  const existingCache = path.join(ROOT, '.cache/portraits', `image-${sha256(credit.originalUrl)}`);
  const cache = await exists(existingCache) ? existingCache : path.join(OUT, 'originals', id);
  // Existing collection caches are preferred; source URL is retained verbatim.
  await download(credit.originalUrl, cache);
  const filename = `${id}.webp`;
  const destination = path.join(OUT, filename);
  await sharp(cache).rotate().resize({ width: 960, height: 960, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 94, effort: 6 }).toFile(destination);
  const metadata = await sharp(destination).metadata();
  const sourceMetadata = await sharp(cache).metadata();
  const title = decodeURIComponent(credit.sourceUrl.split('/wiki/')[1] ?? '').replace(/^File:/, '');
  assets.push({ id, name: artist.name, nameEn: artist.nameEn, kind: artist.kind,
    title, path: destination, src: filename, nodePath: path.join(ROOT, 'public', credit.src),
    nodeSrc: credit.src, nodeChanges: credit.crop, width: metadata.width, height: metadata.height,
    originalWidth: sourceMetadata.width, originalHeight: sourceMetadata.height,
    originalUrl: credit.originalUrl, sourceUrl: credit.sourceUrl, author: credit.author,
    license: credit.license, licenseUrl: credit.licenseUrl,
    change: 'EXIF orientation normalized; proportional resize to a maximum 960px side without upscaling; WebP encoding; complete source composition and colour preserved.',
    preferredFit: artist.kind === 'group' ? 'contain' : 'cover',
    faceCrop: FACE_CROPS[id] ?? null,
    sha256: sha256(await readFile(destination)) });
}
await writeJSON(path.join(OUT, 'manifest.json'), { version: 1, assets });
console.log(`Prepared ${assets.length} licensed portrait assets: ${path.join(OUT, 'manifest.json')}`);
if (process.argv.includes('--portraits-only')) process.exit(0);

await mkdir(FONT_CACHE, { recursive: true });
const fullFont = path.join(FONT_CACHE, 'NotoSansKR-wght.ttf');
const licenseCache = path.join(FONT_CACHE, 'OFL.txt');
await download(`${FONT_BASE}NotoSansKR%5Bwght%5D.ttf`, fullFont);
await download(`${FONT_BASE}OFL.txt`, licenseCache);
await writeFile(FONT_LICENSE, (await readFile(licenseCache, 'utf8')).replace(/[\t ]+$/gm, ''));
// Every modern Korean syllable plus Latin, punctuation, names from the current
// catalogue. Weight 100–900 is retained; the modified subset has a new family.
const extraText = [...names.values()].map(a => `${a.name ?? ''} ${a.nameEn ?? ''}`).join(' ');
await writeFile(path.join(FONT_CACHE, 'extra-text.txt'), `${extraText} 한국힙합 연결고리 한 곡의 연결 세대를 넘어 1995부터 지금까지 가리온 그다음 누가 연결되어 있을까 곡으로 이어진 힙합의 지도 실제 발매곡 공동 작업 협업 네트워크 아카이브 직접 탐험해보세요 출처 · — → ×`);
const python = String.raw`
import sys
from fontTools.ttLib import TTFont
from fontTools import subset
font = TTFont(sys.argv[1], recalcTimestamp=False)
opts = subset.Options()
opts.flavor = 'woff2'
opts.recalc_timestamp = False
opts.name_IDs = ['*']
opts.name_legacy = True
opts.name_languages = ['*']
opts.notdef_glyph = True
opts.notdef_outline = True
opts.recommended_glyphs = True
sub = subset.Subsetter(options=opts)
characters = set(range(0x20, 0x100)) | set(range(0xAC00, 0xD7A4)) | set(range(0x1100, 0x1200)) | set(range(0x3130, 0x3190))
characters |= {ord(c) for c in open(sys.argv[2], encoding='utf8').read()}
sub.populate(unicodes=characters)
sub.subset(font)
family = 'K HipHop Trailer Sans'
for item in font['name'].names:
    if item.nameID in (1, 4, 16):
        item.string = family.encode(item.getEncoding())
    elif item.nameID == 6:
        item.string = 'KHipHopTrailerSans'.encode(item.getEncoding())
font.flavor = 'woff2'
font.save(sys.argv[3])
print('WOFF2 glyphs:', len(font.getGlyphOrder()))
`;
const result = spawnSync('python3', ['-c', python, fullFont, path.join(FONT_CACHE, 'extra-text.txt'), FONT_OUT], { encoding: 'utf8', maxBuffer: 1024 * 1024 });
if (result.status !== 0) throw new Error(`Font subset failed: ${result.stderr}`);
const font = { family: 'K HipHop Trailer Sans', upstreamFamily: 'Noto Sans KR',
  weight: '100 900', path: FONT_OUT, src: '/fonts/noto-sans-kr-trailer.woff2',
  author: 'Adobe',
  copyright: "Copyright 2014–2021 Adobe, with Reserved Font Name 'Source'",
  designers: 'Ryoko Nishizuka; Paul D. Hunt; Sandoll Communications; Soo-young Jang; Joo-yeon Kang',
  sourceUrl: FONT_SOURCE,
  license: 'SIL Open Font License 1.1', licenseUrl: 'https://openfontlicense.org/open-font-license-official-text/',
  licensePath: FONT_LICENSE, licenseSrc: '/fonts/noto-sans-kr-trailer-OFL.txt',
  noticeUrl: '/fonts/noto-sans-kr-trailer-OFL.txt',
  changes: 'WOFF2 subset retaining modern Hangul syllables, Korean jamo, Latin, punctuation and current catalogue names; variable weights retained; modified family renamed K HipHop Trailer Sans.',
  revision: FONT_REV, sourceSha256: sha256(await readFile(fullFont)), sha256: sha256(await readFile(FONT_OUT)),
  bytes: (await readFile(FONT_OUT)).length };
await writeJSON(path.join(FONT_CACHE, 'manifest.json'), font);
await writeJSON(path.join(OUT, 'manifest.json'), { version: 1, assets, font });

const assetCredit = a => ({ id: a.id, name: a.name, nameEn: a.nameEn, title: a.title,
  sourceUrl: a.sourceUrl, originalUrl: a.originalUrl, author: a.author, license: a.license,
  licenseUrl: a.licenseUrl,
  changes: `${a.change} Small-node derivative: ${a.nodeChanges} Trailer presentation: animated position/scale and circular or panel clipping; ${['garion', 'drunken-tiger'].includes(a.id) ? 'grayscale and 1.12 contrast adjustment in the roots scene, with original-colour presentation in other scenes' : 'colour unchanged'}.`,
});
await writeJSON(CREDITS, { version: 1, title: '한국힙합 연결고리',
  creator: { name: '임태형 a.k.a. Lyricist', url: 'https://github.com/taehyeonglim' },
  heroPortraits: assets.map(assetCredit), font: {
    family: font.family, upstreamFamily: font.upstreamFamily, weight: font.weight,
    src: font.src, author: font.author, copyright: font.copyright, designers: font.designers,
    sourceUrl: font.sourceUrl,
    license: font.license, licenseUrl: font.licenseUrl, licenseSrc: font.licenseSrc, noticeUrl: font.noticeUrl,
    changes: font.changes, revision: font.revision, sourceSha256: font.sourceSha256,
    sha256: font.sha256, bytes: font.bytes,
  },
  serviceScreenCapture: {
    sourceUrl: 'https://k-hiphop-map.vercel.app/map/',
    photographCreditsUrl: 'https://k-hiphop-map.vercel.app/credits/',
    description: 'Real service interface capture. The following inventory preserves all licensed photograph sources available to the captured map; visibility differs by shot and not every inventory photograph appears in the trailer.',
    photographInventory: Object.entries(portraits).map(([id, p]) => ({ id,
      name: names.get(id)?.name ?? id, title: decodeURIComponent(p.sourceUrl.split('/wiki/')[1] ?? '').replace(/^File:/, ''),
      sourceUrl: p.sourceUrl, originalUrl: p.originalUrl, author: p.author,
      license: p.license, licenseUrl: p.licenseUrl, changes: `${p.crop} Service screen capture may be cropped and scaled in the trailer.` })),
    dataSources: [
      { name: 'MusicBrainz core music metadata', sourceUrl: 'https://musicbrainz.org/doc/About/Data_License', license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' },
      { name: 'MusicBrainz supplementary tags and genre associations, where displayed', sourceUrl: 'https://musicbrainz.org/doc/About/Data_License', license: 'CC BY-NC-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/3.0/' },
      { name: 'maniadb-derived catalogue metadata, where displayed', sourceUrl: 'https://www.maniadb.com/api', license: 'CC BY-NC-SA 2.0 KR', licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/2.0/kr/' },
    ],
    changes: 'Screen capture of the existing interface; cropped/scaled and combined with original motion graphics.'
  },
  originalGraphics: { author: '임태형 a.k.a. Lyricist', description: 'Original typography, graph-data motion, transitions and layout. Photograph licences remain separate.' },
  originalBeat: { author: '임태형 a.k.a. Lyricist', description: 'Original synthesized 96 BPM / 12-bar / F-sharp minor instrumental; no pre-existing song samples, recordings or artist voices.' },
  licenceNote: 'Individual photograph and data licences remain in effect. Attribution of an artist image does not imply that artist participated in or endorsed this trailer. CC BY-SA adaptations retain the applicable share-alike terms; this manifest does not replace their licence terms.',
});
console.log(`${result.stdout.trim()}; font ${font.bytes} bytes; credits ${CREDITS}`);
