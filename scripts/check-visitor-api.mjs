import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// A bundler can resolve extensionless TS imports that fail in Vercel's native
// ESM function runtime. Compile and execute that runtime shape before release.
const root = resolve(import.meta.dirname, '..');
const output = resolve(root, '.cache/visitor-api-check');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const compiled = spawnSync(process.execPath, [
  'node_modules/typescript/bin/tsc', 'api/visitors.ts', '--outDir', output,
  '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022',
  '--strict', '--skipLibCheck', '--noEmitOnError',
], { cwd: root, encoding: 'utf8' });
if (compiled.status !== 0) {
  process.stderr.write(compiled.stdout + compiled.stderr);
  process.exit(compiled.status ?? 1);
}
const { default: handler } = await import(pathToFileURL(resolve(output, 'api/visitors.js')).href);
const response = await handler.fetch(new Request('https://k-hiphop-map.vercel.app/api/visitors', { method: 'DELETE' }));
assert.equal(response.status, 405);
assert.equal(response.headers.get('allow'), 'GET, POST');
console.log('Visitor API native ESM compile/import/request check passed (no counter writes).');
