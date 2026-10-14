'use client';

import dynamic from 'next/dynamic';
import type { CarColor } from './CarDemo3D';

const CarDemo3D = dynamic(() => import('./CarDemo3D'), { ssr: false });

export default function CarDemo3DLoader({ colors }: { colors: CarColor[] }) {
  return <CarDemo3D colors={colors} />;
}
