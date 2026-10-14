'use client';

import dynamic from 'next/dynamic';
import type { Lineup3DItem } from './Lineup3D';

// Three.js is ~150 kB gzipped: load it only on the client, after first paint.
const Lineup3D = dynamic(() => import('./Lineup3D'), { ssr: false });

export default function Lineup3DLoader({ items }: { items: Lineup3DItem[] }) {
  return <Lineup3D items={items} />;
}
