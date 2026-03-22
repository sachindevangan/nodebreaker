import type { FlowEdge, FlowNode, NodeBreakerNodeData, NodeBreakerNodeType } from '@/types';

export const NODEBREAKER_DESIGN_VERSION = '1.0';

const VALID_NODE_TYPES: ReadonlySet<string> = new Set<NodeBreakerNodeType>([
  'loadBalancer',
  'service',
  'database',
  'cache',
  'queue',
  'cdn',
]);

export interface SerializedNode {
  id: string;
  type: NodeBreakerNodeType;
  position: { x: number; y: number };
  data: NodeBreakerNodeData;
}

export interface SerializedEdge {
  id?: string;
  source: string;
  target: string;
}

export interface NodeBreakerDesignFile {
  version: string;
  name: string;
  exportedAt: string;
  nodeCount: number;
  nodes: SerializedNode[];
  edges: SerializedEdge[];
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isNodeBreakerNodeType(t: unknown): t is NodeBreakerNodeType {
  return typeof t === 'string' && VALID_NODE_TYPES.has(t);
}

export function validateDesignFile(raw: unknown): NodeBreakerDesignFile | null {
  if (!isRecord(raw)) return null;
  if (raw.version !== NODEBREAKER_DESIGN_VERSION) return null;
  if (typeof raw.name !== 'string') return null;
  if (typeof raw.exportedAt !== 'string') return null;
  if (!Array.isArray(raw.nodes) || !Array.isArray(raw.edges)) return null;

  const nodes: SerializedNode[] = [];
  for (const n of raw.nodes) {
    if (!isRecord(n)) return null;
    if (typeof n.id !== 'string') return null;
    if (!isNodeBreakerNodeType(n.type)) return null;
    if (!isRecord(n.position) || typeof n.position.x !== 'number' || typeof n.position.y !== 'number')
      return null;
    if (!isRecord(n.data) || typeof n.data.label !== 'string') return null;
    const data = n.data as unknown as NodeBreakerNodeData;
    if (typeof data.throughput !== 'number' || typeof data.latency !== 'number') return null;
    if (typeof data.capacity !== 'number') return null;
    nodes.push({
      id: n.id,
      type: n.type,
      position: { x: n.position.x, y: n.position.y },
      data,
    });
  }

  const edges: SerializedEdge[] = [];
  for (const e of raw.edges) {
    if (!isRecord(e)) return null;
    if (typeof e.source !== 'string' || typeof e.target !== 'string') return null;
    edges.push({
      id: typeof e.id === 'string' ? e.id : undefined,
      source: e.source,
      target: e.target,
    });
  }

  return {
    version: String(raw.version),
    name: raw.name,
    exportedAt: raw.exportedAt,
    nodeCount: nodes.length,
    nodes,
    edges,
  };
}

export function serializeDesign(
  name: string,
  nodes: FlowNode[],
  edges: FlowEdge[]
): NodeBreakerDesignFile {
  const exportedAt = new Date().toISOString();
  return {
    version: NODEBREAKER_DESIGN_VERSION,
    name,
    exportedAt,
    nodeCount: nodes.length,
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: { x: n.position.x, y: n.position.y },
      data: { ...n.data },
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
  };
}

export function designToFlowGraph(design: NodeBreakerDesignFile): {
  nodes: FlowNode[];
  edges: FlowEdge[];
} {
  const nodes: FlowNode[] = design.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: { ...n.position },
    selected: false,
    data: { ...n.data },
  }));
  const edges: FlowEdge[] = design.edges.map((e, i) => ({
    id: e.id ?? `e-import-${i}-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    type: 'animated' as const,
  }));
  return { nodes, edges };
}

export function slugifyFilename(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return s || 'design';
}

export function downloadDesignJson(design: NodeBreakerDesignFile): void {
  const slug = slugifyFilename(design.name);
  const blob = new Blob([JSON.stringify(design, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}-nodebreaker.json`;
  a.click();
  URL.revokeObjectURL(url);
}
