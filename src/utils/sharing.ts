import LZString from 'lz-string';
import { getComponentConfig } from '@/constants/components';
import { createDefaultNodeData } from '@/constants/defaults';
import type { FlowEdge, FlowNode, NodeBreakerNodeType } from '@/types';

export interface SharedDesignNode {
  t: NodeBreakerNodeType;
  x: number;
  y: number;
  l?: string;
  tp?: number;
  lt?: number;
  cp?: number;
}

export interface SharedDesign {
  v: 1;
  n: string;
  nodes: SharedDesignNode[];
  edges: [number, number][];
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function buildSharedDesign(name: string, nodes: FlowNode[], edges: FlowEdge[]): SharedDesign {
  const indexById = new Map<string, number>();
  const compactNodes: SharedDesignNode[] = nodes.map((node, idx) => {
    indexById.set(node.id, idx);
    const cfg = getComponentConfig(node.type);
    const defaultLabel = cfg?.label ?? node.data.label;
    const compact: SharedDesignNode = {
      t: node.type,
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    };
    if (node.data.label !== defaultLabel) compact.l = node.data.label;
    if (cfg && node.data.throughput !== cfg.defaultData.throughput) compact.tp = node.data.throughput;
    if (cfg && node.data.latency !== cfg.defaultData.latency) compact.lt = node.data.latency;
    if (cfg && node.data.capacity !== cfg.defaultData.capacity) compact.cp = node.data.capacity;
    return compact;
  });
  const compactEdges: [number, number][] = edges
    .map((edge) => {
      const s = indexById.get(edge.source);
      const t = indexById.get(edge.target);
      if (s === undefined || t === undefined) return null;
      return [s, t] as [number, number];
    })
    .filter((e): e is [number, number] => e !== null);

  return { v: 1, n: name, nodes: compactNodes, edges: compactEdges };
}

export function encodeDesignToShareUrl(name: string, nodes: FlowNode[], edges: FlowEdge[], baseUrl?: string): string {
  const payload = buildSharedDesign(name, nodes, edges);
  const json = JSON.stringify(payload);
  const compressed = LZString.compressToEncodedURIComponent(json);
  const base = baseUrl ?? `${window.location.origin}${window.location.pathname}`;
  return `${base}?d=${compressed}`;
}

export function isShareUrlTooLong(url: string): boolean {
  return url.length > 2000;
}

export function decodeSharedDesign(encoded: string): { name: string; nodes: FlowNode[]; edges: FlowEdge[] } | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const raw = JSON.parse(json) as unknown;
    if (!isRecord(raw) || raw.v !== 1 || typeof raw.n !== 'string') return null;
    const rawNodes = raw.nodes;
    const rawEdges = raw.edges;
    if (!Array.isArray(rawNodes) || !Array.isArray(rawEdges)) return null;

    const nodes: FlowNode[] = rawNodes.map((rn, idx) => {
      if (!isRecord(rn) || typeof rn.t !== 'string' || typeof rn.x !== 'number' || typeof rn.y !== 'number') {
        throw new Error('Invalid shared node');
      }
      const type = rn.t as NodeBreakerNodeType;
      const cfg = getComponentConfig(type);
      if (!cfg) throw new Error('Unknown node type');
      const label = typeof rn.l === 'string' && rn.l.length > 0 ? rn.l : cfg.label;
      const throughput = typeof rn.tp === 'number' ? rn.tp : cfg.defaultData.throughput;
      const latency = typeof rn.lt === 'number' ? rn.lt : cfg.defaultData.latency;
      const capacity = typeof rn.cp === 'number' ? rn.cp : cfg.defaultData.capacity;
      return {
        id: `shared-${idx}-${crypto.randomUUID()}`,
        type,
        position: { x: Math.round(rn.x), y: Math.round(rn.y) },
        selected: false,
        data: createDefaultNodeData(type, label, {
          throughput,
          latency,
          capacity,
          status: 'healthy',
        }),
      };
    });

    const edges: FlowEdge[] = rawEdges.map((re, idx) => {
      if (!Array.isArray(re) || re.length !== 2) throw new Error('Invalid shared edge');
      const sourceIndex = re[0];
      const targetIndex = re[1];
      if (typeof sourceIndex !== 'number' || typeof targetIndex !== 'number') throw new Error('Invalid shared edge');
      const source = nodes[sourceIndex];
      const target = nodes[targetIndex];
      if (!source || !target) throw new Error('Shared edge references unknown node');
      return {
        id: `e-shared-${idx}-${source.id}-${target.id}`,
        source: source.id,
        target: target.id,
        type: 'animated',
      };
    });

    return { name: raw.n, nodes, edges };
  } catch {
    return null;
  }
}
