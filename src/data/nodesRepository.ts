import { db } from '@/db';
import { nodes } from '@/db/schema';
import type { Node } from '@/db/schema';
import { eq } from 'drizzle-orm';

type NewNode = typeof nodes.$inferInsert;

async function getByMapId(mapId: string): Promise<Node[]> {
  return db.query.nodes.findMany({
    where: eq(nodes.map_id, mapId),
  });
}

async function create(newNodeData: Omit<NewNode, 'created_at' | 'updated_at'>): Promise<Node> {
    const [newNode] = await db.insert(nodes).values(newNodeData).returning();
    return newNode;
}

async function update(id: string, data: Partial<Omit<Node, 'id' | 'created_at' | 'map_id'>>): Promise<Node> {
    const [updatedNode] = await db.update(nodes).set({
        ...data,
        updated_at: new Date(),
    }).where(eq(nodes.id, id)).returning();
    return updatedNode;
}

async function updatePositions(
  updates: Array<{ id: string; flow_x: number; flow_y: number }>
): Promise<void> {
  if (updates.length === 0) return;
  const now = new Date();
  db.transaction((tx) => {
    for (const u of updates) {
      tx.update(nodes)
        .set({ flow_x: u.flow_x, flow_y: u.flow_y, updated_at: now })
        .where(eq(nodes.id, u.id))
        .run();
    }
  });
}

async function deleteById(id: string): Promise<void> {
    await db.delete(nodes).where(eq(nodes.id, id));
}

export const nodesRepository = {
  getByMapId,
  create,
  update,
  updatePositions,
  deleteById,
};