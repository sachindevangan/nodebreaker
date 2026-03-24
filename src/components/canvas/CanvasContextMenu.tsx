import { ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { useAppChrome } from '@/context/AppChromeContext';
import type { ChaosEventType } from '@/simulation/chaos';
import { useChaosStore } from '@/store/useChaosStore';
import { useFlowStore } from '@/store/useFlowStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useSimStore } from '@/store/useSimStore';
import { contextMenuController } from '@/utils/contextMenuController';
import { getClipboardBlueprint } from '@/utils/nodeClipboard';

export type CanvasContextMenuState =
  | { kind: 'closed' }
  | { kind: 'node'; clientX: number; clientY: number; nodeId: string }
  | { kind: 'edge'; clientX: number; clientY: number; edgeId: string }
  | { kind: 'pane'; clientX: number; clientY: number; flowX: number; flowY: number };

export interface CanvasContextMenuProps {
  menu: CanvasContextMenuState;
  onClose: () => void;
  onFitView: () => void;
}

export function CanvasContextMenu({ menu, onClose, onFitView }: CanvasContextMenuProps) {
  const chrome = useAppChrome();
  const simulationSessionActive = useSimStore((s) => s.simulationSessionActive);
  const tickCount = useSimStore((s) => s.tickCount);
  const selectNodeOnCanvas = useFlowStore((s) => s.selectNodeOnCanvas);
  const duplicateNode = useFlowStore((s) => s.duplicateNode);
  const deleteNode = useFlowStore((s) => s.deleteNode);
  const deleteEdge = useFlowStore((s) => s.deleteEdge);
  const pasteNodeAt = useFlowStore((s) => s.pasteNodeAt);
  const injectChaos = useChaosStore((s) => s.injectChaos);

  const [chaosOpen, setChaosOpen] = useState(false);

  useEffect(() => {
    setChaosOpen(false);
  }, [menu]);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (menu.kind === 'closed') {
      contextMenuController.dismiss = null;
      return;
    }
    contextMenuController.dismiss = close;
    return () => {
      if (contextMenuController.dismiss === close) {
        contextMenuController.dismiss = null;
      }
    };
  }, [close, menu.kind]);

  useEffect(() => {
    if (menu.kind === 'closed') return;
    const onDown = (e: MouseEvent) => {
      const el = e.target;
      if (el instanceof Element && el.closest('[data-nb-context-menu]')) return;
      onClose();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menu.kind, onClose]);

  const inject = useCallback(
    (type: ChaosEventType, nodeId: string) => {
      injectChaos(type, nodeId, { startTick: tickCount });
      onClose();
    },
    [injectChaos, onClose, tickCount]
  );

  if (menu.kind === 'closed') return null;

  const canPaste = getClipboardBlueprint() !== null;

  const style: CSSProperties = {
    position: 'fixed',
    left: menu.clientX,
    top: menu.clientY,
    zIndex: 120,
  };

  const btn =
    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-zinc-200 transition-colors hover:bg-zinc-800';

  if (menu.kind === 'node') {
    const { nodeId } = menu;
    return (
      <div
        data-nb-context-menu
        className="min-w-[200px] rounded-lg border border-zinc-700 bg-zinc-950/98 py-1 shadow-2xl backdrop-blur-md"
        style={style}
        role="menu"
      >
        <button
          type="button"
          role="menuitem"
          className={btn}
          onClick={() => {
            selectNodeOnCanvas(nodeId);
            onClose();
          }}
        >
          Edit properties
        </button>
        <button
          type="button"
          role="menuitem"
          className={btn}
          onClick={() => {
            const { nodes, edges } = useFlowStore.getState();
            useHistoryStore.getState().recordSnapshot(nodes, edges);
            duplicateNode(nodeId);
            onClose();
          }}
        >
          Duplicate node
        </button>
        {simulationSessionActive ? (
          <div className="relative border-t border-zinc-800/80 pt-1">
            <button
              type="button"
              className={`${btn} justify-between`}
              onClick={() => setChaosOpen((o) => !o)}
              aria-expanded={chaosOpen}
            >
              <span>Inject chaos</span>
              <ChevronRight
                className={`h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform ${chaosOpen ? 'rotate-90' : ''}`}
                strokeWidth={2}
              />
            </button>
            {chaosOpen ? (
              <div className="border-t border-zinc-800/60 bg-zinc-900/50 py-1 pl-2">
                <button
                  type="button"
                  className={btn}
                  onClick={() => inject('node_crash', nodeId)}
                >
                  Node crash
                </button>
                <button
                  type="button"
                  className={btn}
                  onClick={() => inject('latency_spike', nodeId)}
                >
                  Latency spike
                </button>
                <button
                  type="button"
                  className={btn}
                  onClick={() => inject('capacity_drop', nodeId)}
                >
                  Capacity drop
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="my-1 h-px bg-zinc-800" role="separator" />
        <button
          type="button"
          role="menuitem"
          className={`${btn} text-red-400 hover:bg-red-950/40 hover:text-red-300`}
          onClick={() => {
            const { nodes, edges } = useFlowStore.getState();
            useHistoryStore.getState().recordSnapshot(nodes, edges);
            deleteNode(nodeId);
            onClose();
          }}
        >
          Delete node
        </button>
      </div>
    );
  }

  if (menu.kind === 'edge') {
    const { edgeId } = menu;
    return (
      <div
        data-nb-context-menu
        className="min-w-[180px] rounded-lg border border-zinc-700 bg-zinc-950/98 py-1 shadow-2xl backdrop-blur-md"
        style={style}
        role="menu"
      >
        <button
          type="button"
          role="menuitem"
          className={`${btn} text-red-400 hover:bg-red-950/40 hover:text-red-300`}
          onClick={() => {
            const { nodes, edges } = useFlowStore.getState();
            useHistoryStore.getState().recordSnapshot(nodes, edges);
            deleteEdge(edgeId);
            onClose();
          }}
        >
          Delete connection
        </button>
      </div>
    );
  }

  return (
    <div
      data-nb-context-menu
      className="min-w-[180px] rounded-lg border border-zinc-700 bg-zinc-950/98 py-1 shadow-2xl backdrop-blur-md"
      style={style}
      role="menu"
    >
      <button
        type="button"
        role="menuitem"
        className={btn}
        disabled={!canPaste}
        onClick={() => {
          const { nodes, edges } = useFlowStore.getState();
          useHistoryStore.getState().recordSnapshot(nodes, edges);
          if (pasteNodeAt(menu.flowX, menu.flowY)) onClose();
        }}
      >
        Paste node
      </button>
      <button
        type="button"
        role="menuitem"
        className={btn}
        onClick={() => {
          onFitView();
          onClose();
        }}
      >
        Fit view
      </button>
      <button
        type="button"
        role="menuitem"
        className={btn}
        onClick={() => {
          chrome?.openTemplates();
          onClose();
        }}
      >
        Load template
      </button>
      <button
        type="button"
        role="menuitem"
        className={btn}
        onClick={() => {
          chrome?.openShare();
          onClose();
        }}
      >
        Share design
      </button>
    </div>
  );
}
