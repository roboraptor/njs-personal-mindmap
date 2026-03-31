import { db } from '@/db';
import { maps } from '@/db/schema';
import type { Map } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

type NewMap = Omit<Map, 'created_at' | 'updated_at' | 'gravity_strength' | 'repulsion_force' | 'friction' | 'theme_json'>;

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
async function create(newMapData: Partial<NewMap> & { id: string, title: string }): Promise<Map> {
    const [newMap] = await db.insert(maps).values({
        ...newMapData,
        description: newMapData.description ?? null,
    }).returning();

    return newMap;
}

/**
 * Smaže mapu podle jejího ID.
 */
async function deleteById(id: string): Promise<void> {
    await db.delete(maps).where(eq(maps.id, id));
}

/**
 * Aktualizuje mapu podle jejího ID.
 */
async function update(id: string, data: Partial<Omit<Map, 'id' | 'created_at'>>): Promise<Map> {
    const [updatedMap] = await db.update(maps).set({
        ...data,
        updated_at: new Date(),
    }).where(eq(maps.id, id)).returning();
    return updatedMap;
}

export const mapsRepository = {
    getAll,
    getById,
    create,
    deleteById,
    update,
};