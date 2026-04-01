import { Position, type InternalNode } from '@xyflow/react';

// Vrací parametry pro vykreslení hrany
export function getEdgeParams(source: InternalNode, target: InternalNode) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}

// Spočítá průsečík hranice obdélníku se spojnicí středů dvou uzlů
function getNodeIntersection(intersectionNode: InternalNode, targetNode: InternalNode) {
  const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
  const targetPosition = targetNode.internals.positionAbsolute;

  const intersectionNodeWidth = intersectionNode.measured?.width ?? intersectionNode.width ?? 0;
  const intersectionNodeHeight = intersectionNode.measured?.height ?? intersectionNode.height ?? 0;
  const targetNodeWidth = targetNode.measured?.width ?? targetNode.width ?? 0;
  const targetNodeHeight = targetNode.measured?.height ?? targetNode.height ?? 0;

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + targetNodeWidth / 2;
  const y1 = targetPosition.y + targetNodeHeight / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  
  const x = w * (xx3 + yy3) + x2;
  const y = h * (yy3 - xx3) + y2;

  return { x, y };
}

// Vrací logickou pozici úchytu (Top/Right/Bottom/Left)
function getEdgePosition(node: InternalNode, intersectionPoint: { x: number; y: number }) {
  const position = node.internals.positionAbsolute;
  const width = node.measured?.width ?? node.width ?? 0;
  const height = node.measured?.height ?? node.height ?? 0;

  const nx = Math.round(position.x);
  const ny = Math.round(position.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= ny + height - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}