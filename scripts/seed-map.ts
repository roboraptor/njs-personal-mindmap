import { db } from '../src/db';
import { maps, nodes } from '../src/db/schema';
import crypto from 'crypto';

async function run() {
  console.log('Seeding larger map data...');
  const mapId = crypto.randomUUID();

  // 1. Založíme mapu
  await db.insert(maps).values({
    id: mapId,
    title: 'My Personal Map',
    description: 'Vzor mapy pro ukázku rozestupů a barviček.',
    gravity_strength: 0.05,
    repulsion_force: 250, // Lehce vyšší odpor, aby měly větší větve místo
    friction: 0.9,
  });

  // 2. Centrální uzel
  const rootId = crypto.randomUUID();
  await db.insert(nodes).values({
    id: rootId,
    map_id: mapId,
    title: 'Já',
    force_mass: 3.0, // Nejtěžší bod uprostřed
    display_type: 'button',
    flow_x: 0,
    flow_y: 0,
  });

  // 3. Pár hlavních kategorií s různými styly a barvami
  const categories = [
    { title: 'Osobní rozvoj', color: 'rgba(255, 99, 132, 0.8)' },
    { title: 'Mantry', color: 'rgba(54, 162, 235, 0.8)' },
    { title: 'Plány', color: 'rgba(255, 206, 86, 0.8)' },
  ];

  let catX = 100;

  for (const cat of categories) {
    const catId = crypto.randomUUID();
    await db.insert(nodes).values({
      id: catId,
      map_id: mapId,
      parent_id: rootId,
      title: cat.title,
      force_distance: 200, 
      force_mass: 1.5,
      style_json: JSON.stringify({ linkColor: cat.color }), // Barva pro tuto vazbu
      display_type: 'button',
      flow_x: catX,
      flow_y: 300,
    });
    catX += 300;

    // Ke každé kategorii přidáme 5 pod-uzlů
    for (let i = 1; i <= 5; i++) {
        const subId = crypto.randomUUID();
        await db.insert(nodes).values({
            id: subId,
            map_id: mapId,
            parent_id: catId,
            title: `${cat.title} - Technologie ${i}`,
            force_distance: 80 + (i * 20), // Postupně se prodlužující uzly
            force_mass: 0.8,
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
                    force_distance: 100,
                    force_mass: 0.5,
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