'use client';

import React, { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node as FlowNode,
  Edge as FlowEdge,
  Handle,
  Position,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  NodeDragHandler
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Map, Node } from '@/db/schema';
import dagre from 'dagre';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';

import { updateNodePosition } from '@/actions/nodeActions';
import FloatingEdge from './FloatingEdge';

// Pomocná funkce, která najde IDčka všech potomků (i těch hluboko zanořených)
const getDescendants = (nodeId: string, edges: FlowEdge[]): string[] => {
  const children = edges.filter((e) => e.source === nodeId).map((e) => e.target);
  return children.reduce((acc, childId) => {
    return [...acc, childId, ...getDescendants(childId, edges)];
  }, [] as string[]);
};

// Chytrý hook pro tahání uzlů s celou rodinou
const useDragWithChildren = (isDragToggledOn: boolean, mapId: string) => {
  const { getNodes, getEdges, setNodes } = useReactFlow();
  
  // Zapamatujeme si původní pozice předtím, než začneme myší tahat
  const dragStartPositions = useRef<Record<string, { x: number; y: number }> | null>(null);

  const onNodeDragStart: NodeDragHandler = useCallback(
    (_, node) => {
      if (!isDragToggledOn) return;

      const edges = getEdges();
      const nodes = getNodes();
      const descendantIds = getDescendants(node.id, edges);
      
      const startPositions: Record<string, { x: number; y: number }> = {};
      
      // Uložíme si původní pozici rodiče
      startPositions[node.id] = { ...node.position };
      
      // Uložíme si pozici každého nalezeného potomka
      descendantIds.forEach((id) => {
        const descendant = nodes.find((n) => n.id === id);
        if (descendant) {
          startPositions[id] = { ...descendant.position };
        }
      });
      
      dragStartPositions.current = startPositions;
    },
    [isDragToggledOn, getEdges, getNodes]
  );

  const onNodeDrag: NodeDragHandler = useCallback(
    (_, node) => {
      if (!isDragToggledOn || !dragStartPositions.current) return;
      
      const parentStartPos = dragStartPositions.current[node.id];
      if (!parentStartPos) return;

      // Spočítáme rozdíl, o kolik pixelů rodiče uživatel posunul
      const deltaX = node.position.x - parentStartPos.x;
      const deltaY = node.position.y - parentStartPos.y;

      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          // Rodiče necháme být, jeho pozici updatuje React Flow sám podle myši
          if (n.id === node.id) return n;

          // Pokud je to potomek uložený v paměti na začátku tahu
          const childStartPos = dragStartPositions.current![n.id];
          if (childStartPos) {
            return {
              ...n,
              position: {
                x: childStartPos.x + deltaX,
                y: childStartPos.y + deltaY,
              },
            };
          }
          return n;
        })
      );
    },
    [isDragToggledOn, setNodes]
  );

  const onNodeDragStop: NodeDragHandler = useCallback((event, node) => {
    // 1. Zjistíme, jestli se táhlo s celou rodinou a máme souřadnice
    if (isDragToggledOn && dragStartPositions.current) {
        const nodes = getNodes();
        // Všechny uzly, co jsme potáhli (děti + rodič), uložíme do Databáze
        Object.keys(dragStartPositions.current).forEach(id => {
            const finalNode = nodes.find(n => n.id === id);
            if (finalNode) {
                updateNodePosition(finalNode.id, mapId, finalNode.position.x, finalNode.position.y);
            }
        });
    } else {
        // Tahali jsme jen samotný jeden uzel
        updateNodePosition(node.id, mapId, node.position.x, node.position.y);
    }
    
    // Uklidíme paměť
    dragStartPositions.current = null;
  }, [isDragToggledOn, getNodes, mapId]);

  return { onNodeDragStart, onNodeDrag, onNodeDragStop };
};

