import { X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ARCHITECTURE_TEMPLATES, type ArchitectureTemplate } from '@/constants/templates';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useChaosStore } from '@/store/useChaosStore';
import { useFlowStore } from '@/store/useFlowStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useSimStore } from '@/store/useSimStore';

export interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onReopen?: () => void;
}

export function TemplateSelector({ isOpen, onClose, onReopen }: TemplateSelectorProps) {
  const nodes = useFlowStore((s) => s.nodes);
  const replaceGraph = useFlowStore((s) => s.replaceGraph);
  const [pending, setPending] = useState<ArchitectureTemplate | null>(null);

  const applyTemplate = useCallback(
    (t: ArchitectureTemplate) => {
      const { nodes: nextNodes, edges: nextEdges } = t.build();
      useChaosStore.getState().clearAllChaos();
      useSimStore.getState().stopSession();
      useHistoryStore.getState().clear();
      replaceGraph(nextNodes, nextEdges);
      setPending(null);
      onClose();
    },
    [onClose, replaceGraph]
  );

  const onPickTemplate = useCallback(
    (t: ArchitectureTemplate) => {
      if (nodes.length > 0) {
        onClose();
        setPending(t);
        return;
      }
      applyTemplate(t);
    },
    [applyTemplate, nodes.length, onClose]
  );

  const confirmReplace = useCallback(() => {
    if (pending) {
      applyTemplate(pending);
    }
  }, [applyTemplate, pending]);

  const cancelReplace = useCallback(() => {
    setPending(null);
    onReopen?.();
  }, [onReopen]);

  return (
    <>
      <ConfirmDialog
        isOpen={pending !== null}
        title="Replace design?"
        message="This will replace your current design. Continue?"
        confirmLabel="Continue"
        onConfirm={confirmReplace}
        onCancel={cancelReplace}
      />
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nb-templates-title"
            onClick={() => onClose()}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                <h2 id="nb-templates-title" className="text-lg font-semibold text-zinc-100">
                  Architecture templates
                </h2>
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
              <div className="max-h-[calc(90vh-5rem)] overflow-y-auto p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {ARCHITECTURE_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onPickTemplate(t)}
                      className="flex flex-col rounded-lg border border-zinc-700/90 bg-zinc-950/80 p-4 text-left transition-colors hover:border-cyan-600/40 hover:bg-zinc-900/90"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-zinc-100">{t.name}</span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            t.difficulty === 'Easy'
                              ? 'bg-emerald-950/80 text-emerald-300'
                              : t.difficulty === 'Medium'
                                ? 'bg-amber-950/80 text-amber-200'
                                : 'bg-red-950/80 text-red-200'
                          }`}
                        >
                          {t.difficulty}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-zinc-500">{t.description}</p>
                      <p className="mt-3 font-mono text-[10px] text-zinc-600">{t.previewHint}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
