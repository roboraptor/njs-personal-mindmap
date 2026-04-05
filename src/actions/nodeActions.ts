'use server';

import { nodesRepository } from '@/data/nodesRepository';
import { revalidatePath } from 'next/cache';
import type { Node } from '@/db/schema';
import { nodes } from '@/db/schema';

export async function createNode(
  mapId: string,
  data: Partial<Omit<Node, 'id' | 'created_at' | 'updated_at' | 'map_id'>>
) {
  try {
    const newNodeData = {
      id: crypto.randomUUID(),
      map_id: mapId,
      title: data.title || 'Nový uzel',
      ...data,
    } as typeof nodes.$inferInsert;
    await nodesRepository.create(newNodeData);
    revalidatePath(`/maps/${mapId}`);
  } catch (error) {
    console.error('Chyba při vytváření uzlu:', error);
  }
}

export async function updateNode(
  nodeId: string,
  mapId: string,
  data: Partial<Omit<Node, 'id' | 'created_at' | 'updated_at' | 'map_id'>>
) {
  try {
    await nodesRepository.update(nodeId, data);
    revalidatePath(`/maps/${mapId}`);
  } catch (error) {
    console.error('Chyba při aktualizaci uzlu:', error);
    // Zde bychom mohli vrátit chybový stav
  }
}

export async function toggleNodeCollapse(nodeId: string, mapId: string, is_collapsed: boolean) {
    try {
        await nodesRepository.update(nodeId, { is_collapsed: !is_collapsed });
        revalidatePath(`/maps/${mapId}`);
        revalidatePath(`/flow/${mapId}`);
    } catch (error) {
        console.error('Chyba při změně stavu sbalení uzlu:', error);
    }
}

export async function updateNodePosition(nodeId: string, mapId: string, flow_x: number, flow_y: number) {
  try {
    await nodesRepository.update(nodeId, { flow_x, flow_y });
    revalidatePath(`/flow/${mapId}`);
  } catch (error) {
    console.error('Chyba při aktualizaci pozice uzlu:', error);
  }
}

export async function deleteNodeWithChildren(nodeId: string, mapId: string) {
    try {
        await nodesRepository.deleteById(nodeId);
        revalidatePath(`/maps/${mapId}`);
        revalidatePath(`/flow/${mapId}`);
    } catch (error) {
        console.error('Chyba při mazání uzlu s potomky:', error);
    }
}

export async function deleteNodeOnly(nodeId: string, mapId: string) {
    try {
        const allNodes = await nodesRepository.getByMapId(mapId);
        const nodeToDelete = allNodes.find((n: Node) => n.id === nodeId);
        
        if (nodeToDelete) {
            const children = allNodes.filter((n: Node) => n.parent_id === nodeId);
            for (const child of children) {
                await nodesRepository.update(child.id, { parent_id: nodeToDelete.parent_id });
            }
        }
        
        await nodesRepository.deleteById(nodeId);
        revalidatePath(`/maps/${mapId}`);
        revalidatePath(`/flow/${mapId}`);
    } catch (error) {
        console.error('Chyba při mazání samotného uzlu:', error);
    }
}
