import type { NodeMetrics } from './models';

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

/**
 * Maintains per-node simulation metrics snapshots (updated each tick from the engine).
 */
export class MetricsTracker {
  private map = new Map<string, NodeMetrics>();

  reset(): void {
    this.map.clear();
  }

  ensureNode(nodeId: string): void {
    if (!this.map.has(nodeId)) {
      this.map.set(nodeId, emptyMetrics(nodeId));
    }
  }

  /** Returns 0 when unknown. */
  getUtilization(nodeId: string): number {
    return this.map.get(nodeId)?.utilization ?? 0;
  }

  get(nodeId: string): NodeMetrics | undefined {
    return this.map.get(nodeId);
  }

  getAll(): Map<string, NodeMetrics> {
    return new Map(this.map);
  }

  replaceAll(next: Map<string, NodeMetrics>): void {
    this.map = new Map(next);
  }
}
