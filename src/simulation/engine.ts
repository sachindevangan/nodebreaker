import type { FlowEdge, FlowNode, NodeBreakerNodeData } from '@/types';
import { buildOutgoingEdges } from '@/utils/graph';
import type { EdgeTrafficVisual, NodeMetrics, SimulationRequest } from './models';

const SIM_TICKS_PER_SECOND = 10;

export interface SimulationEngineState {
  queues: Map<string, string[]>;
  requests: Map<string, InternalRequest>;
  processCarry: Map<string, number>;
  rrIndex: Map<string, number>;
  nextReqId: number;
}

interface InternalRequest {
  id: string;
  currentNodeId: string;
  fromNodeId?: string;
  edgeId?: string;
  totalLatency: number;
  hops: string[];
  status: 'pending' | 'in-transit';
}

export function createInitialEngineState(): SimulationEngineState {
  return {
    queues: new Map(),
    requests: new Map(),
    processCarry: new Map(),
    rrIndex: new Map(),
    nextReqId: 0,
  };
}

function nodeThroughputPerTick(data: NodeBreakerNodeData): number {
  return data.throughput / SIM_TICKS_PER_SECOND;
}

function maxQueueForNode(data: NodeBreakerNodeData): number {
  return Math.max(0, Math.floor(data.capacity));
}

function pickOutgoingEdge(
  node: FlowNode,
  outgoing: FlowEdge[],
  tickCount: number,
  rrIndex: Map<string, number>,
  queues: Map<string, string[]>
): FlowEdge | undefined {
  if (outgoing.length === 0) return undefined;
  if (outgoing.length === 1) return outgoing[0];

  const algo = node.type === 'loadBalancer' ? node.data.algorithm : 'round_robin';

  switch (algo) {
    case 'random': {
      const idx = (tickCount + node.id.length) % outgoing.length;
      return outgoing[idx];
    }
    case 'least_connections': {
      let bestEdge = outgoing[0]!;
      let bestDepth = (queues.get(bestEdge.target) ?? []).length;
      for (const e of outgoing) {
        const d = (queues.get(e.target) ?? []).length;
        if (d < bestDepth) {
          bestDepth = d;
          bestEdge = e;
        }
      }
      return bestEdge;
    }
    case 'round_robin': {
      const i = rrIndex.get(node.id) ?? 0;
      const edge = outgoing[i % outgoing.length]!;
      rrIndex.set(node.id, i + 1);
      return edge;
    }
    default: {
      const i = rrIndex.get(node.id) ?? 0;
      const edge = outgoing[i % outgoing.length]!;
      rrIndex.set(node.id, i + 1);
      return edge;
    }
  }
}

function cloneState(state: SimulationEngineState): SimulationEngineState {
  const queues = new Map<string, string[]>();
  for (const [k, v] of state.queues) {
    queues.set(k, [...v]);
  }
  return {
    queues,
    requests: new Map(state.requests),
    processCarry: new Map(state.processCarry),
    rrIndex: new Map(state.rrIndex),
    nextReqId: state.nextReqId,
  };
}

function emptyMetrics(nodeId: string): NodeMetrics {
  return {
    nodeId,
    currentLoad: 0,
    queueDepth: 0,
    totalProcessed: 0,
    totalDropped: 0,
    avgLatency: 0,
    utilization: 0,
    droppedInLastTick: 0,
  };
}

export interface RunTickInput {
  nodes: FlowNode[];
  edges: FlowEdge[];
  state: SimulationEngineState;
  trafficVolume: number;
  tickCount: number;
  entryNodeIds: string[];
  prevMetrics: Map<string, NodeMetrics>;
}

export interface RunTickOutput {
  state: SimulationEngineState;
  activeRequests: SimulationRequest[];
  nodeMetrics: Map<string, NodeMetrics>;
  edgeTraffic: Map<string, EdgeTrafficVisual>;
}

function toPublicRequest(r: InternalRequest): SimulationRequest {
  return {
    id: r.id,
    currentNodeId: r.currentNodeId,
    totalLatency: r.totalLatency,
    hops: [...r.hops],
    status: r.status === 'pending' ? 'pending' : 'in-transit',
    fromNodeId: r.fromNodeId,
    edgeId: r.edgeId,
  };
}

/**
 * One simulation step: land in-flight requests, spawn entry traffic, drain queues with capacity limits.
 */
