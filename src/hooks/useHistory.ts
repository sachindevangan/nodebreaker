import { useCallback } from 'react';
import { useChaosStore } from '@/store/useChaosStore';
import { useFlowStore } from '@/store/useFlowStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useSimStore } from '@/store/useSimStore';

export function useHistory() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const replaceGraph = useFlowStore((s) => s.replaceGraph);
  const past = useHistoryStore((s) => s.past);
  const future = useHistoryStore((s) => s.future);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const undo = useCallback(() => {
    const snapshot = useHistoryStore.getState().consumeUndo(nodes, edges);
    if (snapshot) {
      useChaosStore.getState().clearAllChaos();
      useSimStore.getState().stopSession();
      replaceGraph(
        snapshot.nodes.map((n) => ({ ...n, selected: false })),
        snapshot.edges
      );
    }
  }, [nodes, edges, replaceGraph]);

  const redo = useCallback(() => {
    const snapshot = useHistoryStore.getState().consumeRedo(nodes, edges);
    if (snapshot) {
      replaceGraph(snapshot.nodes, snapshot.edges);
    }
  }, [nodes, edges, replaceGraph]);

  const recordSnapshot = useCallback(() => {
    const { nodes: n, edges: e } = useFlowStore.getState();
    useHistoryStore.getState().recordSnapshot(n, e);
  }, []);

  return { undo, redo, canUndo, canRedo, recordSnapshot };
}
