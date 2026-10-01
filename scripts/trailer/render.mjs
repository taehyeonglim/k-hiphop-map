import { createServer } from 'node:http';
import { readFile, mkdir, stat, readdir, writeFile, copyFile, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, relative, extname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { chromium } from 'playwright';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '../..');
const cache = join(root, '.cache/trailer');
const output = join(root, 'public/media/trailer/v1');
const args = process.argv.slice(2);
const preview = args.includes('--preview');
const master = args.includes('--master');
const formatIndex = args.indexOf('--format');
const requested = formatIndex < 0 ? 'all' : args[formatIndex + 1];
if (!['all', 'landscape', 'portrait'].includes(requested)) throw new Error('--format must be landscape, portrait, or all');
const formats = requested === 'all' ? ['landscape', 'portrait'] : [requested];
const fps = 30;
const frames = 900;
const previewTimes = [1.4, 3.7, 6.2, 8.9, 11.3, 13.4, 16.8, 19.1, 21.2, 23.6, 26.5, 29.2];
await mkdir(output, { recursive: true });
await mkdir(join(cache, 'renders'), { recursive: true });
if (master) await mkdir(join(cache, 'masters'), { recursive: true });

async function command(program, parameters) {
  const process = spawn(program, parameters, { stdio: ['ignore', 'pipe', 'pipe'] });
  let error = '';
  let output = '';
  process.stdout.on('data', (chunk) => { output += chunk; });
  process.stderr.on('data', (chunk) => { error += chunk; });
  const [code] = await once(process, 'exit');
  if (code !== 0) throw new Error(`${program} failed (${code}): ${error.slice(-4000)}`);
  return output;
}

const dataset = JSON.parse(await readFile(join(root, 'public/data/map.json'), 'utf8'));
const graph = JSON.parse(await readFile(join(root, 'public/data/graph.json'), 'utf8'));
const manifestPath = join(cache, 'portraits/manifest.json');
if (!existsSync(manifestPath)) throw new Error('Missing trailer portraits; run node scripts/trailer/prepare-assets.mjs first.');
const portraits = JSON.parse(await readFile(manifestPath, 'utf8'));
const portraitAssets = Array.isArray(portraits) ? portraits : portraits.assets;
const fontDirectory = join(cache, 'fonts');
const fontFiles = existsSync(fontDirectory) ? (await readdir(fontDirectory)).filter((name) => /\.(woff2?|ttf|otf)$/i.test(name)) : [];
const notoFont = portraits.font?.path ?? (fontFiles.length ? join(fontDirectory, fontFiles.find((name) => /noto/i.test(name)) ?? fontFiles[0]) : undefined);
if (!notoFont || !existsSync(notoFont)) throw new Error('Missing local Korean font in portrait manifest or .cache/trailer/fonts.');
const assetUrl = (path) => `/asset?path=${encodeURIComponent(resolve(root, path))}`;
const artistMap = new Map(dataset.artists.map((artist) => [artist.id, artist]));
const coreIds = new Set(dataset.artists.filter((artist) => artist.core).map((artist) => artist.id));
const nodes = graph.nodes.filter((node) => coreIds.has(node.id)).map((node) => ({ ...node, name: artistMap.get(node.id)?.name ?? node.id }));
const nodeIds = new Set(nodes.map((node) => node.id));
const edges = graph.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
const collaborators = ['paloalto', 'dok2', 'verbal-jint', 'deepflow', 'tablo', 'tiger-jk'];
const recordingMap = new Map(dataset.recordings.map((recording) => [recording.id, recording]));
const closeupEdges = edges.filter((edge) => (edge.source === 'garion' && collaborators.includes(edge.target)) || (edge.target === 'garion' && collaborators.includes(edge.source))).map((edge) => ({ ...edge, song: recordingMap.get(edge.recordingIds[0])?.title ?? '' }));
if (closeupEdges.length !== collaborators.length) throw new Error('The trailer closeup must contain six source-backed Garion ties.');
const config = {
  fps, frames, duration: 30, asOf: dataset.asOf, nodes, edges, closeupEdges,
  artists: dataset.artists.filter((artist) => portraitAssets.some((asset) => asset.id === artist.id)).map((artist) => {
    const asset = portraitAssets.find((image) => image.id === artist.id);
    return { id: artist.id, name: artist.name, nameEn: artist.nameEn, image: assetUrl(asset.path ?? join(cache, 'portraits', asset.src)), nodeImage: assetUrl(asset.nodePath ?? asset.path), preferredFit: asset.preferredFit, faceCrop: asset.faceCrop };
  }),
  fonts: { noto: assetUrl(notoFont), anton: assetUrl('public/fonts/anton.ttf'), barlow: assetUrl('public/fonts/barlow-condensed.ttf') },
  website: 'k-hiphop-map.vercel.app', credits: '/credits/#trailer',
};

