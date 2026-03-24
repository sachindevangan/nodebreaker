import { Box, FileUp, LayoutTemplate, Zap } from 'lucide-react';
import { useAppChrome } from '@/context/AppChromeContext';
import { useFlowStore } from '@/store/useFlowStore';

export function EmptyState() {
  const nodes = useFlowStore((s) => s.nodes);
  const chrome = useAppChrome();

  if (nodes.length > 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="pointer-events-auto mx-4 max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 px-8 py-10 text-center shadow-2xl backdrop-blur-md">
        <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-950/40">
          <Zap className="h-9 w-9 text-cyan-400" strokeWidth={1.5} />
          <span
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 30%, rgb(34 211 238 / 0.15), transparent 55%)',
              animation: 'nb-empty-pulse 4s ease-in-out infinite',
            }}
          />
        </div>
        <style>{`@keyframes nb-empty-pulse { 0%,100% { opacity: 0.35; } 50% { opacity: 0.6; } }`}</style>
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">Start designing your system</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Build a flow, simulate traffic, then stress it with chaos — all in the browser.
        </p>
        <ul className="mt-6 space-y-3 text-left">
          <li className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
            <Box className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-secondary)]" strokeWidth={2} />
            <span className="text-xs text-[var(--text-secondary)]">Drag components from the sidebar onto the canvas.</span>
          </li>
          <li>
            <button
              type="button"
              onClick={() => chrome?.openTemplates()}
              className="flex w-full gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-left transition-colors hover:border-cyan-700/50 hover:bg-[var(--surface-hover)]"
            >
              <LayoutTemplate className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500/90" strokeWidth={2} />
              <span className="text-xs text-[var(--text)]">Load a template</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => chrome?.requestImport()}
              className="flex w-full gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-left transition-colors hover:border-cyan-700/50 hover:bg-[var(--surface-hover)]"
            >
              <FileUp className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500/90" strokeWidth={2} />
              <span className="text-xs text-[var(--text)]">Import a design</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
