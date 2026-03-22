import { create } from 'zustand';
import {
  createInitialEngineState,
  runSimulationTick,
  type SimulationEngineState,
} from '@/simulation/engine';
import { MetricsTracker } from '@/simulation/metrics';
import type {
  EdgeTrafficVisual,
  NodeMetrics,
  SimSpeed,
  SimulationRequest,
} from '@/simulation/models';
import { getEntryNodeIds } from '@/utils/graph';
import { useFlowStore } from './useFlowStore';

const metricsTracker = new MetricsTracker();

export interface SimStore {
  isRunning: boolean;
  speed: SimSpeed;
  tickCount: number;
  trafficVolume: number;
  nodeMetrics: Map<string, NodeMetrics>;
  activeRequests: SimulationRequest[];
  edgeTraffic: Map<string, EdgeTrafficVisual>;
  engineState: SimulationEngineState;
  entryNodeIds: string[];
  start: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: SimSpeed) => void;
  setTrafficVolume: (volume: number) => void;
  tick: () => void;
}

export const useSimStore = create<SimStore>((set, get) => ({
  isRunning: false,
  speed: 1,
  tickCount: 0,
  trafficVolume: 100,
  nodeMetrics: new Map(),
  activeRequests: [],
  edgeTraffic: new Map(),
  engineState: createInitialEngineState(),
  entryNodeIds: [],

  start: () => {
    const { isRunning, tickCount } = get();
    if (isRunning) return;

    const { nodes, edges } = useFlowStore.getState();
    const entryNodeIds = getEntryNodeIds(nodes, edges);
    if (entryNodeIds.length === 0) {
      window.alert('Add at least one entry point (node with no incoming connections)');
      return;
    }

    if (tickCount === 0) {
      metricsTracker.reset();
      set({
        isRunning: true,
        entryNodeIds,
        tickCount: 0,
        engineState: createInitialEngineState(),
        nodeMetrics: new Map(),
        activeRequests: [],
        edgeTraffic: new Map(),
      });
    } else {
      set({ isRunning: true, entryNodeIds });
    }
  },

  pause: () => {
    set({ isRunning: false });
  },

  reset: () => {
    metricsTracker.reset();
    set({
      isRunning: false,
      tickCount: 0,
      engineState: createInitialEngineState(),
      nodeMetrics: new Map(),
      activeRequests: [],
      edgeTraffic: new Map(),
      entryNodeIds: [],
    });
  },

  setSpeed: (speed: SimSpeed) => {
    set({ speed });
  },

  setTrafficVolume: (volume: number) => {
    const v = Number.isFinite(volume) ? Math.max(0, Math.floor(volume)) : 0;
    set({ trafficVolume: v });
  },

  tick: () => {
    const { nodes, edges } = useFlowStore.getState();
    const {
      engineState,
      trafficVolume,
      tickCount,
      entryNodeIds,
      nodeMetrics: prevMetrics,
    } = get();

    const result = runSimulationTick({
      nodes,
      edges,
      state: engineState,
      trafficVolume,
      tickCount,
      entryNodeIds,
      prevMetrics,
    });

    metricsTracker.replaceAll(result.nodeMetrics);

    set({
      engineState: result.state,
      activeRequests: result.activeRequests,
      nodeMetrics: result.nodeMetrics,
      edgeTraffic: result.edgeTraffic,
      tickCount: tickCount + 1,
    });
  },
}));
