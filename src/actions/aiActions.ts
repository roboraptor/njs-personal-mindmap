'use server';

import { mapsRepository } from '@/data/mapsRepository';
import { nodesRepository } from '@/data/nodesRepository';
import { crossLinksRepository } from '@/data/crossLinksRepository';
import { Node } from '@/db/schema';

export async function generateAIPrompt(mapId: string): Promise<string> {
  const map = await mapsRepository.getById(mapId);
  if (!map) {
    throw new Error('Map not found');
  }

  const nodes = await nodesRepository.getByMapId(mapId);
  const crossLinks = await crossLinksRepository.getByMapId(mapId);

  // 1. Příprava mapy uzlů pro rychlé vyhledávání
  const nodeMap = new globalThis.Map<string, Node>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // 2. Hierarchické uspořádání (najdeme kořeny)
  const roots = nodes.filter(n => !n.parent_id);
  const childrenMap = new globalThis.Map<string, Node[]>();
  
  nodes.forEach(n => {
    if (n.parent_id) {
      const children = childrenMap.get(n.parent_id) || [];
      children.push(n);
      childrenMap.set(n.parent_id, children);
    }
  });

  // 3. Rekurzivní funkce pro generování Markdown odrážek
  function buildTreeMarkdown(nodeId: string, depth: number = 0): string {
    const node = nodeMap.get(nodeId);
    if (!node) return '';

    const indent = '  '.repeat(depth);
    let md = `${indent}- **${node.title}** (ID: ${node.id})`;
    if (node.content) md += `: ${node.content}`;
    md += '\n';

    const children = childrenMap.get(nodeId) || [];
    // Můžeme seřadit podle sort_order, pokud existuje
    children.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    
    for (const child of children) {
      md += buildTreeMarkdown(child.id, depth + 1);
    }
    return md;
  }

  // 4. Sestavení výsledného textu
  let result = `Jsi expert na psychologii a analýzu osobnosti. Níže ti předkládám strukturu myšlenkové mapy konkrétního člověka. Kořenové uzly představují hlavní životní pilíře, poduzly jejich detaily. Křížové vazby ukazují asociace v jeho mysli. Analyzuj vzorce chování, případné obavy nebo silné stránky, které ze struktury vyplývají.\n\n`;
  result += `# Analýza myšlenkové mapy: ${map.title}\n`;
  if (map.description) result += `Popis: ${map.description}\n`;
  
  result += `\n## 🧠 Mentální modely a myšlenky (Struktura)\n`;
  for (const root of roots) {
    result += buildTreeMarkdown(root.id, 0);
  }

  // 5. Přidání křížových vazeb
  if (crossLinks.length > 0) {
    result += `\n## 🔗 Skryté souvislosti (Křížové vazby)\n`;
    for (const link of crossLinks) {
      const source = nodeMap.get(link.source_node_id);
      const target = nodeMap.get(link.target_node_id);
      if (source && target) {
        const labelText = link.label ? ` (Vztah: "${link.label}")` : '';
        result += `- [${source.title} (ID: ${source.id})] --> [${target.title} (ID: ${target.id})]${labelText}\n`;
      }
    }
  }

  return result;
}
