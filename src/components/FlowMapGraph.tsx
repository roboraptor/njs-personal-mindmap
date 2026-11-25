'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  type NodeProps,
  type OnNodeDrag,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Map, Node } from '@/db/schema';
import dagre from 'dagre';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force';

import { updateNodePositions } from '@/actions/nodeActions';
import { getNodeLinkColor } from '@/lib/nodeStyle';
import FloatingEdge from './FloatingEdge';

interface CustomNodeData extends Record<string, unknown> {
  node: Node;
  computedX: number;
  computedY: number;
  onClick: (node: Node) => void;
  onRightClick: (node: Node) => void;
  onAddChildClick?: (node: Node, position?: { x: number; y: number }) => void;
}

type MindMapFlowNode = FlowNode<CustomNodeData, 'custom'>;

interface D3SimNode extends SimulationNodeDatum {
  id: string;
  x: number;
  y: number;
  mass: number;
  width: number;
  height: number;
}

interface D3SimLink extends SimulationLinkDatum<D3SimNode> {
  source: string | D3SimNode;
  target: string | D3SimNode;
  distance: number;
}

const AddChildModeContext = createContext(false);

// Pomocná funkce, která najde IDčka všech potomků (s ochranou proti cyklům)
const getDescendants = (nodeId: string, edges: FlowEdge[], visited: Set<string> = new Set()): string[] => {
  if (visited.has(nodeId)) return [];
  visited.add(nodeId);

  const children = edges.filter((e) => e.source === nodeId).map((e) => e.target);
  return children.reduce((acc, childId) => {
    if (visited.has(childId)) return acc;
    return [...acc, childId, ...getDescendants(childId, edges, visited)];
  }, [] as string[]);
};

