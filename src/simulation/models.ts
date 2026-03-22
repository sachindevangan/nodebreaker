/**
 * Simulation domain types — traffic requests and per-node metrics.
 */

export type SimulationRequestStatus = 'pending' | 'in-transit' | 'completed' | 'dropped';

export interface SimulationRequest {
  id: string;
  /** When pending: node holding the request. When in-transit: destination node id. */
  currentNodeId: string;
  totalLatency: number;
  hops: string[];
  status: SimulationRequestStatus;
  /** Set while the request is animating on an edge */
  fromNodeId?: string;
  edgeId?: string;
}

export interface NodeMetrics {
  nodeId: string;
  currentLoad: number;
  queueDepth: number;
  totalProcessed: number;
  totalDropped: number;
  avgLatency: number;
  utilization: number;
  /** Drops that happened on the last tick (for UI pulse) */
  droppedInLastTick: number;
}

export type SimSpeed = 0.5 | 1 | 2 | 5;

export const SIM_SPEEDS: readonly SimSpeed[] = [0.5, 1, 2, 5] as const;

export interface EdgeTrafficVisual {
  /** Active in-transit count on this edge (drives dots + stroke) */
  activeCount: number;
  /** True when destination node is overloaded (high util or dropping) */
  overload: boolean;
}
