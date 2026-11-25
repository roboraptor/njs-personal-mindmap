'use client';

import type { Map, Node } from '@/db/schema';
import EditNodeModal from './EditNodeModal';
import FlowMapGraph from './FlowMapGraph';
import { useNodeModal } from './useNodeModal';

interface FlowMapClientProps {
  data: {
    nodes: Node[];
    links: { source: string; target: string }[];
  };
  mapConfig: Pick<Map, 'gravity_strength' | 'repulsion_force' | 'friction'>;
  mapId: string;
}

export default function FlowMapClient({ data, mapConfig, mapId }: FlowMapClientProps) {
  const {
    isModalOpen,
    modalMode,
    editingNode,
    initialParentId,
    initialFlowPos,
    modalKey,
    handleNodeClick,
    handleNodeRightClick,
    handleAddChildClick,
    handleCloseModal,
  } = useNodeModal();

  return (
    <>
      <FlowMapGraph
        data={data}
        mapConfig={mapConfig}
        mapId={mapId}
        onNodeClick={handleNodeClick}
        onNodeRightClick={handleNodeRightClick}
        onAddChildClick={handleAddChildClick}
      />
      {isModalOpen && (
        <EditNodeModal
          key={modalKey}
          mode={modalMode}
          node={editingNode}
          nodes={data.nodes}
          mapId={mapId}
          initialParentId={initialParentId}
          initialFlowPos={initialFlowPos}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
