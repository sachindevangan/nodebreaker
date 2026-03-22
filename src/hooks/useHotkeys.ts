import { useEffect } from 'react';
import type { SimSpeed } from '@/simulation/models';
import { contextMenuController } from '@/utils/contextMenuController';
import { useFlowStore } from '@/store/useFlowStore';
import { useSimStore } from '@/store/useSimStore';

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
 * Global shortcuts for canvas simulation and selection.
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

      if (e.key === 'Escape') {
        e.preventDefault();
        if (contextMenuController.dismiss) {
          contextMenuController.dismiss();
          return;
        }
        flow.clearSelectedNode();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const id = flow.selectedNodeId;
        if (id) {
          e.preventDefault();
          flow.deleteNode(id);
        }
        return;
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
