import type { FlowNode, NodeBreakerNodeData } from '@/types';
import type { NodeBreakerNodeType } from '@/types';

export interface NodeClipboardBlueprint {
  type: NodeBreakerNodeType;
  data: NodeBreakerNodeData;
  position?: { x: number; y: number };
}

let clipboard: NodeClipboardBlueprint | null = null;

export function setClipboardFromNode(node: FlowNode): void {
  clipboard = { type: node.type, data: { ...node.data }, position: { ...node.position } };
}

/** Copy for Ctrl+V paste: stores with position; label gets " (copy)" on paste. */
export function setClipboardForCopy(node: FlowNode): void {
  clipboard = {
    type: node.type,
    data: { ...node.data, label: `${node.data.label} (copy)` },
    position: { ...node.position },
  };
}

export function getClipboardBlueprint(): NodeClipboardBlueprint | null {
  return clipboard;
}
