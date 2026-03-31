'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';
import type { Map, Node } from '@/db/schema';

// Rozšíření typu uzlu pro potřeby grafu
interface GraphNode extends Node, NodeObject {}

interface MindMapGraphProps {
  data: {
    nodes: GraphNode[];
    links: { source: string; target: string }[];
  };
  mapConfig: Pick<Map, 'gravity_strength' | 'repulsion_force' | 'friction'>;
}

const MindMapGraph: React.FC<MindMapGraphProps> = ({ data, mapConfig }) => {
  const fgRef = useRef<ForceGraphMethods>();

  useEffect(() => {
    const fg = fgRef.current;
    if (fg) {
      // Nastavení fyziky grafu podle konfigurace mapy
      fg.d3Force('charge')?.strength((mapConfig.repulsion_force ?? 100) * -1);
      fg.d3Force('center')?.strength(mapConfig.gravity_strength ?? 0.05);
      fg.d3ReheatSimulation();
    }
  }, [mapConfig, data]);

  // Vlastní vykreslení uzlu
  const nodeCanvasObject = useCallback((node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const graphNode = node as GraphNode;
    const label = graphNode.title;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4); // padding

    ctx.fillStyle = 'rgba(40, 40, 40, 0.95)'; // Tmavší pozadí pro uzel
    ctx.fillRect(graphNode.x! - bckgDimensions[0] / 2, graphNode.y! - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white'; // Světlejší písmo
    ctx.fillText(label, graphNode.x!, graphNode.y!);
  }, []);

  return (
    <ForceGraph2D
      ref={fgRef}
      graphData={data}
      nodeLabel="title"
      nodeCanvasObject={nodeCanvasObject}
      linkColor={() => 'rgba(255, 255, 255, 0.3)'} // Světlejší spojnice
      linkWidth={1}
      cooldownTicks={100}
      onEngineStop={() => fgRef.current?.zoomToFit(400, 100)}
      d3VelocityDecay={1 - (mapConfig.friction ?? 0.9)}
    />
  );
};

export default MindMapGraph;