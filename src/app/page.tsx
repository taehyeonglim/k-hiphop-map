import { readFileSync } from 'node:fs';
import MapExplorer from '@/components/MapExplorer';
import type { Dataset, GraphSnapshot } from '@/lib/types';
export default function Home() { const dataset: Dataset = JSON.parse(readFileSync('public/data/map.json','utf8')); const snapshot: GraphSnapshot = JSON.parse(readFileSync('public/data/graph.json','utf8')); return <MapExplorer dataset={dataset} snapshot={{...snapshot,edges:[]}}/>; }
