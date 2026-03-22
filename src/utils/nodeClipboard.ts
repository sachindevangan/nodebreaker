import type { FlowNode, NodeBreakerNodeData } from '@/types';
import type { NodeBreakerNodeType } from '@/types';

export interface NodeClipboardBlueprint {
  type: NodeBreakerNodeType;
  data: NodeBreakerNodeData;
}

let clipboard: NodeClipboardBlueprint | null = null;

export function setClipboardFromNode(node: FlowNode): void {
  clipboard = { type: node.type, data: { ...node.data } };
}

export function getClipboardBlueprint(): NodeClipboardBlueprint | null {
  return clipboard;
}
