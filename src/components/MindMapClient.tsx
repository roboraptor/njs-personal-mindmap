'use client';

import type { Map, Node } from '@/db/schema';
import dynamic from 'next/dynamic';

// Komponentu MindMapGraph importujeme dynamicky a vypneme pro ni server-side rendering (SSR).
// Tím zajistíme, že se bude načítat a spouštět pouze v prohlížeči.
const MindMapGraph = dynamic(() => import('@/components/MindMapGraph'), {
  ssr: false,
  loading: () => <p className="text-center mt-5">Načítání mapy...</p>,
});

// Definujeme typy pro props, které komponenta přijímá
interface MindMapClientProps {
  data: {
    nodes: Node[];
    links: { source: string; target: string }[];
  };
  mapConfig: Pick<Map, 'gravity_strength' | 'repulsion_force' | 'friction'>;
}

// Tato komponenta slouží jako klientský obal pro graf.
export default function MindMapClient({ data, mapConfig }: MindMapClientProps) {
  return <MindMapGraph data={data} mapConfig={mapConfig} />;
}
