'use client';

import type { Map, Node } from '@/db/schema';
import dynamic from 'next/dynamic';
import EditNodeModal from './EditNodeModal';
import { useNodeModal } from './useNodeModal';

// Komponentu MindMapGraph importujeme dynamicky a vypneme pro ni server-side rendering (SSR).
// Tím zajistíme, že se bude načítat a spouštět pouze v prohlížeči.
const MindMapGraph = dynamic(() => import('@/components/MindMapGraph'), {
  ssr: false,
  loading: () => <p className="text-center mt-5">Načítání mapy...</p>,
});

interface MindMapClientProps {
  data: {
    nodes: Node[];
    links: { source: string; target: string }[];
  };
  mapConfig: Pick<Map, 'gravity_strength' | 'repulsion_force' | 'friction'>;
  mapId: string;
}

// Tato komponenta slouží jako klientský obal pro graf.
export default function MindMapClient({ data, mapConfig, mapId }: MindMapClientProps) {
  const {
    isModalOpen,
    modalMode,
    editingNode,
    initialParentId,
    modalKey,
    handleNodeClick,
    handleNodeRightClick,
    handleCloseModal,
  } = useNodeModal();

  return (
    <>
      <MindMapGraph
        data={data}
        mapConfig={mapConfig}
        onNodeClick={handleNodeClick}
        onNodeRightClick={handleNodeRightClick}
      />
      {isModalOpen && (
        <EditNodeModal
          key={modalKey}
          mode={modalMode}
          node={editingNode}
          nodes={data.nodes}
          mapId={mapId}
          initialParentId={initialParentId}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
