import type { FlowEdge, FlowNode } from '@/types';

/**
 * Nodes with no incoming edges are traffic entry points.
 */
export function getEntryNodeIds(nodes: FlowNode[], edges: FlowEdge[]): string[] {
  const hasIncoming = new Set<string>();
  for (const e of edges) {
    hasIncoming.add(e.target);
  }
  return nodes.filter((n) => !hasIncoming.has(n.id)).map((n) => n.id);
}

export function buildOutgoingEdges(edges: FlowEdge[]): Map<string, FlowEdge[]> {
  const m = new Map<string, FlowEdge[]>();
  for (const e of edges) {
    const list = m.get(e.source) ?? [];
    list.push(e);
    m.set(e.source, list);
  }
  for (const [, list] of m) {
    list.sort((a, b) => a.id.localeCompare(b.id));
  }
  return m;
}
