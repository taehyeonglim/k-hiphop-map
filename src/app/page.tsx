import { readFileSync } from 'node:fs';
import MapBootstrap from '@/components/MapBootstrap';
import type { GraphSnapshot } from '@/lib/types';

export const metadata = { alternates: { canonical: '/' } };

export default function Home() {
  const snapshot: GraphSnapshot = JSON.parse(readFileSync('public/data/graph.json', 'utf8'));
  // The cacheable map dataset loads independently of the initial HTML.
  return <MapBootstrap summary={{ ...snapshot, nodes: [], edges: [] }} />;
}
