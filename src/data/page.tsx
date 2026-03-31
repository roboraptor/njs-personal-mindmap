import { mapsRepository } from '@/data/mapsRepository';
import { nodesRepository } from '@/data/nodesRepository';
import { crossLinksRepository } from '@/data/crossLinksRepository';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { Node } from '@/db/schema';

// Dynamicky importujeme komponentu grafu, aby se vykreslovala pouze na klientovi.
const MindMapGraph = dynamic(() => import('@/components/MindMapGraph'), {
  ssr: false,
  loading: () => <p className="text-center mt-5">Načítám mapu...</p>,
});

interface Link {
  source: string;
  target: string;
}

export default async function MapPage({ params }: { params: { mapId: string } }) {
  const mapId = params.mapId;

  // Načteme všechna potřebná data paralelně.
  const [map, nodes, crossLinks] = await Promise.all([
    mapsRepository.getById(mapId),
    nodesRepository.getNodesByMapId(mapId),
    crossLinksRepository.getCrossLinksByMapId(mapId),
  ]);

  if (!map) {
    notFound();
  }

  // Transformujeme data do formátu, který vyžaduje react-force-graph-2d.
  const parentLinks: Link[] = nodes
    .filter((node): node is Node & { parent_id: string } => !!node.parent_id)
    .map(node => ({
      source: node.parent_id,
      target: node.id,
    }));

  const crossGraphLinks: Link[] = crossLinks.map(link => ({
    source: link.source_node_id,
    target: link.target_node_id,
  }));

  const graphData = {
    nodes: nodes,
    links: [...parentLinks, ...crossGraphLinks],
  };

  return (
    <main className="d-flex flex-column vh-100">
      <div className="p-3 border-bottom bg-light">
        <h1>{map.title}</h1>
        {map.description && <p className="text-muted mb-0">{map.description}</p>}
      </div>
      <div className="flex-grow-1 position-relative bg-white">
        <div className="position-absolute top-0 start-0 w-100 h-100">
            <MindMapGraph data={graphData} mapConfig={map} />
        </div>
      </div>
    </main>
  );
}