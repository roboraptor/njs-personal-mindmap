'use client';

import type { Map, Node } from '@/db/schema';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import EditNodeModal from './EditNodeModal';
import { toggleNodeCollapse } from '@/actions/nodeActions';

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
  mapId: string;
}

// Tato komponenta slouží jako klientský obal pro graf.
export default function MindMapClient({ data, mapConfig, mapId }: MindMapClientProps) {
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('edit');
  const [initialParentId, setInitialParentId] = useState<string>('');

  useEffect(() => {
    const handleOpenAddNodeModal = () => {
      setModalMode('create');
      setEditingNode(null);
      setInitialParentId('');
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
    setInitialParentId('');
  };

  return (
    <>
      <MindMapGraph 
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
        initialParentId={initialParentId}
        onClose={handleCloseModal} 
      />
    </>
  );
}
