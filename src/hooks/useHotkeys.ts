import { useEffect } from 'react';
import type { SimSpeed } from '@/simulation/models';
import { contextMenuController } from '@/utils/contextMenuController';
import { getClipboardBlueprint, setClipboardForCopy } from '@/utils/nodeClipboard';
import { useChaosStore } from '@/store/useChaosStore';
import { useFlowStore } from '@/store/useFlowStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useSimStore } from '@/store/useSimStore';
import { useToastStore } from '@/store/useToastStore';

const SPEED_BY_DIGIT: readonly SimSpeed[] = [0.5, 1, 2, 5] as const;

function shouldIgnoreHotkeys(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest('[data-hotkeys-ignore]')) return true;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  if (target.closest('button')) return true;
  return false;
}

/**
 * Global shortcuts for canvas simulation, selection, undo/redo, copy/paste.
 * `shortcutsModalOpen`: when true, Escape closes the help modal instead of clearing selection.
 */
export function useHotkeys(shortcutsModalOpen: boolean, closeShortcutsModal: () => void): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (shortcutsModalOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeShortcutsModal();
        }
        return;
      }

      if (shouldIgnoreHotkeys(e.target)) return;

      const sim = useSimStore.getState();
      const flow = useFlowStore.getState();
      const history = useHistoryStore.getState();

      if (e.key === 'Escape') {
        e.preventDefault();
        if (contextMenuController.dismiss) {
          contextMenuController.dismiss();
          return;
        }
        flow.clearSelectedNode();
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            const snapshot = history.consumeRedo(flow.nodes, flow.edges);
            if (snapshot) {
              flow.replaceGraph(
                snapshot.nodes.map((n) => ({ ...n, selected: false })),
                snapshot.edges
              );
            }
          } else {
            const snapshot = history.consumeUndo(flow.nodes, flow.edges);
            if (snapshot) {
              useChaosStore.getState().clearAllChaos();
              useSimStore.getState().stopSession();
              flow.replaceGraph(
                snapshot.nodes.map((n) => ({ ...n, selected: false })),
                snapshot.edges
              );
            }
          }
          return;
        }
        if (e.key === 'y') {
          e.preventDefault();
          const snapshot = history.consumeRedo(flow.nodes, flow.edges);
          if (snapshot) {
            flow.replaceGraph(
              snapshot.nodes.map((n) => ({ ...n, selected: false })),
              snapshot.edges
            );
          }
          return;
        }
        if (e.key === 'c') {
          e.preventDefault();
          const nodeId = flow.selectedNodeId;
          if (nodeId) {
            const node = flow.nodes.find((n) => n.id === nodeId);
            if (node) {
              setClipboardForCopy(node);
            }
          }
          return;
        }
        if (e.key === 'v') {
          e.preventDefault();
          if (getClipboardBlueprint()) {
            const { nodes, edges } = useFlowStore.getState();
            useHistoryStore.getState().recordSnapshot(nodes, edges);
            const label = flow.pasteFromClipboard();
            if (label) {
              useToastStore.getState().push({ kind: 'success', message: `Pasted ${label}` });
            }
          }
          return;
        }
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (sim.simulationSessionActive) {
          sim.togglePlayPause();
        }
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        if (sim.simulationSessionActive) {
          e.preventDefault();
          sim.resetSimulation();
        }
        return;
      }

      const digitIdx = '1234'.indexOf(e.key);
      if (digitIdx !== -1 && sim.simulationSessionActive) {
        e.preventDefault();
        sim.setSpeed(SPEED_BY_DIGIT[digitIdx]!);
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shortcutsModalOpen, closeShortcutsModal]);
}
