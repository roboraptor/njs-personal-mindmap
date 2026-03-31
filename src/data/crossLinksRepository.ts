import { db } from '@/db';
import { cross_links } from '@/db/schema';
import type { CrossLink } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function getByMapId(mapId: string): Promise<CrossLink[]> {
  return db.query.cross_links.findMany({
    where: eq(cross_links.map_id, mapId),
  });
}

export const crossLinksRepository = {
  getByMapId,
};