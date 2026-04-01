'use client';

import type { Map, Node } from '@/db/schema';
import { useEffect, useState } from 'react';
import EditNodeModal from './EditNodeModal';
import { toggleNodeCollapse } from '@/actions/nodeActions';
import FlowMapGraph from './FlowMapGraph';

interface FlowMapClientProps {
  data: {
    nodes: Node[];
    links: { source: string; target: string }[];
  };
  mapConfig: Pick<Map, 'gravity_strength' | 'repulsion_force' | 'friction'>;
  mapId: string;
}

export default function FlowMapClient({ data, mapConfig, mapId }: FlowMapClientProps) {
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('edit');

  useEffect(() => {
    const handleOpenAddNodeModal = () => {
      setModalMode('create');
      setEditingNode(null);
      setIsModalOpen(true);
    };

    window.addEventListener('openAddNodeModal', handleOpenAddNodeModal);
    return () => {
      window.removeEventListener('openAddNodeModal', handleOpenAddNodeModal);
    };
  }, []);

  const handleNodeClick = (node: Node) => {
    setModalMode('edit');
    setEditingNode(node);
    setIsModalOpen(true);
  };

  const handleNodeRightClick = (node: Node) => {
    if (node.display_type === 'collapsible') {
        toggleNodeCollapse(node.id, node.map_id, node.is_collapsed ?? false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNode(null);
  };

  return (
    <>
      <FlowMapGraph 
        data={data} 
        mapConfig={mapConfig} 
        onNodeClick={handleNodeClick}
        onNodeRightClick={handleNodeRightClick}
      />
      <EditNodeModal 
        isOpen={isModalOpen}
        mode={modalMode}
        node={editingNode} 
        nodes={data.nodes}
        mapId={mapId}
        onClose={handleCloseModal} 
      />
    </>
  );
}