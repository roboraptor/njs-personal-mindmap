'use server';

import { mapsRepository } from '@/data/mapsRepository';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';

export async function createMap(prevState: { message: string }, formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title || title.trim().length === 0) {
        return { message: 'Název mapy je povinný.' };
    }

    try {
        await mapsRepository.create({
            id: randomUUID(),
            title,
            description,
        });

        revalidatePath('/settings/maps');
        revalidatePath('/', 'layout'); // Pro aktualizaci dropdownu v hlavičce
        return { message: 'success' };
    } catch (error) {
        console.error('Chyba při vytváření mapy:', error);
        return { message: 'Nepodařilo se vytvořit mapu.' };
    }
}

export async function deleteMap(formData: FormData) {
    const mapId = formData.get('mapId') as string;

    if (!mapId) {
        throw new Error('Chybí ID mapy pro smazání.');
    }

    try {
        await mapsRepository.deleteById(mapId);
        revalidatePath('/settings/maps');
        revalidatePath('/', 'layout');
    } catch (error) {
        console.error('Chyba při mazání mapy:', error);
        // Zde bychom mohli vrátit chybovou hlášku, pokud by to bylo potřeba
    }
}

export async function updateMap(prevState: { message: string }, formData: FormData) {
    const mapId = formData.get('mapId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title || title.trim().length === 0) {
        return { message: 'Název mapy je povinný.' };
    }

    try {
        await mapsRepository.update(mapId, { title, description });

        revalidatePath('/settings/maps');
        revalidatePath('/', 'layout');
        return { message: 'success' };
    } catch (error) {
        console.error('Chyba při aktualizaci mapy:', error);
        return { message: 'Nepodařilo se aktualizovat mapu.' };
    }
}
