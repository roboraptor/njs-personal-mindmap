import { mapsRepository } from '@/data/mapsRepository';
import { nodesRepository } from '@/data/nodesRepository';
import { crossLinksRepository } from '@/data/crossLinksRepository';
import { notFound } from 'next/navigation';

export async function loadMapViewData(mapId: string) {
  const map = await mapsRepository.getById(mapId);
  if (!map) {
    notFound();
  }

  const [nodes, links] = await Promise.all([
    nodesRepository.getByMapId(mapId),
    crossLinksRepository.getByMapId(mapId),
  ]);

  return {
    graphData: {
      nodes,
      links: [
        ...links.map(l => ({ source: l.source_node_id, target: l.target_node_id })),
        ...nodes.filter(n => n.parent_id).map(n => ({ source: n.parent_id!, target: n.id })),
      ],
    },
    mapConfig: {
      gravity_strength: map.gravity_strength,
      repulsion_force: map.repulsion_force,
      friction: map.friction,
    },
  };
}
