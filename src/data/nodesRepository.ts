import { db } from '@/db';
import { nodes } from '@/db/schema';
import type { Node } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function getNodesByMapId(mapId: string): Promise<Node[]> {
  return db.query.nodes.findMany({
    where: eq(nodes.map_id, mapId),
  });
}

export const nodesRepository = {
  getNodesByMapId,
};