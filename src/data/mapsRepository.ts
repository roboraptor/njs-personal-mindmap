import { db } from '@/db';
import { maps } from '@/db/schema';
import type { Map } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

type NewMapData = Pick<Map, 'title' | 'description'>;

/**
 * Získá všechny mapy.
 */
async function getAll(): Promise<Map[]> {
    return db.query.maps.findMany({
        orderBy: [desc(maps.updated_at)],
    });
}

/**
 * Získá mapu podle jejího ID.
 */
async function getById(id: string): Promise<Map | undefined> {
    return db.query.maps.findFirst({
        where: eq(maps.id, id),
    });
}

/**
 * Vytvoří novou mapu.
 */
async function create({ title, description }: NewMapData): Promise<Map> {
    const [newMap] = await db.insert(maps).values({
        id: crypto.randomUUID(),
        title,
        description: description ?? null,
    }).returning();

    return newMap;
}

export const mapsRepository = {
    getAll,
    getById,
    create,
};