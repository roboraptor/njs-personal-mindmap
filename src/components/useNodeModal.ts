'use client';

import { toggleNodeCollapse } from '@/actions/nodeActions';
import type { Node } from '@/db/schema';
import { useCallback, useEffect, useState } from 'react';

export function useNodeModal() {
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('edit');
  const [initialParentId, setInitialParentId] = useState<string>('');
  const [initialFlowPos, setInitialFlowPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleOpenAddNodeModal = () => {
      setModalMode('create');
      setEditingNode(null);
      setInitialParentId('');
      setInitialFlowPos(null);
      setIsModalOpen(true);
    };

    window.addEventListener('openAddNodeModal', handleOpenAddNodeModal);
    return () => {
      window.removeEventListener('openAddNodeModal', handleOpenAddNodeModal);
    };
  }, []);

  const handleNodeClick = useCallback((node: Node) => {
    setModalMode('edit');
    setEditingNode(node);
    setIsModalOpen(true);
  }, []);

  const handleNodeRightClick = useCallback((node: Node) => {
    if (node.display_type === 'collapsible') {
      toggleNodeCollapse(node.id, node.map_id, node.is_collapsed ?? false);
    }
  }, []);

  const handleAddChildClick = useCallback((parentNode: Node, position?: { x: number; y: number }) => {
    setModalMode('create');
    setEditingNode(null);
    setInitialParentId(parentNode.id);
    if (position) {
      setInitialFlowPos({ x: position.x, y: position.y + 100 });
    } else {
      setInitialFlowPos(null);
    }
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingNode(null);
    setInitialParentId('');
    setInitialFlowPos(null);
  }, []);

  const modalKey =
    modalMode === 'edit' && editingNode
      ? `edit-${editingNode.id}`
      : `create-${initialParentId}-${initialFlowPos?.x ?? ''}-${initialFlowPos?.y ?? ''}`;

  return {
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
  };
}