const mime = { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    if (url.pathname === '/config') { response.setHeader('content-type', 'application/json'); response.end(JSON.stringify(config)); return; }
    const path = url.pathname === '/asset' ? resolve(url.searchParams.get('path') ?? '') : join(root, 'scripts/trailer/scene.html');
    const fromRoot = relative(root, path);
    if (fromRoot.startsWith('..') || fromRoot.startsWith('/')) { response.writeHead(403); response.end(); return; }
    response.setHeader('content-type', mime[extname(path)] ?? 'application/octet-stream');
    response.end(await readFile(path));
  } catch (error) { response.writeHead(404); response.end(String(error)); }
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const port = server.address().port;
const localChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({ headless: true, executablePath: existsSync(localChrome) ? localChrome : undefined, args: ['--enable-gpu', ...(process.platform === 'darwin' ? ['--use-angle=metal'] : [])] });
const report = { version: 1, fps, frames, duration: 30, asOf: dataset.asOf, sourceNodes: nodes.length, sourceEdges: edges.length, portraitIds: config.artists.map((artist) => artist.id), outputs: [] };

try {
  for (const format of formats) {
    const portrait = format === 'portrait';
    const width = portrait ? (master ? 1080 : 720) : (master ? 1920 : 1280);
    const height = portrait ? (master ? 1920 : 1280) : (master ? 1080 : 720);
    const capture = join(cache, 'captures', portrait && existsSync(join(cache, 'captures/portrait-demo.webm')) ? 'portrait-demo.webm' : 'demo.webm');
    if (!existsSync(capture)) throw new Error(`Missing real product capture: ${capture}`);
    const captureFrames = join(cache, 'captures', `frames-${format}`);
    await mkdir(captureFrames, { recursive: true });
    await command('ffmpeg', ['-y', '-i', capture, '-t', '7.5', '-vf', `fps=30,scale=${portrait ? 720 : 1280}:-2`, '-q:v', '2', join(captureFrames, '%05d.jpg')]);
    config.demoFrameRoot = assetUrl(join(captureFrames, 'FRAME.jpg'));
    config.portrait = portrait;
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.__trailerReady);
    const render = async (time) => {
      const state = await page.evaluate((time) => window.__trailerRender(time), time);
      if (errors.length) throw new Error(`Scene errors: ${errors.join('; ')}`);
      return state;
    };
    if (preview) {
      const previews = [];
      for (const time of previewTimes) {
        await render(time);
        const path = join(cache, 'renders', `${format}-${String(time).replace('.', '-')}.png`);
        await page.screenshot({ path, type: 'png' });
        previews.push(await sharp(path).resize(portrait ? 180 : 320, portrait ? 320 : 180).toBuffer());
      }
      const thumbWidth = portrait ? 180 : 320;
      const thumbHeight = portrait ? 320 : 180;
      const contact = join(cache, 'renders', `${format}-contact.png`);
      await sharp({ create: { width: thumbWidth * 4, height: thumbHeight * 3, channels: 3, background: '#171c18' } }).composite(previews.map((input, index) => ({ input, left: index % 4 * thumbWidth, top: Math.floor(index / 4) * thumbHeight }))).png().toFile(contact);
      console.log(`Preview ${format}: ${contact}`);
      await render(26.5);
      await sharp(await page.screenshot({ type: 'png' })).webp({ quality: 90 }).toFile(join(output, `poster-${format}.webp`));
      await page.close();
      continue;
    }
    const videoPath = master ? join(cache, 'masters', `${format}-1080p-master.mp4`) : join(output, `${format}.mp4`);
    const beat = join(cache, 'beat.wav');
    if (!existsSync(beat)) throw new Error('Missing original soundtrack .cache/trailer/beat.wav.');
    const encodingPath = join(cache, 'renders', `${format}-${master ? 'master' : 'web'}-encoding.mp4`);
    const parameters = ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-vcodec', 'mjpeg', '-i', 'pipe:0', '-i', beat, '-map', '0:v:0', '-map', '1:a:0', '-frames:v', String(frames), '-t', '30', '-vf', 'scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', master ? '18' : '21', ...(master ? [] : ['-maxrate', '1750k', '-bufsize', '3500k']), '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-movflags', '+faststart', encodingPath];
    const encoder = spawn('ffmpeg', parameters, { stdio: ['pipe', 'ignore', 'pipe'] });
    let encoderErrors = '';
    encoder.stderr.on('data', (chunk) => { encoderErrors += chunk; });
    const exitPromise = once(encoder, 'exit');
    try {
      for (let frame = 0; frame < frames; frame++) {
        await render(frame / fps);
        const jpeg = await page.screenshot({ type: 'jpeg', quality: 94 });
        if (!encoder.stdin.write(jpeg)) await once(encoder.stdin, 'drain');
        if (frame % 150 === 0) console.log(`${format}: frame ${frame}/${frames}`);
      }
    } catch (error) { encoder.kill('SIGTERM'); throw error; }
    encoder.stdin.end();
    const [code] = await exitPromise;
    if (code !== 0) throw new Error(`Encoder failed: ${encoderErrors.slice(-4000)}`);
    const bytes = (await stat(encodingPath)).size;
    if (!master && bytes > 8_000_000) throw new Error(`Web video exceeds 8 MB: ${bytes}`);
    const media = JSON.parse(await command('ffprobe', ['-v', 'error', '-count_frames', '-show_entries', 'format=duration,size:stream=codec_name,width,height,pix_fmt,r_frame_rate,nb_read_frames,sample_rate', '-of', 'json', encodingPath]));
    const video = media.streams.find((stream) => stream.codec_name === 'h264');
    const audio = media.streams.find((stream) => stream.codec_name === 'aac');
    if (!video || video.width !== width || video.height !== height || video.pix_fmt !== 'yuv420p' || video.r_frame_rate !== '30/1' || Number(video.nb_read_frames) !== frames || !audio || audio.sample_rate !== '48000' || Math.abs(Number(media.format.duration) - 30) > 0.001) throw new Error(`Encoded media failed delivery contract: ${JSON.stringify(media)}`);
    const publicationPath = `${videoPath}.pending`;
    await copyFile(encodingPath, publicationPath);
    await rename(publicationPath, videoPath);
    await render(26.5);
    const posterPath = master ? join(cache, 'masters', `poster-${format}-1080p.webp`) : join(output, `poster-${format}.webp`);
    await sharp(await page.screenshot({ type: 'png' })).webp({ quality: 90 }).toFile(posterPath);
    report.outputs.push({ format, width, height, bytes, path: relative(root, videoPath), poster: relative(root, posterPath), video, audio, duration: Number(media.format.duration) });
    console.log(`Rendered ${format}: ${(bytes / 1_000_000).toFixed(2)} MB, ${videoPath}`);
    await page.close();
  }
  if (!preview) await writeFile(master ? join(cache, 'masters/manifest.json') : join(output, 'manifest.json'), `${JSON.stringify(report, null, 2)}\n`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
