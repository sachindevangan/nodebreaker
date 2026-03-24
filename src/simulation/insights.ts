import type { FlowEdge, FlowNode } from '@/types';
import type { NodeMetrics } from './models';

export interface SimulationInsight {
  id: string;
  message: string;
  learnMore: { kind: 'component'; componentType: FlowNode['type'] } | { kind: 'term'; term: string };
}

export interface InsightState {
  lastShownAt: number;
  queueDepthHistory: Map<string, number[]>;
}

export function createInitialInsightState(): InsightState {
  return { lastShownAt: 0, queueDepthHistory: new Map() };
}

export function detectInsights(
  nodes: FlowNode[],
  edges: FlowEdge[],
  nodeMetrics: Map<string, NodeMetrics>,
  prev: InsightState
): { insight: SimulationInsight | null; nextState: InsightState } {
  const now = Date.now();
  const nextState: InsightState = {
    lastShownAt: prev.lastShownAt,
    queueDepthHistory: new Map(prev.queueDepthHistory),
  };

  for (const node of nodes) {
    const depth = nodeMetrics.get(node.id)?.queueDepth ?? 0;
    const hist = [...(nextState.queueDepthHistory.get(node.id) ?? []), depth].slice(-4);
    nextState.queueDepthHistory.set(node.id, hist);
  }

  if (now - prev.lastShownAt < 5000) {
    return { insight: null, nextState };
  }

  const byId = new Map(nodes.map((n) => [n.id, n] as const));
  const outgoing = new Map<string, FlowEdge[]>();
  const incoming = new Map<string, FlowEdge[]>();
  for (const edge of edges) {
    outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge]);
    incoming.set(edge.target, [...(incoming.get(edge.target) ?? []), edge]);
  }

  for (const node of nodes) {
    const m = nodeMetrics.get(node.id);
    if (!m) continue;
    if (m.utilization > 0.8) {
      return {
        insight: {
          id: `bottleneck-${node.id}`,
          message: `Bottleneck at ${node.data.label}: receiving ${Math.round(m.currentLoad)} req/s but configured near ${node.data.throughput} req/s. Consider adding cache, replicas, or horizontal scale.`,
          learnMore: { kind: 'term', term: 'Bottleneck' },
        },
        nextState: { ...nextState, lastShownAt: now },
      };
    }
  }

  for (const node of nodes) {
    const inCount = incoming.get(node.id)?.length ?? 0;
    const outCount = outgoing.get(node.id)?.length ?? 0;
    if (inCount === 1 && outCount === 1) {
      return {
        insight: {
          id: `spof-${node.id}`,
          message: `Single Point of Failure: ${node.data.label} has no redundancy on this path. If it fails, traffic flow likely breaks.`,
          learnMore: { kind: 'term', term: 'Single Point of Failure (SPOF)' },
        },
        nextState: { ...nextState, lastShownAt: now },
      };
    }
  }

  for (const node of nodes) {
    const outs = outgoing.get(node.id) ?? [];
    if (outs.length < 2) continue;
    const utilizations = outs
      .map((e) => ({ edge: e, util: nodeMetrics.get(e.target)?.utilization ?? 0 }))
      .sort((a, b) => b.util - a.util);
    const hottest = utilizations[0];
    const coldest = utilizations[utilizations.length - 1];
    if (hottest && coldest && hottest.util > 0.8 && hottest.util - coldest.util > 0.45) {
      const hotNode = byId.get(hottest.edge.target);
      const coldNode = byId.get(coldest.edge.target);
      if (!hotNode || !coldNode) continue;
      return {
        insight: {
          id: `fanout-${node.id}`,
          message: `Unbalanced load: ${hotNode.data.label} is at ${Math.round(hottest.util * 100)}% while ${coldNode.data.label} is at ${Math.round(coldest.util * 100)}%. Review balancing algorithm/weights.`,
          learnMore: { kind: 'term', term: 'Load Balancing' },
        },
        nextState: { ...nextState, lastShownAt: now },
      };
    }
  }

  for (const node of nodes) {
    if (node.type !== 'queue') continue;
    const hist = nextState.queueDepthHistory.get(node.id) ?? [];
    if (hist.length >= 4) {
      const [a, b, c, d] = hist;
      if (
        a !== undefined &&
        b !== undefined &&
        c !== undefined &&
        d !== undefined &&
        a < b &&
        b < c &&
        c < d &&
        d > 100
      ) {
      return {
        insight: {
          id: `queue-${node.id}`,
          message: `Queue at ${node.data.label} is growing unbounded (depth: ${d}). Consumers are not keeping up with producers.`,
          learnMore: { kind: 'component', componentType: 'queue' },
        },
        nextState: { ...nextState, lastShownAt: now },
      };
    }
    }
  }

  for (const e1 of edges) {
    const n1 = byId.get(e1.source);
    const n2 = byId.get(e1.target);
    if (!n1 || !n2) continue;
    const nextEdges = outgoing.get(n2.id) ?? [];
    for (const e2 of nextEdges) {
      const n3 = byId.get(e2.target);
      if (!n3) continue;
      const u1 = nodeMetrics.get(n1.id)?.utilization ?? 0;
      const u2 = nodeMetrics.get(n2.id)?.utilization ?? 0;
      const u3 = nodeMetrics.get(n3.id)?.utilization ?? 0;
      if (u1 > 0.6 && u2 > 0.6 && u3 > 0.6) {
        return {
          insight: {
            id: `cascade-${n1.id}-${n2.id}-${n3.id}`,
            message: `Cascading failure risk: ${n1.data.label} -> ${n2.data.label} -> ${n3.data.label} are all heavily utilized.`,
            learnMore: { kind: 'term', term: 'Circuit Breaker' },
          },
          nextState: { ...nextState, lastShownAt: now },
        };
      }
    }
  }

  return { insight: null, nextState };
}
