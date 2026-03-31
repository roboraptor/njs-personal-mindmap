import { db } from '@/db';
import { nodes } from '@/db/schema';
import type { Node } from '@/db/schema';
import { eq } from 'drizzle-orm';

type NewNode = Omit<Node, 'created_at' | 'updated_at' | 'distance' | 'angle' | 'mass' | 'is_collapsed' | 'style_json' | 'sort_order'>;

async function getByMapId(mapId: string): Promise<Node[]> {
  return db.query.nodes.findMany({
    where: eq(nodes.map_id, mapId),
  });
}

async function create(newNodeData: Partial<NewNode> & { id: string, map_id: string, title: string }): Promise<Node> {
    const [newNode] = await db.insert(nodes).values(newNodeData).returning();
    return newNode;
}

export const nodesRepository = {
  getByMapId,
  create,
};