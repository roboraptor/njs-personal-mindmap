import { nodesRepository } from '@/data/nodesRepository';
import { crossLinksRepository } from '@/data/crossLinksRepository';
import { mapsRepository } from '@/data/mapsRepository';
import { notFound } from 'next/navigation';
import MindMapClient from '@/components/MindMapClient';

// Vynutíme dynamické renderování a zakážeme cachování pro tuto stránku.
// To zajistí, že se data budou vždy načítat čerstvá z databáze.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface MapPageProps {
  params: {
    mapId: string;
  };
}

export default async function MapPage({ params }: MapPageProps) {
  const resolvedParams = await params;
  const { mapId } = resolvedParams;
  const map = await mapsRepository.getById(mapId);
  const nodes = await nodesRepository.getByMapId(mapId);
  const links = await crossLinksRepository.getByMapId(mapId);

  if (!map) {
    notFound();
  }

  const graphData = {
    nodes,
    links: links.map(l => ({ source: l.source_node_id, target: l.target_node_id })),
  };

  const mapConfig = {
    gravity_strength: map.gravity_strength,
    repulsion_force: map.repulsion_force,
    friction: map.friction,
  }

  return (
    <main>
      <MindMapClient data={graphData} mapConfig={mapConfig} />
    </main>
  );
}
