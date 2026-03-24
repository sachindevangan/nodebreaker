import { create } from 'zustand';
import { buildChaosEngineContext } from '@/simulation/chaos';
import {
  createInitialEngineState,
  runSimulationTick,
  type SimulationEngineState,
} from '@/simulation/engine';
import { createInitialInsightState, detectInsights, type InsightState } from '@/simulation/insights';
import { MetricsTracker } from '@/simulation/metrics';
import type {
  EdgeTrafficVisual,
  NodeMetrics,
  SimSpeed,
  SimulationRequest,
} from '@/simulation/models';
import { SIM_SPEEDS } from '@/simulation/models';
import type { NodeStatus } from '@/types';
import { getEntryNodeIds } from '@/utils/graph';
import { useChaosStore } from './useChaosStore';
import { useToastStore } from './useToastStore';
import { useFlowStore } from './useFlowStore';

const metricsTracker = new MetricsTracker();

const TRAFFIC_MIN = 10;
const TRAFFIC_MAX = 2000;
const TRAFFIC_DEFAULT = 200;

export interface GlobalMetricsSnapshot {
  totalGenerated: number;
  totalCompleted: number;
  totalDropped: number;
  avgEndToEndLatency: number;
}

export interface SimStore {
  /** True after START until STOP — shows control bar and sim-themed canvas. */
  simulationSessionActive: boolean;
  /** When session is active, whether the engine interval is advancing ticks. */
  isPlaying: boolean;
  speed: SimSpeed;
  speedOptions: readonly SimSpeed[];
  tickCount: number;
  trafficVolume: number;
  globalMetrics: GlobalMetricsSnapshot;
  globalMetricsPrev: GlobalMetricsSnapshot;
  nodeMetrics: Map<string, NodeMetrics>;
  activeRequests: SimulationRequest[];
  edgeTraffic: Map<string, EdgeTrafficVisual>;
  /** Sum of in-transit counts across edges; used to apportion global traffic for edge labels */
  totalInTransitOnEdges: number;
  engineState: SimulationEngineState;
  entryNodeIds: string[];
  simulatedStatusByNodeId: Map<string, NodeStatus>;
  bottleneckNotifiedNodeIds: Set<string>;
  insightState: InsightState;

  startSession: () => void;
  stopSession: () => void;
  togglePlayPause: () => void;
  resetSimulation: () => void;
  setSpeed: (speed: SimSpeed) => void;
  setTrafficVolume: (volume: number) => void;
  tick: () => void;
}

const emptyGlobalMetrics = (): GlobalMetricsSnapshot => ({
  totalGenerated: 0,
  totalCompleted: 0,
  totalDropped: 0,
  avgEndToEndLatency: 0,
});

