import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Dataset, GraphSnapshot } from './types';
let datasetCache: { mtime: number; value: Dataset } | undefined;
export function getDataset(): Dataset { const path = join(process.cwd(), 'data/catalog.enriched.json'); const mtime = statSync(path).mtimeMs; if (!datasetCache || datasetCache.mtime !== mtime) datasetCache = { mtime, value: JSON.parse(readFileSync(path, 'utf8')) }; return datasetCache.value; }
export function getSnapshot(): GraphSnapshot { return JSON.parse(readFileSync(join(process.cwd(), 'public/data/graph.json'), 'utf8')); }
