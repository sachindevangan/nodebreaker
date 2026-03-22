import type { FlowEdge, FlowNode, NodeBreakerNodeData } from '@/types';
import type { NodeMetrics } from './models';

export type ChaosEventType =
  | 'node_crash'
  | 'latency_spike'
  | 'capacity_drop'
  | 'packet_loss'
  | 'memory_pressure'
  | 'network_partition'
  | 'cascading_failure'
  | 'cpu_spike';

export interface ChaosEvent {
  id: string;
  type: ChaosEventType;
  targetNodeId: string;
  duration: number;
  config: Record<string, number>;
  startTick: number;
  isActive: boolean;
  /** Second endpoint for network partition (optional). */
  peerNodeId?: string;
  /** Accumulated throughput degradation % for memory_pressure (0–100). */
  memoryPressureAccumulated?: number;
}

export interface NodeChaosModifier {
  crashed: boolean;
  latencyMultiplier: number;
  latencyAddMs: number;
  throughputMultiplier: number;
  packetLossPercent: number;
  /** Multiplicative factor on final latency from cascading_failure upstream overload. */
  cascadingLatencyFactor: number;
}

export function defaultNodeChaosModifier(): NodeChaosModifier {
  return {
    crashed: false,
    latencyMultiplier: 1,
    latencyAddMs: 0,
    throughputMultiplier: 1,
    packetLossPercent: 0,
    cascadingLatencyFactor: 1,
  };
}

export interface ChaosEngineContext {
  modifiers: Map<string, NodeChaosModifier>;
  partitionedEdgeIds: Set<string>;
  hasCascadingFailure: boolean;
  cascadingLatencyPenaltyPercent: number;
}

function modifierFor(
  map: Map<string, NodeChaosModifier>,
  nodeId: string
): NodeChaosModifier {
  let m = map.get(nodeId);
  if (!m) {
    m = defaultNodeChaosModifier();
    map.set(nodeId, m);
  }
  return m;
}

/** Deterministic 0–99 roll for packet loss (stable per tick + request + node). */
export function chaosPacketLossRoll(tick: number, nodeId: string, requestId: string): number {
  let h = 2166136261;
  const s = `${tick}|${nodeId}|${requestId}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 100;
}

export function resolveEffectiveNodeTiming(
  data: NodeBreakerNodeData,
  mod: NodeChaosModifier | undefined
): { throughput: number; latency: number; packetLossPercent: number } {
  if (!mod) {
    return { throughput: data.throughput, latency: data.latency, packetLossPercent: 0 };
  }
  if (mod.crashed) {
    return {
      throughput: 0,
      latency: data.latency,
      packetLossPercent: Math.min(100, mod.packetLossPercent),
    };
  }
  const t = Math.max(0, data.throughput * mod.throughputMultiplier);
  const l = Math.max(
    0,
    (data.latency * mod.latencyMultiplier + mod.latencyAddMs) * mod.cascadingLatencyFactor
  );
  return {
    throughput: t,
    latency: l,
    packetLossPercent: Math.min(100, mod.packetLossPercent),
  };
}

/**
 * Single pass over active events (O(events)) plus one pass over edges for cascading (O(edges)).
 */
export function buildChaosEngineContext(
  events: ChaosEvent[],
  nodes: FlowNode[],
  edges: FlowEdge[],
  prevMetrics: Map<string, NodeMetrics>
): ChaosEngineContext {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const modifiers = new Map<string, NodeChaosModifier>();
  const partitionedEdgeIds = new Set<string>();
  let cascadingLatencyPenaltyPercent = 0;
  let hasCascadingFailure = false;

  const active = events.filter((e) => e.isActive && nodeIds.has(e.targetNodeId));

  for (const ev of active) {
    switch (ev.type) {
      case 'node_crash': {
        modifierFor(modifiers, ev.targetNodeId).crashed = true;
        break;
      }
      case 'latency_spike': {
        const mult = ev.config.multiplier ?? 10;
        const m = modifierFor(modifiers, ev.targetNodeId);
        m.latencyMultiplier *= mult;
        break;
      }
      case 'capacity_drop': {
        const pct = ev.config.percentage ?? 50;
        const m = modifierFor(modifiers, ev.targetNodeId);
        m.throughputMultiplier *= Math.max(0, 1 - pct / 100);
        break;
      }
      case 'packet_loss': {
        const pct = ev.config.percentage ?? 30;
        const m = modifierFor(modifiers, ev.targetNodeId);
        m.packetLossPercent = Math.max(m.packetLossPercent, pct);
        break;
      }
      case 'memory_pressure': {
        const acc = ev.memoryPressureAccumulated ?? 0;
        const m = modifierFor(modifiers, ev.targetNodeId);
        m.throughputMultiplier *= Math.max(0, 1 - acc / 100);
        break;
      }
      case 'network_partition': {
        const peer = ev.peerNodeId;
        if (peer && nodeIds.has(peer)) {
          for (const edge of edges) {
            if (
              (edge.source === ev.targetNodeId && edge.target === peer) ||
              (edge.source === peer && edge.target === ev.targetNodeId)
            ) {
              partitionedEdgeIds.add(edge.id);
            }
          }
        } else {
          for (const edge of edges) {
            if (edge.source === ev.targetNodeId || edge.target === ev.targetNodeId) {
              partitionedEdgeIds.add(edge.id);
            }
          }
        }
        break;
      }
      case 'cascading_failure': {
        hasCascadingFailure = true;
        const p = ev.config.latencyPenalty ?? 20;
        cascadingLatencyPenaltyPercent = Math.max(cascadingLatencyPenaltyPercent, p);
        break;
      }
      case 'cpu_spike': {
        const add = ev.config.addedMs ?? 200;
        modifierFor(modifiers, ev.targetNodeId).latencyAddMs += add;
        break;
      }
      default:
        break;
    }
  }

  if (hasCascadingFailure && cascadingLatencyPenaltyPercent > 0) {
    const factor = 1 + cascadingLatencyPenaltyPercent / 100;
    for (const edge of edges) {
      const u = edge.source;
      const v = edge.target;
      const uMet = prevMetrics.get(u);
      if (uMet && uMet.utilization > 0.9) {
        modifierFor(modifiers, v).cascadingLatencyFactor *= factor;
      }
    }
  }

  return { modifiers, partitionedEdgeIds, hasCascadingFailure, cascadingLatencyPenaltyPercent };
}

export function isChaosEventType(value: string): value is ChaosEventType {
  return (
    value === 'node_crash' ||
    value === 'latency_spike' ||
    value === 'capacity_drop' ||
    value === 'packet_loss' ||
    value === 'memory_pressure' ||
    value === 'network_partition' ||
    value === 'cascading_failure' ||
    value === 'cpu_spike'
  );
}
