import { db } from '../src/db';
import { maps, nodes } from '../src/db/schema';
import crypto from 'crypto';

async function run() {
  console.log('Seeding larger map data...');
  const mapId = crypto.randomUUID();

  // 1. Založíme mapu
  await db.insert(maps).values({
    id: mapId,
    title: 'Velká rozsáhlá mapa',
    description: 'Ukázka mapy pro test rozestupů a barviček.',
    gravity_strength: 0.05,
    repulsion_force: 250, // Lehce vyšší odpor, aby měly větší větve místo
    friction: 0.9,
  });

  // 2. Centrální uzel
  const rootId = crypto.randomUUID();
  await db.insert(nodes).values({
    id: rootId,
    map_id: mapId,
    title: 'Centrum',
    mass: 3.0, // Nejtěžší bod uprostřed
    display_type: 'button',
  });

  // 3. Pár hlavních kategorií s různými styly a barvami
  const categories = [
    { title: 'Backend', color: 'rgba(255, 99, 132, 0.8)' },
    { title: 'Frontend', color: 'rgba(54, 162, 235, 0.8)' },
    { title: 'DevOps', color: 'rgba(255, 206, 86, 0.8)' },
  ];

  for (const cat of categories) {
    const catId = crypto.randomUUID();
    await db.insert(nodes).values({
      id: catId,
      map_id: mapId,
      parent_id: rootId,
      title: cat.title,
      distance: 200, 
      mass: 1.5,
      style_json: JSON.stringify({ linkColor: cat.color }), // Barva pro tuto vazbu
      display_type: 'button',
    });

    // Ke každé kategorii přidáme 5 pod-uzlů
    for (let i = 1; i <= 5; i++) {
        const subId = crypto.randomUUID();
        await db.insert(nodes).values({
            id: subId,
            map_id: mapId,
            parent_id: catId,
            title: `${cat.title} - Technologie ${i}`,
            distance: 80 + (i * 20), // Postupně se prodlužující uzly
            mass: 0.8,
            style_json: JSON.stringify({ linkColor: cat.color }), // Dědí barvu od rodiče
            display_type: 'button',
        });

        // A pro první 2 ještě pod-pod-uzly (collapsible s textem)
        if (i <= 2) {
            for (let j = 1; j <= 3; j++) {
                await db.insert(nodes).values({
                    id: crypto.randomUUID(),
                    map_id: mapId,
                    parent_id: subId,
                    title: `Detail ${j}`,
                    content: 'Nějaký delší popisek k této konkrétní technologii, abychom otestovali Collapsible uzel.',
                    distance: 100,
                    mass: 0.5,
                    display_type: 'collapsible',
                    is_collapsed: true,
                    style_json: JSON.stringify({ linkColor: 'rgba(200, 200, 200, 0.4)' }),
                });
            }
        }
    }
  }

  console.log(`Hotovo! Mapa vložena s ID: ${mapId}`);
}

run().catch(console.error);