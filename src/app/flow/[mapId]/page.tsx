import { nodesRepository } from '@/data/nodesRepository';
import { crossLinksRepository } from '@/data/crossLinksRepository';
import { mapsRepository } from '@/data/mapsRepository';
import { notFound } from 'next/navigation';
import FlowMapClient from '@/components/FlowMapClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface MapPageProps {
  params: {
    mapId: string;
  };
}

export default async function FlowPage({ params }: MapPageProps) {
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
    links: [
      ...links.map(l => ({ source: l.source_node_id, target: l.target_node_id })),
      ...nodes.filter(n => n.parent_id).map(n => ({ source: n.parent_id!, target: n.id }))
    ],
  };

  const mapConfig = {
    gravity_strength: map.gravity_strength,
    repulsion_force: map.repulsion_force,
    friction: map.friction,
  }

  return (
    <main>
      <FlowMapClient data={graphData} mapConfig={mapConfig} mapId={mapId} />
    </main>
  );
}