export const useSimStore = create<SimStore>((set, get) => ({
  simulationSessionActive: false,
  isPlaying: false,
  speed: 1,
  speedOptions: SIM_SPEEDS,
  tickCount: 0,
  trafficVolume: TRAFFIC_DEFAULT,
  globalMetrics: emptyGlobalMetrics(),
  globalMetricsPrev: emptyGlobalMetrics(),
  nodeMetrics: new Map(),
  activeRequests: [],
  edgeTraffic: new Map(),
  totalInTransitOnEdges: 0,
  engineState: createInitialEngineState(),
  entryNodeIds: [],
  simulatedStatusByNodeId: new Map(),
  bottleneckNotifiedNodeIds: new Set(),
  insightState: createInitialInsightState(),

  startSession: () => {
    const { simulationSessionActive } = get();
    if (simulationSessionActive) return;

    const { nodes, edges } = useFlowStore.getState();
    const entryNodeIds = getEntryNodeIds(nodes, edges);
    if (entryNodeIds.length === 0) {
      useToastStore.getState().push({
        kind: 'error',
        message: 'No entry point found — add a node with no incoming connections',
      });
      return;
    }

    metricsTracker.reset();
    useChaosStore.getState().clearAllChaos();
    set({
      simulationSessionActive: true,
      isPlaying: true,
      entryNodeIds,
      tickCount: 0,
      engineState: createInitialEngineState(),
      nodeMetrics: new Map(),
      activeRequests: [],
      edgeTraffic: new Map(),
      totalInTransitOnEdges: 0,
      globalMetrics: emptyGlobalMetrics(),
      globalMetricsPrev: emptyGlobalMetrics(),
      simulatedStatusByNodeId: new Map(),
      bottleneckNotifiedNodeIds: new Set(),
      insightState: createInitialInsightState(),
    });
    useToastStore.getState().push({ kind: 'success', message: 'Simulation started' });
  },

  stopSession: () => {
    metricsTracker.reset();
    set({
      simulationSessionActive: false,
      isPlaying: false,
      tickCount: 0,
      engineState: createInitialEngineState(),
      nodeMetrics: new Map(),
      activeRequests: [],
      edgeTraffic: new Map(),
      totalInTransitOnEdges: 0,
      entryNodeIds: [],
      simulatedStatusByNodeId: new Map(),
      globalMetrics: emptyGlobalMetrics(),
      globalMetricsPrev: emptyGlobalMetrics(),
      bottleneckNotifiedNodeIds: new Set(),
      insightState: createInitialInsightState(),
    });
  },

  togglePlayPause: () => {
    const { simulationSessionActive, isPlaying } = get();
    if (!simulationSessionActive) return;
    const next = !isPlaying;
    set({ isPlaying: next });
    if (!next) {
      useToastStore.getState().push({ kind: 'warning', message: 'Simulation paused' });
    }
  },

  resetSimulation: () => {
    const { simulationSessionActive } = get();
    if (!simulationSessionActive) return;

    metricsTracker.reset();
    useChaosStore.getState().clearAllChaos();
    set({
      isPlaying: false,
      tickCount: 0,
      engineState: createInitialEngineState(),
      nodeMetrics: new Map(),
      activeRequests: [],
      edgeTraffic: new Map(),
      totalInTransitOnEdges: 0,
      simulatedStatusByNodeId: new Map(),
      globalMetrics: emptyGlobalMetrics(),
      globalMetricsPrev: emptyGlobalMetrics(),
      bottleneckNotifiedNodeIds: new Set(),
      insightState: createInitialInsightState(),
    });
    useToastStore.getState().push({ kind: 'info', message: 'Simulation reset' });
  },

  setSpeed: (speed: SimSpeed) => {
    set({ speed });
  },

  setTrafficVolume: (volume: number) => {
    const v = Number.isFinite(volume) ? Math.floor(volume) : TRAFFIC_DEFAULT;
    set({ trafficVolume: Math.min(TRAFFIC_MAX, Math.max(TRAFFIC_MIN, v)) });
  },

  tick: () => {
    const { nodes, edges } = useFlowStore.getState();
    const {
      engineState,
      trafficVolume,
      tickCount,
      entryNodeIds,
      nodeMetrics: prevMetrics,
      globalMetrics: prevGlobal,
      bottleneckNotifiedNodeIds,
      insightState,
    } = get();

    const validIds = new Set(nodes.map((n) => n.id));
    useChaosStore.getState().tick(tickCount, validIds);
    const chaosEvents = useChaosStore.getState().activeEvents;
    const chaosContext = buildChaosEngineContext(chaosEvents, nodes, edges, prevMetrics);

    const result = runSimulationTick({
      nodes,
      edges,
      state: engineState,
      trafficVolume,
      tickCount,
      entryNodeIds,
      prevMetrics,
      chaosContext,
    });

    metricsTracker.replaceAll(result.nodeMetrics);

    let totalInTransitOnEdges = 0;
    for (const v of result.edgeTraffic.values()) {
      totalInTransitOnEdges += v.activeCount;
    }

    const { completed, completedLatencySum, dropped } = result.tickStats;
    const offeredThisTick =
      entryNodeIds.length > 0 && trafficVolume > 0 ? trafficVolume : 0;
    const totalGenerated = prevGlobal.totalGenerated + offeredThisTick;
    const totalCompleted = prevGlobal.totalCompleted + completed;
    const totalDropped = prevGlobal.totalDropped + dropped;
    const completedLatencyRunningSum =
      prevGlobal.avgEndToEndLatency * prevGlobal.totalCompleted + completedLatencySum;
    const avgEndToEndLatency =
      totalCompleted > 0 ? completedLatencyRunningSum / totalCompleted : 0;

    const nextGlobal: GlobalMetricsSnapshot = {
      totalGenerated,
      totalCompleted,
      totalDropped,
      avgEndToEndLatency,
    };

    const simulatedStatusByNodeId = new Map<string, NodeStatus>();
    const nextBottleneckIds = new Set(bottleneckNotifiedNodeIds);
    for (const m of result.nodeMetrics.values()) {
      const u = m.utilization;
      if (u > 0.8) {
        simulatedStatusByNodeId.set(m.nodeId, 'down');
        if (!nextBottleneckIds.has(m.nodeId)) {
          nextBottleneckIds.add(m.nodeId);
          const label = nodes.find((n) => n.id === m.nodeId)?.data.label ?? m.nodeId;
          useToastStore.getState().push({
            kind: 'orange',
            message: `Bottleneck detected at ${label}`,
          });
        }
      } else {
        nextBottleneckIds.delete(m.nodeId);
        if (u >= 0.5) {
          simulatedStatusByNodeId.set(m.nodeId, 'degraded');
        } else {
          simulatedStatusByNodeId.set(m.nodeId, 'healthy');
        }
      }
    }
    const insightResult = detectInsights(nodes, edges, result.nodeMetrics, insightState);
    if (insightResult.insight) {
      useToastStore.getState().push({
        kind: 'info',
        message: insightResult.insight.message,
        durationMs: 8000,
        learnMore: insightResult.insight.learnMore,
      });
    }

    set({
      engineState: result.state,
      activeRequests: result.activeRequests,
      nodeMetrics: result.nodeMetrics,
      edgeTraffic: result.edgeTraffic,
      totalInTransitOnEdges,
      tickCount: tickCount + 1,
      simulatedStatusByNodeId,
      globalMetricsPrev: { ...prevGlobal },
      globalMetrics: nextGlobal,
      bottleneckNotifiedNodeIds: nextBottleneckIds,
      insightState: insightResult.nextState,
    });
  },
}));
