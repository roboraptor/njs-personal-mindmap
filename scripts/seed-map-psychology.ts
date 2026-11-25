import { db } from '../src/db';
import { maps, nodes } from '../src/db/schema';
import crypto from 'crypto';

// --- TYPY PRO NAŠI STRUKTURU ---
interface SeedNode {
  title: string;
  content?: string;
  display_type?: 'button' | 'collapsible' | 'image';
  color?: string; // Bude uloženo do style_json { linkColor: ... }
  force_distance?: number;
  force_mass?: number;
  children?: SeedNode[];
}

// --- DATABÁZE A KONFIGURACE (NÁSTŘEL) ---
// Zde můžeš libovolně upravovat, mazat a přidávat data
const mapData = {
  title: 'Osobní Rozvoj a Psychologie',
  description: 'Mapa mého vývoje, myšlenek, manter a životních milníků.',
  rootTitle: 'Já',
  rootColor: 'rgba(255, 255, 255, 0.9)',
  
  // Hlavní větve a jejich podvětvě
  branches: [
    {
      title: 'Psychoanalýza a Stíny',
      color: 'rgba(153, 102, 255, 0.8)', // Fialová
      force_distance: 250,
      children: [
        {
          title: 'Archetypy (Jung)',
          children: [
            { title: 'Animus / Anima', content: 'Vnitřní obraz opačného pohlaví...', display_type: 'collapsible' },
            { title: 'Stín', content: 'Potlačené a odmítané stránky osobnosti.', display_type: 'collapsible' }
          ]
        },
        {
          title: 'Terapie a vhledy',
          children: [
            { title: 'Spouštěče', content: 'Co mě vyvádí z míry a proč?', display_type: 'collapsible' },
            { title: 'Vzorce chování', content: 'Opakující se situace v mém životě.', display_type: 'collapsible' }
          ]
        }
      ]
    },
    {
      title: 'Mantry a Principy',
      color: 'rgba(54, 162, 235, 0.8)', // Modrá
      force_distance: 200,
      children: [
        {
          title: 'Stoicismus',
          children: [
            { title: 'Amor Fati', content: 'Miluj osud. Nejen to přijmout, ale chtít, aby se to stalo.', display_type: 'collapsible' },
            { title: 'Dichotomie kontroly', content: 'Rozlišuj mezi tím, co můžeš ovlivnit a co ne.', display_type: 'collapsible' }
          ]
        },
        {
          title: 'Osobní mantry',
          children: [
            { title: 'Tady a teď', content: 'Zpřítomnění se. Dýchání.', display_type: 'collapsible' },
            { title: 'Méně je více', content: 'Zaměřit se na esenciální věci.', display_type: 'collapsible' }
          ]
        }
      ]
    },
    {
      title: 'Životní Milníky',
      color: 'rgba(255, 159, 64, 0.8)', // Oranžová
      force_distance: 300,
      children: [
        {
          title: 'Velké Události',
          children: [
            { title: 'Narození dětí / Svatba', display_type: 'collapsible' },
            { title: 'Změna kariéry', display_type: 'collapsible' }
          ]
        },
        {
          title: 'Překonané krize',
          children: [
            { title: 'Vyhoření', content: 'Lekce z doby, kdy jsem šel přes limit.', display_type: 'collapsible' }
          ]
        }
      ]
    },
    {
      title: 'Znalosti a Publikace',
      color: 'rgba(75, 192, 192, 0.8)', // Zelená
      force_distance: 200,
      children: [
        {
          title: 'Knihy',
          children: [
            { title: 'Moc přítomného okamžiku (E. Tolle)', display_type: 'collapsible' },
            { title: 'Atomové návyky (J. Clear)', content: 'Systém je důležitější než cíl.', display_type: 'collapsible' }
          ]
        },
        {
          title: 'Podcasty a zdroje',
          children: [
            { title: 'Huberman Lab', display_type: 'button' }
          ]
        }
      ]
    }
  ] as SeedNode[]
};

// --- LOGIKA PRO ULOŽENÍ ---

// Rekurzivní funkce pro ukládání uzlů
async function insertNodeRecursive(
  mapId: string, 
  parentId: string, 
  nodeData: SeedNode, 
  inheritedColor?: string,
  depth: number = 1
) {
  const nodeId = crypto.randomUUID();
  const color = nodeData.color || inheritedColor;
  
  // Čím hlouběji jsme, tím menší vzdálenost a váha uzlu (aby byl menší)
  const defaultDistance = depth === 1 ? 150 : 80;
  const defaultMass = depth === 1 ? 1.5 : (depth === 2 ? 0.8 : 0.5);

  await db.insert(nodes).values({
    id: nodeId,
    map_id: mapId,
    parent_id: parentId,
    title: nodeData.title,
    content: nodeData.content || null,
    display_type: nodeData.display_type || 'button',
    is_collapsed: nodeData.display_type === 'collapsible',
    force_distance: nodeData.force_distance || defaultDistance,
    force_mass: nodeData.force_mass || defaultMass,
    style_json: color ? JSON.stringify({ linkColor: color }) : null,
  });

  if (nodeData.children && nodeData.children.length > 0) {
    for (const child of nodeData.children) {
      await insertNodeRecursive(mapId, nodeId, child, color, depth + 1);
    }
  }
}

async function run() {
  console.log('Spouštím seed mapy pro Osobní rozvoj...');
  const mapId = crypto.randomUUID();

  // 1. Založíme mapu
  await db.insert(maps).values({
    id: mapId,
    title: mapData.title,
    description: mapData.description,
    gravity_strength: 0.05,
    repulsion_force: 300, // Více prostoru, aby se větve neslepily
    friction: 0.9,
  });

  // 2. Centrální uzel
  const rootId = crypto.randomUUID();
  await db.insert(nodes).values({
    id: rootId,
    map_id: mapId,
    title: mapData.rootTitle,
    force_mass: 4.0, // Nejtěžší bod uprostřed
    display_type: 'button',
    flow_x: 0,
    flow_y: 0,
    style_json: JSON.stringify({ linkColor: mapData.rootColor })
  });

  // 3. Spustíme rekurzivní vytvoření všech větví
  for (const branch of mapData.branches) {
    await insertNodeRecursive(mapId, rootId, branch, branch.color, 1);
  }

  console.log(`Hotovo! Osobní mapa vložena s ID: ${mapId}`);
}

run().catch(console.error);