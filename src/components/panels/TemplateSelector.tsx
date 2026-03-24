import { X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
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
  const [activeCategory, setActiveCategory] = useState<ArchitectureTemplate['category'] | 'All'>('All');
  const [query, setQuery] = useState('');
  const categories = useMemo(
    () =>
      [
        'All',
        'Social Media',
        'Real-time',
        'E-commerce',
        'Fintech',
        'Media',
        'Infrastructure',
        'Developer Tools',
        'Search',
        'Logistics',
      ] as const,
    []
  );
  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARCHITECTURE_TEMPLATES.filter((tt) => {
      const categoryMatch = activeCategory === 'All' || tt.category === activeCategory;
      const queryMatch =
        q.length === 0 ||
        tt.title.toLowerCase().includes(q) ||
        tt.description.toLowerCase().includes(q) ||
        tt.category.toLowerCase().includes(q);
      return categoryMatch && queryMatch;
    });
  }, [activeCategory, query]);

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
            transition={{ duration: 0.15 }}
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
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                <h2 id="nb-templates-title" className="text-lg font-semibold text-[var(--text)]">
                  Architecture templates
                </h2>
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="rounded-md p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
              <div className="max-h-[calc(92vh-5rem)] overflow-y-auto p-5">
                <div className="mb-4 flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        activeCategory === cat
                          ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300'
                          : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="mb-4">
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredTemplates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onPickTemplate(t)}
                      className="flex flex-col rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-left transition-colors hover:border-cyan-600/40 hover:bg-[var(--surface-hover)]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-[var(--text)]">{t.title}</span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            t.difficulty === 'easy'
                              ? 'bg-emerald-950/80 text-emerald-300'
                              : t.difficulty === 'intermediate'
                                ? 'bg-amber-950/80 text-amber-200'
                                : 'bg-red-950/80 text-red-200'
                          }`}
                        >
                          {t.difficulty}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">{t.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
                          {t.category}
                        </span>
                        <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                          {t.nodeCount} components
                        </span>
                        <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                          {t.edgeCount} connections
                        </span>
                      </div>
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
