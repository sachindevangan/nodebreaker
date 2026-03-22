import { X } from 'lucide-react';

const SHORTCUT_ROWS: { keys: string; description: string }[] = [
  { keys: 'Space', description: 'Play / pause simulation (while a session is active)' },
  { keys: 'R', description: 'Reset simulation (clears metrics; session stays open)' },
  { keys: '1 — 4', description: 'Set speed to 0.5x, 1x, 2x, or 5x' },
  { keys: 'Escape', description: 'Deselect node and close the properties panel' },
  { keys: 'Delete / Backspace', description: 'Delete the selected node' },
];

export interface HeaderProps {
  shortcutsOpen: boolean;
  onShortcutsOpenChange: (open: boolean) => void;
}

export function Header({ shortcutsOpen, onShortcutsOpenChange }: HeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center border-b border-border px-4 bg-surface-elevated">
      <h1 className="text-sm font-semibold tracking-tight text-zinc-100">NodeBreaker</h1>
      <span className="ml-3 hidden text-xs text-zinc-500 sm:inline">
        Design canvas · drag from the palette to place nodes
      </span>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => onShortcutsOpenChange(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700/80 bg-zinc-900/80 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
          title="Keyboard shortcuts"
          aria-label="Keyboard shortcuts"
        >
          ?
        </button>
      </div>

      {shortcutsOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nb-shortcuts-title"
          onClick={() => onShortcutsOpenChange(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="nb-shortcuts-title" className="text-base font-semibold text-zinc-100">
                Keyboard shortcuts
              </h2>
              <button
                type="button"
                onClick={() => onShortcutsOpenChange(false)}
                className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <ul className="mt-4 space-y-3">
              {SHORTCUT_ROWS.map((row) => (
                <li key={row.keys} className="flex gap-3 text-sm">
                  <kbd className="shrink-0 rounded border border-zinc-600 bg-zinc-950 px-2 py-0.5 font-mono text-[11px] text-cyan-200">
                    {row.keys}
                  </kbd>
                  <span className="text-zinc-400">{row.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </header>
  );
}