// Chytrý hook pro tahání uzlů s celou rodinou
const useDragWithChildren = (isDragToggledOn: boolean, mapId: string) => {
  const { getNodes, getEdges, setNodes } = useReactFlow<MindMapFlowNode, FlowEdge>();

  // Zapamatujeme si původní pozice předtím, než začneme myší tahat
  const dragStartPositions = useRef<Record<string, { x: number; y: number }> | null>(null);

  const onNodeDragStart: OnNodeDrag<MindMapFlowNode> = useCallback(
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

  const onNodeDrag: OnNodeDrag<MindMapFlowNode> = useCallback(
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

  const onNodeDragStop: OnNodeDrag<MindMapFlowNode> = useCallback(
    (_event, node) => {
      if (isDragToggledOn && dragStartPositions.current) {
        const nodes = getNodes();
        const updates = Object.keys(dragStartPositions.current)
          .map((id) => nodes.find((n) => n.id === id))
          .filter((n): n is MindMapFlowNode => Boolean(n))
          .map((finalNode) => ({
            id: finalNode.id,
            flow_x: finalNode.position.x,
            flow_y: finalNode.position.y,
          }));
        updateNodePositions(mapId, updates);
      } else {
        updateNodePositions(mapId, [
          { id: node.id, flow_x: node.position.x, flow_y: node.position.y },
        ]);
      }

      dragStartPositions.current = null;
    },
    [isDragToggledOn, getNodes, mapId]
  );

  return { onNodeDragStart, onNodeDrag, onNodeDragStop };
};

// --- CUSTOM UZEL PRO REACT FLOW ---
const CustomNode = ({ data }: NodeProps<MindMapFlowNode>) => {
  const addChildMode = useContext(AddChildModeContext);
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
        {addChildMode && (
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
          <span className="fw-bold fs-6" style={{ paddingRight: 8 }}>{data.node.title}</span>
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
  mapId: string;
  onNodeClick: (node: Node) => void;
  onNodeRightClick: (node: Node) => void;
  onAddChildClick?: (node: Node, position?: { x: number; y: number }) => void;
}

export default function FlowMapGraph(props: FlowMapGraphProps) {
  return (
    <ReactFlowProvider>
      <InnerFlowMapGraph {...props} />
    </ReactFlowProvider>
  );
}

function InnerFlowMapGraph({ data, mapConfig, mapId, onNodeClick, onNodeRightClick, onAddChildClick }: FlowMapGraphProps) {
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ floating: FloatingEdge }), []);

  const getLayoutedElements = useCallback(
    (
      nodes: Node[],
      links: { source: string; target: string }[],
      flowStateNodes: MindMapFlowNode[] = [],
      forceRecalculate: boolean = false
    ) => {
      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));
      dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 50 });

      const flowNodes: MindMapFlowNode[] = [];
      const flowEdges: FlowEdge[] = [];

      // Naplníme hrany
      links.forEach((link, index) => {
        const edgeId = `e-${link.source}-${link.target}-${index}`;
        const targetNode = nodes.find(n => n.id === link.target);
        const linkColor = getNodeLinkColor(targetNode?.style_json, '#6c757d');

        flowEdges.push({
          id: edgeId,
          source: link.source,
          target: link.target,
          type: 'floating',
          animated: true,
          style: { stroke: linkColor, strokeWidth: 2 },
        });
        dagreGraph.setEdge(link.source, link.target);
      });

      // Naplníme uzly
      nodes.forEach((node) => {
        const existingStateNode = flowStateNodes.find(n => n.id === node.id);

        let width = 150;
        let height = 50;

        if (existingStateNode?.measured?.width && existingStateNode?.measured?.height) {
          width = existingStateNode.measured.width;
          height = existingStateNode.measured.height;
        } else {
          const estimatedTitleWidth = (node.title?.length || 0) * 8 + 40;
          width = Math.max(150, estimatedTitleWidth);

          if (node.display_type === 'collapsible' && !node.is_collapsed) {
            const lines = (node.content?.length || 0) / 40;
            height = 60 + (Math.ceil(lines) * 20);
          }
        }

        dagreGraph.setNode(node.id, { width, height });
      });

      dagre.layout(dagreGraph);

      // Přiřadíme vypočtené pozice, pokud nemá Flow uzel už přiřazené vlastní souřadnice
      nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

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
          dragHandle: '.custom-drag-handle',
          data: {
            node,
            computedX: finalX,
            computedY: finalY,
            onClick: onNodeClick,
            onRightClick: onNodeRightClick,
            onAddChildClick,
          },
        });
      });

      return { flowNodes, flowEdges };
    },
    [onNodeClick, onNodeRightClick, onAddChildClick]
  );

  const { flowNodes: initialNodes, flowEdges: initialEdges } = useMemo(
    () => getLayoutedElements(data.nodes, data.links, []),
    [data, getLayoutedElements]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<MindMapFlowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>(initialEdges);
  const [dragChildren, setDragChildren] = useState(false);
  const [addChildMode, setAddChildMode] = useState(false);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const { onNodeDragStart, onNodeDrag, onNodeDragStop } = useDragWithChildren(dragChildren, mapId);

  // Handler pro tlačítko "Přeskládat strom"
  const handleRetopology = useCallback(() => {
    const { flowNodes, flowEdges } = getLayoutedElements(data.nodes, data.links, nodes, true);
    setNodes(flowNodes);
    setEdges(flowEdges);

    updateNodePositions(
      mapId,
      flowNodes.map(node => ({
        id: node.id,
        flow_x: node.position.x,
        flow_y: node.position.y,
      }))
    );
  }, [data, mapId, nodes, getLayoutedElements, setNodes, setEdges]);

  // Handler pro tlačítko "Přeskládat vesmír (D3)"
  const handleForceRetopology = useCallback(() => {
    const d3Nodes: D3SimNode[] = nodes.map(n => ({
      id: n.id,
      x: n.position.x,
      y: n.position.y,
      mass: n.data.node.force_mass ?? 1.0,
      width: n.measured?.width ?? 150,
      height: n.measured?.height ?? 50,
    }));

    const d3Links: D3SimLink[] = data.links.map(l => ({
      source: l.source,
      target: l.target,
      distance: data.nodes.find(dn => dn.id === l.target)?.force_distance ?? 150,
    }));

    const simulation = forceSimulation<D3SimNode>(d3Nodes)
      .force('charge', forceManyBody<D3SimNode>().strength(d => (mapConfig.repulsion_force ?? 100) * -1 * d.mass))
      .force('center', forceCenter(0, 0).strength(mapConfig.gravity_strength ?? 0.05))
      .force('link', forceLink<D3SimNode, D3SimLink>(d3Links).id(d => d.id).distance(d => d.distance))
      .force('collide', forceCollide<D3SimNode>().radius(d => Math.max(d.width, d.height) / 2 + 20).iterations(2))
      .stop();

    for (let i = 0; i < 300; i++) {
      simulation.tick();
    }

    const newNodes = nodes.map(n => {
      const d3n = d3Nodes.find(d => d.id === n.id);
      if (d3n && d3n.x !== undefined && d3n.y !== undefined) {
        return { ...n, position: { x: d3n.x, y: d3n.y } };
      }
      return n;
    });

    setNodes(newNodes);

    updateNodePositions(
      mapId,
      newNodes.map(node => ({
        id: node.id,
        flow_x: node.position.x,
        flow_y: node.position.y,
      }))
    );
  }, [nodes, data, mapConfig, mapId, setNodes]);

  return (
    <AddChildModeContext.Provider value={addChildMode}>
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
              title={dragChildren ? 'Přesouvání větve ZAPNUTO' : 'Přesouvání větve VYPNUTO'}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', borderBottom: '1px solid #ccc' }}
            >
              🔗
            </button>
            <button
              className={`react-flow__controls-button ${addChildMode ? 'text-success bg-light' : 'text-muted'}`}
              onClick={() => setAddChildMode(!addChildMode)}
              title={addChildMode ? 'Přidávání potomků ZAPNUTO' : 'Přidávání potomků VYPNUTO'}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', borderBottom: '1px solid #ccc' }}
            >
              ➕
            </button>
          </Controls>
          <MiniMap nodeColor="#495057" maskColor="rgba(0, 0, 0, 0.7)" />
          <Background color="#495057" gap={16} />

          {/* Panel s tlačítky pro překreslení stromu a switchem */}
          <Panel position="top-right" className="mt-2 me-2 d-flex flex-column gap-2">
            <button className="btn btn-sm btn-info shadow" onClick={handleRetopology}>
              🌳 ReTopology (Tree)
            </button>
            <button className="btn btn-sm btn-warning shadow" onClick={handleForceRetopology}>
              🌌 Do you feel fancy?
            </button>
          </Panel>
        </ReactFlow>
      </div>
    </AddChildModeContext.Provider>
  );
}
