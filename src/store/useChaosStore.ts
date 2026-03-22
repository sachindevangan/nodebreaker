import { create } from 'zustand';
import type { ChaosEvent, ChaosEventType } from '@/simulation/chaos';
import { getChaosEventDefinition } from '@/constants/chaosEvents';

export interface ChaosHistoryEntry {
  /** Snapshot at deactivation */
  event: ChaosEvent;
  endedAtTick: number;
}

export interface ChaosStore {
  activeEvents: ChaosEvent[];
  eventHistory: ChaosHistoryEntry[];

  injectChaos: (
    type: ChaosEventType,
    targetNodeId: string,
    options?: {
      startTick: number;
      config?: Record<string, number>;
      peerNodeId?: string;
    }
  ) => void;
  removeChaos: (eventId: string, simTickCount: number) => void;
  removeEventsForNode: (nodeId: string) => void;
  clearAllChaos: () => void;
  /** Advance durations, memory pressure, prune invalid targets. Call at start of each sim tick. */
  tick: (simTickCount: number, validNodeIds: Set<string>) => void;
}

function deactivateEvent(ev: ChaosEvent, simTickCount: number): ChaosHistoryEntry {
  return {
    event: { ...ev, isActive: false },
    endedAtTick: simTickCount,
  };
}

export const useChaosStore = create<ChaosStore>((set, get) => ({
  activeEvents: [],
  eventHistory: [],

  injectChaos: (type, targetNodeId, options) => {
    const def = getChaosEventDefinition(type);
    if (!def) return;

    const startTick = options?.startTick ?? 0;
    const mergedConfig: Record<string, number> = { ...def.defaultConfig, ...options?.config };

    const ev: ChaosEvent = {
      id: crypto.randomUUID(),
      type,
      targetNodeId,
      duration: def.defaultDuration,
      config: mergedConfig,
      startTick,
      isActive: true,
      peerNodeId: options?.peerNodeId,
      memoryPressureAccumulated: type === 'memory_pressure' ? 0 : undefined,
    };

    set({ activeEvents: [...get().activeEvents, ev] });
  },

  removeChaos: (eventId, simTickCount) => {
    set((state) => {
      const historyAdd: ChaosHistoryEntry[] = [];
      const activeEvents = state.activeEvents.map((ev) => {
        if (ev.id !== eventId || !ev.isActive) return ev;
        historyAdd.push(deactivateEvent(ev, simTickCount));
        return { ...ev, isActive: false };
      });
      return {
        activeEvents,
        eventHistory: [...state.eventHistory, ...historyAdd].slice(-200),
      };
    });
  },

  removeEventsForNode: (nodeId) => {
    set((state) => {
      const historyAdd: ChaosHistoryEntry[] = [];
      const activeEvents = state.activeEvents.map((ev) => {
        if (!ev.isActive) return ev;
        if (ev.targetNodeId === nodeId || ev.peerNodeId === nodeId) {
          historyAdd.push(deactivateEvent(ev, 0));
          return { ...ev, isActive: false };
        }
        return ev;
      });
      return {
        activeEvents,
        eventHistory: [...state.eventHistory, ...historyAdd].slice(-200),
      };
    });
  },

  clearAllChaos: () => {
    set({ activeEvents: [], eventHistory: [] });
  },

  tick: (simTickCount, validNodeIds) => {
    set((state) => {
      const historyAdd: ChaosHistoryEntry[] = [];
      const activeEvents = state.activeEvents.map((ev) => {
        if (!ev.isActive) return ev;

        if (!validNodeIds.has(ev.targetNodeId)) {
          historyAdd.push(deactivateEvent(ev, simTickCount));
          return { ...ev, isActive: false };
        }
        if (ev.peerNodeId && !validNodeIds.has(ev.peerNodeId)) {
          historyAdd.push(deactivateEvent(ev, simTickCount));
          return { ...ev, isActive: false };
        }

        let next: ChaosEvent = ev;
        if (ev.type === 'memory_pressure') {
          const d = ev.config.degradePerTick ?? 0.5;
          const acc = Math.min(100, (ev.memoryPressureAccumulated ?? 0) + d);
          next = { ...ev, memoryPressureAccumulated: acc };
        }

        if (next.duration >= 0 && simTickCount >= next.startTick + next.duration) {
          historyAdd.push(deactivateEvent(next, simTickCount));
          return { ...next, isActive: false };
        }

        return next;
      });

      return {
        activeEvents,
        eventHistory: [...state.eventHistory, ...historyAdd].slice(-200),
      };
    });
  },
}));
