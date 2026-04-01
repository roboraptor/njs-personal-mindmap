'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';
import type { Map, Node } from '@/db/schema';

// Rozšíření typu uzlu pro potřeby grafu
interface GraphNode extends Node, NodeObject {}

interface MindMapGraphProps {
  data: {
    nodes: GraphNode[];
    links: { source: string; target: string | any }[];
  };
  mapConfig: Pick<Map, 'gravity_strength' | 'repulsion_force' | 'friction'>;
  onNodeClick: (node: Node) => void;
  onNodeRightClick: (node: Node) => void;
}

const MindMapGraph: React.FC<MindMapGraphProps> = ({ data, mapConfig, onNodeClick, onNodeRightClick }) => {
  const fgRef = useRef<ForceGraphMethods>();
  const isInitialCenterDone = useRef(false);

  useEffect(() => {
    const fg = fgRef.current;
    if (fg) {
      // Nastavení fyziky grafu s přihlédnutím k váze uzlu (mass)
      fg.d3Force('charge')?.strength((node: any) => {
        return (mapConfig.repulsion_force ?? 100) * -1 * (node.force_mass ?? 1.0);
      });
      fg.d3Force('center')?.strength(mapConfig.gravity_strength ?? 0.05);

      // Aplikace vzdálenosti (distance) definované v cílovém uzlu
      fg.d3Force('link')?.distance((link: any) => {
        return link.target?.force_distance ?? 150;
      });

      fg.d3ReheatSimulation();
    }
  }, [mapConfig, data]);

  // Vlastní vykreslení uzlu
  const nodeCanvasObject = useCallback((node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const graphNode = node as GraphNode;
    const label = graphNode.title;
    
    // --- Constants ---
    const fontSize = 12 / globalScale;
    const padding = fontSize * 0.5;
    const buttonColor = '#343a40';
    const strokeColor = '#495057';
    const textColor = '#f8f9fa';

    // --- Dimension Calculations ---
    ctx.font = `600 ${fontSize}px Sans-Serif`; // Bold font for title
    const titleWidth = ctx.measureText(label).width;
    const arrowSpace = graphNode.display_type === 'collapsible' ? fontSize * 1.5 : 0;
    
    let contentHeight = 0;
    let contentLines: string[] = [];
    // Max width for content is based on title area
    const maxContentWidth = titleWidth + padding * 2; 

    if (graphNode.display_type === 'collapsible' && !graphNode.is_collapsed && graphNode.content) {
        ctx.font = `${fontSize * 0.8}px Sans-Serif`; // Smaller font for content
        const words = graphNode.content.split(' ');
        let line = '';
        // Basic line wrapping
        for (const word of words) {
            const testLine = line + word + ' ';
            if (ctx.measureText(testLine).width > maxContentWidth && line.length > 0) {
                contentLines.push(line.trim());
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        contentLines.push(line.trim());
        contentHeight = contentLines.length * (fontSize * 0.9);
    }
    
    const nodeWidth = maxContentWidth + arrowSpace;
    const nodeHeight = fontSize + padding * 2 + contentHeight;

    // --- ULOŽENÍ DIMENZÍ PRO HITBOX A KLIKÁNÍ ---
    (graphNode as any).__bckgDimensions = { width: nodeWidth, height: nodeHeight, arrowSpace };

    // --- Kreslení Pozadí ---
    ctx.fillStyle = buttonColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1 / globalScale;
    ctx.beginPath();
    ctx.roundRect(graphNode.x! - nodeWidth / 2, graphNode.y! - nodeHeight / 2, nodeWidth, nodeHeight, 5 / globalScale);
    ctx.fill();
    ctx.stroke();

    // --- Drawing Text ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    
    // Title (shifted left to make space for the arrow)
    ctx.font = `600 ${fontSize}px Sans-Serif`;
    const titleX = graphNode.x! - arrowSpace / 2;
    const titleY = graphNode.y! - (contentHeight / 2);
    ctx.fillText(label, titleX, titleY);

    // Content (if expanded)
    if (contentLines.length > 0) {
        ctx.font = `${fontSize * 0.8}px Sans-Serif`;
        let currentY = titleY + padding + (fontSize * 0.4);
        for (const line of contentLines) {
            ctx.fillText(line, titleX, currentY);
            currentY += fontSize * 0.9;
        }
    }

    // --- Drawing Arrow ---
    if (graphNode.display_type === 'collapsible') {
        // Position arrow in its own space on the right
        const arrowX = graphNode.x! + nodeWidth / 2 - (arrowSpace / 2);
        const arrowY = titleY;
        
        ctx.beginPath();
        if (graphNode.is_collapsed) { // Down arrow
            ctx.moveTo(arrowX - fontSize * 0.3, arrowY - fontSize * 0.15);
            ctx.lineTo(arrowX + fontSize * 0.3, arrowY - fontSize * 0.15);
            ctx.lineTo(arrowX, arrowY + fontSize * 0.3);
        } else { // Up arrow
            ctx.moveTo(arrowX - fontSize * 0.3, arrowY + fontSize * 0.15);
            ctx.lineTo(arrowX + fontSize * 0.3, arrowY + fontSize * 0.15);
            ctx.lineTo(arrowX, arrowY - fontSize * 0.3);
        }
        ctx.closePath();
        ctx.fill();
    }
  }, []);

  // --- Vykreslení HITBOXU na neviditelném plátně (pro Hover a tahání) ---
  const nodePointerAreaPaint = useCallback((node: NodeObject, color: string, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const graphNode = node as any;
    if (graphNode.__bckgDimensions) {
        const bckg = graphNode.__bckgDimensions;
        ctx.fillStyle = color;
        ctx.beginPath();
        // Pokud prohlížeč podporuje roundRect, uděláme oblý roh
        if (ctx.roundRect) {
            ctx.roundRect(graphNode.x! - bckg.width / 2, graphNode.y! - bckg.height / 2, bckg.width, bckg.height, 5 / globalScale);
        } else {
            ctx.rect(graphNode.x! - bckg.width / 2, graphNode.y! - bckg.height / 2, bckg.width, bckg.height);
        }
        ctx.fill();
    }
  }, []);

  // Funkce pro ovládací panel
  const handleZoomIn = () => fgRef.current?.zoom((fgRef.current.zoom() || 1) * 1.5, 400);
  const handleZoomOut = () => fgRef.current?.zoom((fgRef.current.zoom() || 1) / 1.5, 400);
  const handleFitAll = () => fgRef.current?.zoomToFit(400, 100);
  const handleCenterRoot = () => {
    // Najdeme kořenový uzel (ten co nemá parent_id)
    const rootNode = data.nodes.find(n => !n.parent_id);
    if (rootNode && fgRef.current) {
        fgRef.current.centerAt(rootNode.x, rootNode.y, 800);
        fgRef.current.zoom(1.5, 800);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 56px)' }}>
      {/* Plovoucí ovládací panel */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 1000 }}>
        <button onClick={handleZoomIn} className="btn btn-dark border-secondary shadow" title="Přiblížit">+</button>
        <button onClick={handleZoomOut} className="btn btn-dark border-secondary shadow" title="Oddálit">-</button>
        <button onClick={handleFitAll} className="btn btn-dark border-secondary shadow" title="Zobrazit vše">⛶</button>
        <button onClick={handleCenterRoot} className="btn btn-dark border-secondary shadow" title="Vycentrovat na kořen">🎯</button>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeLabel=""
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={nodePointerAreaPaint}
        linkColor={(link: any) => {
          // Pokud má potomek ve style_json definovanou barvu `linkColor`, použijeme ji.
          if (link.target?.style_json) {
              try {
                  const styles = JSON.parse(link.target.style_json);
                  if (styles.linkColor) return styles.linkColor;
              } catch (e) { /* ignore parse error */ }
          }
          return 'rgba(255, 255, 255, 0.4)';
        }}
        linkWidth={1.5}
        linkDirectionalArrowLength={2} // Menší šipky u vazeb
        linkDirectionalArrowRelPos={1}
        cooldownTicks={100}
        onEngineStop={() => {
          // Zabráníme neustálému centrování, vycentrujeme jen po prvním renderu
          if (!isInitialCenterDone.current && data.nodes.length > 0) {
              fgRef.current?.zoomToFit(400, 100);
              isInitialCenterDone.current = true;
          }
        }}
        d3VelocityDecay={1 - (mapConfig.friction ?? 0.9)}
        onNodeClick={(node, event) => {
          const graphNode = node as any;

          // Pokud má node rozbalovací šipku a máme spočítané rozměry
          if (graphNode.display_type === 'collapsible' && graphNode.__bckgDimensions && fgRef.current) {
             let x = (event as any).offsetX;
             let y = (event as any).offsetY;
             // Zajištění kompatibility v některých událostech
             if (x === undefined && event.target) {
                 const rect = (event.target as HTMLElement).getBoundingClientRect();
                 x = (event as any).clientX - rect.left;
                 y = (event as any).clientY - rect.top;
             }
             
             if (x !== undefined && y !== undefined) {
                 const coords = fgRef.current.screen2GraphCoords(x, y);
                 const bckg = graphNode.__bckgDimensions;
                 // Začátek oblasti se šipkou na pravé straně uzlu
                 const arrowStartX = graphNode.x! + bckg.width / 2 - bckg.arrowSpace;
                 
                 // Pokud uživatel kliknul vysloveně do pravého kraje (oblast šipky)
                 if (coords.x >= arrowStartX) {
                     onNodeRightClick(graphNode); // Voláme metodu pro sbalení/rozbalení
                     return;
                 }
             }
          }
          
          // Jinak standardně otevřeme editaci (jako dřív)
          onNodeClick(node as GraphNode);
        }}
        onNodeRightClick={(node, event) => {
          event.preventDefault();
          onNodeRightClick(node as GraphNode);
        }}
      />
    </div>
  );
};

export default MindMapGraph;