export function runSimulationTick(input: RunTickInput): RunTickOutput {
  const { nodes, edges, trafficVolume, tickCount, entryNodeIds } = input;
  const state = cloneState(input.state);

  const nodeById = new Map(nodes.map((n) => [n.id, n] as const));
  const outgoingBySource = buildOutgoingEdges(edges);

  const accMetrics = new Map<string, NodeMetrics>();
  for (const n of nodes) {
    const prev = input.prevMetrics.get(n.id);
    accMetrics.set(n.id, prev ? { ...prev, droppedInLastTick: 0 } : emptyMetrics(n.id));
  }

  const droppedByNode = new Map<string, number>();
  const addDrop = (nodeId: string) => {
    droppedByNode.set(nodeId, (droppedByNode.get(nodeId) ?? 0) + 1);
    const m = accMetrics.get(nodeId);
    if (m) m.totalDropped += 1;
  };

  const ensureQueue = (nodeId: string): string[] => {
    let q = state.queues.get(nodeId);
    if (!q) {
      q = [];
      state.queues.set(nodeId, q);
    }
    return q;
  };

  // --- Phase 1: land in-transit ---
  const toLand: InternalRequest[] = [];
  for (const r of state.requests.values()) {
    if (r.status === 'in-transit') {
      toLand.push(r);
    }
  }
  for (const r of toLand) {
    state.requests.delete(r.id);
    const dest = r.currentNodeId;
    const node = nodeById.get(dest);
    if (!node) {
      continue;
    }
    const cap = maxQueueForNode(node.data);
    const q = ensureQueue(dest);
    if (q.length >= cap) {
      addDrop(dest);
      continue;
    }
    r.status = 'pending';
    r.fromNodeId = undefined;
    r.edgeId = undefined;
    q.push(r.id);
    state.requests.set(r.id, r);
  }

  // --- Phase 2: spawn at entries ---
  if (entryNodeIds.length > 0 && trafficVolume > 0) {
    for (let s = 0; s < trafficVolume; s++) {
      const entryId = entryNodeIds[s % entryNodeIds.length]!;
      const node = nodeById.get(entryId);
      if (!node) continue;
      const cap = maxQueueForNode(node.data);
      const q = ensureQueue(entryId);
      if (q.length >= cap) {
        addDrop(entryId);
        continue;
      }
      const id = `r-${state.nextReqId++}`;
      const req: InternalRequest = {
        id,
        currentNodeId: entryId,
        totalLatency: 0,
        hops: [],
        status: 'pending',
      };
      state.requests.set(id, req);
      q.push(id);
    }
  }

  // --- Phase 3: process ---
  const servedThisTick = new Map<string, number>();
  for (const n of nodes) {
    servedThisTick.set(n.id, 0);
  }

  const sortedNodeIds = [...nodes.map((n) => n.id)].sort();

  for (const nodeId of sortedNodeIds) {
    const node = nodeById.get(nodeId);
    if (!node) continue;
    const q = state.queues.get(nodeId);
    if (!q || q.length === 0) continue;

    const perTick = nodeThroughputPerTick(node.data);
    const carry = state.processCarry.get(nodeId) ?? 0;
    const budget = perTick + carry;
    const nServe = Math.min(q.length, Math.floor(budget));
    state.processCarry.set(nodeId, Math.max(0, budget - nServe));

    const outgoing = outgoingBySource.get(nodeId) ?? [];
    const m = accMetrics.get(nodeId)!;

    for (let i = 0; i < nServe; i++) {
      const rid = q.shift();
      if (!rid) break;
      const req = state.requests.get(rid);
      if (!req || req.status !== 'pending') continue;

      servedThisTick.set(nodeId, (servedThisTick.get(nodeId) ?? 0) + 1);

      req.totalLatency += node.data.latency;
      req.hops = [...req.hops, nodeId];

      const edge = pickOutgoingEdge(node, outgoing, tickCount, state.rrIndex, state.queues);

      m.totalProcessed += 1;
      const tp = m.totalProcessed;
      m.avgLatency = (m.avgLatency * (tp - 1) + req.totalLatency) / tp;

      if (!edge) {
        state.requests.delete(rid);
        continue;
      }

      req.status = 'in-transit';
      req.fromNodeId = nodeId;
      req.currentNodeId = edge.target;
      req.edgeId = edge.id;
    }
  }

  // --- Metrics + edge visuals ---
  const nodeMetrics = new Map<string, NodeMetrics>();
  const edgeTraffic = new Map<string, EdgeTrafficVisual>();

  for (const n of nodes) {
    const acc = accMetrics.get(n.id) ?? emptyMetrics(n.id);
    const q = state.queues.get(n.id) ?? [];
    const depth = q.length;
    const droppedHere = droppedByNode.get(n.id) ?? 0;
    const throughput = Math.max(1, n.data.throughput);
    const served = servedThisTick.get(n.id) ?? 0;
    const currentLoad = served * SIM_TICKS_PER_SECOND;
    const utilization = Math.min(1, currentLoad / throughput);

    nodeMetrics.set(n.id, {
      nodeId: n.id,
      currentLoad,
      queueDepth: depth,
      totalProcessed: acc.totalProcessed,
      totalDropped: acc.totalDropped,
      avgLatency: acc.avgLatency,
      utilization,
      droppedInLastTick: droppedHere,
    });
  }

  const transitByEdge = new Map<string, number>();
  for (const r of state.requests.values()) {
    if (r.status === 'in-transit' && r.edgeId) {
      const eid = r.edgeId;
      transitByEdge.set(eid, (transitByEdge.get(eid) ?? 0) + 1);
    }
  }

  for (const e of edges) {
    const activeCount = transitByEdge.get(e.id) ?? 0;
    const destMetrics = nodeMetrics.get(e.target);
    const destNode = nodeById.get(e.target);
    const overload = Boolean(
      (destMetrics?.utilization ?? 0) >= 0.8 ||
        (destMetrics?.droppedInLastTick ?? 0) > 0 ||
        (destNode !== undefined &&
          destMetrics !== undefined &&
          destMetrics.queueDepth >= Math.max(1, Math.floor(destNode.data.capacity)) * 0.95)
    );

    edgeTraffic.set(e.id, { activeCount, overload });
  }

  const activeRequests: SimulationRequest[] = [];
  for (const r of state.requests.values()) {
    activeRequests.push(toPublicRequest(r));
  }

  return {
    state,
    activeRequests,
    nodeMetrics,
    edgeTraffic,
  };
}