// --- CUSTOM UZEL PRO REACT FLOW ---
const CustomNode = ({ data }: { data: any }) => {
  const isCollapsible = data.node.display_type === 'collapsible';
  const isCollapsed = data.node.is_collapsed;

  return (
    <div 
      className="card bg-dark text-light border-secondary shadow-sm"
      style={{ minWidth: '150px' }}
    >
      {/* Skryté handly pro floating edges */}
      <Handle type="target" position={Position.Top} className="bg-transparent border-0" style={{ pointerEvents: 'none' }} />
      
      <div className="card-body p-0 d-flex align-items-center">
        {/* DRAG HANDLE IKONA VLEVO */}
        <div 
          className="custom-drag-handle d-flex justify-content-center align-items-center me-1" 
          style={{ cursor: 'move', width: '20px', height: '36px', borderRight: '0px solid #495057' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', gap: '3px' }}>
               <div style={{ width: '4px', height: '4px', backgroundColor: '#6c757d', borderRadius: '50%' }}></div>
               <div style={{ width: '4px', height: '4px', backgroundColor: '#6c757d', borderRadius: '50%' }}></div>
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
               <div style={{ width: '4px', height: '4px', backgroundColor: '#6c757d', borderRadius: '50%' }}></div>
               <div style={{ width: '4px', height: '4px', backgroundColor: '#6c757d', borderRadius: '50%' }}></div>
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
               <div style={{ width: '4px', height: '4px', backgroundColor: '#6c757d', borderRadius: '50%' }}></div>
               <div style={{ width: '4px', height: '4px', backgroundColor: '#6c757d', borderRadius: '50%' }}></div>
            </div>
          </div>
        </div>

        {/* [+] TLAČÍTKO PRO PŘIDÁNÍ POTOMKA */}
        {data.addChildMode && (
          <button 
            className="btn btn-sm btn-success p-0 d-flex justify-content-center align-items-center me-2"
            style={{ width: '20px', height: '20px', borderRadius: '50%', fontSize: '14px', lineHeight: '1', zIndex: 10 }}
            onClick={(e) => {
              e.stopPropagation();
              data.onAddChildClick?.(data.node, { x: data.computedX, y: data.computedY });
            }}
            title="Přidat potomka"
          >
            +
          </button>
        )}

        {/* SAMOTNÝ TITULEK A AKCE PRO KLIKNUTÍ (MODÁL) */}
        <div 
          className="flex-grow-1 d-flex align-items-center"
          style={{ cursor: 'pointer' }}
          onClick={() => data.onClick(data.node)}
        >
            {isCollapsible && (
              <button 
                className="btn btn-sm btn-outline-secondary me-2 p-0 px-1"
                onClick={(e) => {
                  e.stopPropagation();
                  data.onRightClick(data.node);
                }}
              >
                {isCollapsed ? '▼' : '▲'}
              </button>
            )}
            <span className="fw-bold fs-6" style={{ paddingRight: 8 }} >{data.node.title}</span>
        </div>
      </div>
      {isCollapsible && !isCollapsed && data.node.content && (
        <div className="card-footer p-2 text-muted" style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
          {data.node.content}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="bg-transparent border-0" style={{ pointerEvents: 'none' }} />
    </div>
  );
};

interface FlowMapGraphProps {
  data: {
    nodes: Node[];
    links: { source: string; target: string }[];
  };
  mapConfig: Pick<Map, 'gravity_strength' | 'repulsion_force' | 'friction'>;
  onNodeClick: (node: Node) => void;
  onNodeRightClick: (node: Node) => void;
  onAddChildClick?: (node: Node, position?: { x: number, y: number }) => void;
}

export default function FlowMapGraph(props: FlowMapGraphProps) {
  return (
    <ReactFlowProvider>
      <InnerFlowMapGraph {...props} />
    </ReactFlowProvider>
  );
}

function InnerFlowMapGraph({ data, mapConfig, onNodeClick, onNodeRightClick, onAddChildClick }: FlowMapGraphProps) {
  // --- LAYOUTOVÁNÍ POMOCÍ DAGRE ---
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ floating: FloatingEdge }), []);

  const getLayoutedElements = useCallback((nodes: Node[], links: { source: string; target: string }[], flowStateNodes: FlowNode[] = [], forceRecalculate: boolean = false) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 50 });

    const flowNodes: FlowNode[] = [];
    const flowEdges: FlowEdge[] = [];

    // Naplníme hrany
    links.forEach((link, index) => {
      const edgeId = `e-${link.source}-${link.target}-${index}`;
      
      const targetNode = nodes.find(n => n.id === link.target);
      let linkColor = '#6c757d'; 
      if (targetNode?.style_json) {
        try {
          const styles = JSON.parse(targetNode.style_json);
          if (styles.linkColor) linkColor = styles.linkColor;
        } catch (e) {}
      }

      flowEdges.push({
        id: edgeId,
        source: link.source,
        target: link.target,
        type: 'floating', // Custom floating edge místo defaultu
        animated: true,
        style: { stroke: linkColor, strokeWidth: 2 },
      });
      dagreGraph.setEdge(link.source, link.target);
    });

    // Naplníme uzly
    nodes.forEach((node) => {
      // 1. Zkusíme zjistit reálnou velikost z React Flow state (pokud už byly vyrenderované)
      const existingStateNode = flowStateNodes.find(n => n.id === node.id);
      
      let width = 150;
      let height = 50;

      if (existingStateNode?.measured?.width && existingStateNode?.measured?.height) {
         // Použijeme skutečně změřenou velikost z DOM
         width = existingStateNode.measured.width;
         height = existingStateNode.measured.height;
      } else {
         // 2. Fallback: Hrubý odhad
         // Přibližně 8 pixelů na znak pro titulek
         const estimatedTitleWidth = (node.title?.length || 0) * 8 + 40; 
         width = Math.max(150, estimatedTitleWidth);
         
         if (node.display_type === 'collapsible' && !node.is_collapsed) {
             const lines = (node.content?.length || 0) / 40; // zhruba 40 znaků na řádek
             height = 60 + (Math.ceil(lines) * 20);
         }
      }

      dagreGraph.setNode(node.id, { width, height });
    });

    // Provedeme výpočet
    dagre.layout(dagreGraph);

    // Přiřadíme vypočtené pozice, pokud nemá Flow uzel už přiřazené vlastní souřadnice
    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      
      // Pokud nevynucujeme přepočet a máme pozici v databázi, použijeme ji. Jinak Dagre výpočet.
      const useStoredX = !forceRecalculate && node.flow_x !== null;
      const useStoredY = !forceRecalculate && node.flow_y !== null;

      const finalX = useStoredX ? node.flow_x! : nodeWithPosition.x - nodeWithPosition.width / 2;
      const finalY = useStoredY ? node.flow_y! : nodeWithPosition.y - nodeWithPosition.height / 2;

      flowNodes.push({
        id: node.id,
        type: 'custom',
        position: {
          x: finalX,
          y: finalY,
        },
        dragHandle: '.custom-drag-handle', // ⬅️ Handle pro přetahování pomocí teček
        data: { 
          node: node, 
          computedX: finalX,
          computedY: finalY,
          onClick: onNodeClick, 
          onRightClick: onNodeRightClick,
          onAddChildClick: onAddChildClick
        },
      });
    });

    return { flowNodes, flowEdges };
  }, [onNodeClick, onNodeRightClick, onAddChildClick]);

  const { flowNodes: initialNodes, flowEdges: initialEdges } = useMemo(
    () => getLayoutedElements(data.nodes, data.links, []),
    [data, getLayoutedElements]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [dragChildren, setDragChildren] = useState(false);
  const [addChildMode, setAddChildMode] = useState(false);

  // Ref pro přístup k aktuálnímu stavu uvnitř useEffectu, který aktualizuje uzly z databáze
  const addChildModeRef = useRef(addChildMode);
  useEffect(() => {
    addChildModeRef.current = addChildMode;
  }, [addChildMode]);

  const { onNodeDragStart, onNodeDrag, onNodeDragStop } = useDragWithChildren(dragChildren, data.nodes[0]?.map_id);

  // Aktualizace uzlů při změně dat v DB (přidání uzlu apod.)
  useEffect(() => {
    const { flowNodes, flowEdges } = getLayoutedElements(data.nodes, data.links, []);
    setNodes(flowNodes.map(n => ({
      ...n,
      data: { ...n.data, addChildMode: addChildModeRef.current } // Zde uchováme zapnutý režim
    })));
    setEdges(flowEdges);
  }, [data, getLayoutedElements, setNodes, setEdges]);

  // Synchronizace addChildMode s uzly při samotném přepnutí tlačítka
  useEffect(() => {
    setNodes((nds) => 
      nds.map((n) => ({ 
        ...n, 
        data: { ...n.data, addChildMode } 
      }))
    );
  }, [addChildMode, setNodes]);

  // Handler pro tlačítko "Přeskládat strom"
  const handleRetopology = useCallback(() => {
    // Zavoláme layout funkci a vynutíme, aby ignorovala DB souřadnice
    const { flowNodes, flowEdges } = getLayoutedElements(data.nodes, data.links, nodes, true);
    setNodes(flowNodes);
    setEdges(flowEdges);

    // Abychom zachovali tento nový layout, propíšeme nově spočítané souřadnice zpět do databáze
    flowNodes.forEach(node => {
        updateNodePosition(node.id, data.nodes[0]?.map_id, node.position.x, node.position.y);
    });
  }, [data, nodes, getLayoutedElements, setNodes, setEdges]);

  // Handler pro tlačítko "Přeskládat vesmír (D3)"
  const handleForceRetopology = useCallback(() => {
    // Připravíme uzly pro D3, zkusíme využít i jejich reálné rozměry pro forceCollide
    const d3Nodes = nodes.map(n => ({
      id: n.id,
      x: n.position.x,
      y: n.position.y,
      mass: n.data.node.force_mass ?? 1.0,
      width: n.measured?.width ?? 150,
      height: n.measured?.height ?? 50
    }));

    // Připravíme vazby
    const d3Links = data.links.map(l => ({
      source: l.source,
      target: l.target,
      distance: data.nodes.find(dn => dn.id === l.target)?.force_distance ?? 150
    }));

    // Vytvoříme a nastavíme simulaci podle fyzikálních hodnot z DB + Kolize s ohledem na velikost krabiček
    const simulation = forceSimulation(d3Nodes as any)
      .force('charge', forceManyBody().strength((d: any) => (mapConfig.repulsion_force ?? 100) * -1 * d.mass))
      .force('center', forceCenter(0, 0).strength(mapConfig.gravity_strength ?? 0.05))
      .force('link', forceLink(d3Links).id((d: any) => d.id).distance((d: any) => d.distance))
      .force('collide', forceCollide().radius((d: any) => Math.max(d.width, d.height) / 2 + 20).iterations(2))
      .stop();

    // Spočítáme finální pozice synchronně (uděláme 300 kroků simulace na pozadí)
    for (let i = 0; i < 300; i++) {
      simulation.tick();
    }

    // Aplikujeme nově vypočtené pozice na stávající flow nodes
    const newNodes = nodes.map(n => {
      const d3n = d3Nodes.find(d => d.id === n.id);
      if (d3n && d3n.x !== undefined && d3n.y !== undefined) {
        return { ...n, position: { x: d3n.x, y: d3n.y } };
      }
      return n;
    });

    setNodes(newNodes);

    // Zapíšeme nové pozice rovnou do DB
    newNodes.forEach(node => {
        updateNodePosition(node.id, data.nodes[0]?.map_id, node.position.x, node.position.y);
    });
  }, [nodes, data, mapConfig, setNodes]);

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 56px)' }} className="react-flow-dark">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        colorMode="dark"
        minZoom={0.1}
      >
        <Controls>
          <button 
              className={`react-flow__controls-button ${dragChildren ? 'text-primary bg-light' : 'text-muted'}`}
              onClick={() => setDragChildren(!dragChildren)}
              title={dragChildren ? "Přesouvání větve ZAPNUTO" : "Přesouvání větve VYPNUTO"}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', borderBottom: '1px solid #ccc' }}
            >
              🔗
          </button>
          <button 
              className={`react-flow__controls-button ${addChildMode ? 'text-success bg-light' : 'text-muted'}`}
              onClick={() => setAddChildMode(!addChildMode)}
              title={addChildMode ? "Přidávání potomků ZAPNUTO" : "Přidávání potomků VYPNUTO"}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', borderBottom: '1px solid #ccc' }}
            >
              ➕
          </button>
        </Controls>
        <MiniMap nodeColor="#495057" maskColor="rgba(0, 0, 0, 0.7)" />
        <Background color="#495057" gap={16} />
        
        {/* Panel s tlačítky pro překreslení stromu a switchem */}
        <Panel position="top-right" className="mt-3 me-3 d-flex flex-column gap-2">
            <button className="btn btn-sm btn-info shadow" onClick={handleRetopology}>
                🌳 Přeskládat (Strom)
            </button>
            <button className="btn btn-sm btn-warning shadow" onClick={handleForceRetopology}>
                🌌 Přeskládat (Vesmír)
            </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}