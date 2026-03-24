import { create } from 'zustand';
import type { FlowEdge, FlowNode } from '@/types';

export interface HistorySnapshot {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const MAX_DEPTH = 50;

function deepCloneGraph(nodes: FlowNode[], edges: FlowEdge[]): HistorySnapshot {
  return {
    nodes: nodes.map((n) => ({ ...n, data: { ...n.data }, position: { ...n.position } })),
    edges: edges.map((e) => ({ ...e })),
  };
}

export interface HistoryStore {
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  /** Push current graph to past stack. Call after user-initiated mutations. */
  recordSnapshot: (nodes: FlowNode[], edges: FlowEdge[]) => void;

  /** Restore state (used by undo/redo). Returns snapshot to restore. */
  getUndoSnapshot: () => HistorySnapshot | null;
  getRedoSnapshot: () => HistorySnapshot | null;

  /** Move backwards: pop from past, push current to future. Returns snapshot to restore. */
  consumeUndo: (currentNodes: FlowNode[], currentEdges: FlowEdge[]) => HistorySnapshot | null;

  /** Move forwards: pop from future, push current to past. Returns snapshot to restore. */
  consumeRedo: (currentNodes: FlowNode[], currentEdges: FlowEdge[]) => HistorySnapshot | null;

  clear: () => void;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],

  recordSnapshot: (nodes, edges) => {
    set((state) => {
      const snapshot = deepCloneGraph(nodes, edges);
      const past = [...state.past, snapshot].slice(-MAX_DEPTH);
      return { past, future: [] };
    });
  },

  getUndoSnapshot: () => {
    const { past } = get();
    return past.length > 0 ? past[past.length - 1]! : null;
  },

  getRedoSnapshot: () => {
    const { future } = get();
    return future.length > 0 ? future[future.length - 1]! : null;
  },

  consumeUndo: (currentNodes, currentEdges) => {
    const snapshot = get().getUndoSnapshot();
    if (!snapshot) return null;
    set((state) => ({
      past: state.past.slice(0, -1),
      future: [deepCloneGraph(currentNodes, currentEdges), ...state.future].slice(-MAX_DEPTH),
    }));
    return snapshot;
  },

  consumeRedo: (currentNodes, currentEdges) => {
    const { future } = get();
    if (future.length === 0) return null;
    const snapshot = future[0]!;
    set((state) => ({
      past: [...state.past, deepCloneGraph(currentNodes, currentEdges)].slice(-MAX_DEPTH),
      future: state.future.slice(1),
    }));
    return snapshot;
  },

  clear: () => set({ past: [], future: [] }),
}));
