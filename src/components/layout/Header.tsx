import {
  Download,
  Github,
  Keyboard,
  LayoutTemplate,
  Upload,
  X,
  Zap,
} from 'lucide-react';

const SHORTCUT_ROWS: { keys: string; description: string }[] = [
  { keys: 'Space', description: 'Play / pause simulation (while a session is active)' },
  { keys: 'R', description: 'Reset simulation (clears metrics; session stays open)' },
  { keys: '1 — 4', description: 'Set speed to 0.5x, 1x, 2x, or 5x' },
  { keys: 'Escape', description: 'Deselect node and close the properties panel' },
  { keys: 'Delete / Backspace', description: 'Delete the selected node' },
];

const ghostBtn =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700/80 hover:bg-zinc-800/60 hover:text-zinc-100';

export interface HeaderProps {
  shortcutsOpen: boolean;
  onShortcutsOpenChange: (open: boolean) => void;
  onTemplates: () => void;
  onExport: () => void;
  onImportClick: () => void;
  githubHref?: string;
}

export function Header({
  shortcutsOpen,
  onShortcutsOpenChange,
  onTemplates,
  onExport,
  onImportClick,
  githubHref = 'https://github.com/sachindevangan/nodebreaker',
}: HeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-zinc-800 bg-zinc-950 px-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
        <Zap className="h-5 w-5 shrink-0 text-cyan-400" strokeWidth={2} aria-hidden />
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold tracking-tight text-zinc-100">NodeBreaker</h1>
        </div>
      </div>

      <nav
        className="hidden items-center justify-center gap-1 md:flex md:flex-1"
        aria-label="Design actions"
      >
        <button type="button" className={ghostBtn} onClick={onTemplates} title="Templates">
          <LayoutTemplate className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span>Templates</span>
        </button>
        <button type="button" className={ghostBtn} onClick={onImportClick} title="Import design">
          <Upload className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span>Import</span>
        </button>
        <button type="button" className={ghostBtn} onClick={onExport} title="Export design">
          <Download className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span>Export</span>
        </button>
        <div className="mx-1 h-5 w-px shrink-0 bg-zinc-700/90" aria-hidden />
        <button
          type="button"
          className={ghostBtn}
          onClick={() => onShortcutsOpenChange(true)}
          title="Keyboard shortcuts"
        >
          <Keyboard className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span>Shortcuts</span>
        </button>
      </nav>

      <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
        <div className="flex items-center gap-0.5 md:hidden">
          <button type="button" className={`${ghostBtn} px-2`} onClick={onTemplates} aria-label="Templates">
            <LayoutTemplate className="h-4 w-4" strokeWidth={2} />
          </button>
          <button type="button" className={`${ghostBtn} px-2`} onClick={onImportClick} aria-label="Import">
            <Upload className="h-4 w-4" strokeWidth={2} />
          </button>
          <button type="button" className={`${ghostBtn} px-2`} onClick={onExport} aria-label="Export">
            <Download className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            className={`${ghostBtn} px-2`}
            onClick={() => onShortcutsOpenChange(true)}
            aria-label="Shortcuts"
          >
            <Keyboard className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <a
          href={githubHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${ghostBtn} border-zinc-800/80 px-2 sm:px-2.5`}
          title="View on GitHub"
          aria-label="GitHub repository"
        >
          <Github className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span className="hidden lg:inline">GitHub</span>
        </a>
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
