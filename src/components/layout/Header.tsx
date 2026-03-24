import {
  BookOpen,
  GraduationCap,
  Github,
  Keyboard,
  Layers,
  LayoutTemplate,
  Map,
  PenTool,
  Trophy,
  Trash2,
  Undo2,
  Redo2,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ExportMenu } from '@/components/ui';
import { useHistory } from '@/hooks/useHistory';

const SHORTCUT_ROWS: { keys: string; description: string }[] = [
  { keys: 'Ctrl+Z', description: 'Undo' },
  { keys: 'Ctrl+Shift+Z', description: 'Redo' },
  { keys: 'Ctrl+Y', description: 'Redo (alternative)' },
  { keys: 'Ctrl+C', description: 'Copy node' },
  { keys: 'Ctrl+V', description: 'Paste node' },
  { keys: 'Delete / Backspace', description: 'Delete selected node or edge' },
  { keys: 'Space', description: 'Play / Pause simulation' },
  { keys: 'R', description: 'Reset simulation' },
  { keys: '1 — 4', description: 'Speed 0.5x / 1x / 2x / 5x' },
  { keys: 'Escape', description: 'Deselect / close panels' },
];

const ghostBtn =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700/80 hover:bg-zinc-800/60 hover:text-zinc-100';

const ghostBtnRed =
  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-red-900/50 hover:bg-red-950/40 hover:text-red-200';

export interface HeaderProps {
  currentView?: 'journey' | 'sandbox';
  onSwitchView?: (view: 'journey' | 'sandbox') => void;
  onOpenCards?: () => void;
  shortcutsOpen: boolean;
  onShortcutsOpenChange: (open: boolean) => void;
  onTemplates: () => void;
  onTutorials: () => void;
  onChallenges: () => void;
  onExportJson: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onImportClick: () => void;
  onResetCanvas: () => void;
  onOpenGlossary: () => void;
  extraActions?: ReactNode;
  interviewModeActive?: boolean;
  githubHref?: string;
}

export function Header({
  currentView = 'sandbox',
  onSwitchView,
  onOpenCards,
  shortcutsOpen,
  onShortcutsOpenChange,
  onTemplates,
  onTutorials,
  onChallenges,
  onExportJson,
  onExportPng,
  onExportSvg,
  onImportClick,
  onResetCanvas,
  onOpenGlossary,
  extraActions,
  interviewModeActive = false,
  githubHref = 'https://github.com/sachindevangan/nodebreaker',
}: HeaderProps) {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const { undo, redo, canUndo, canRedo } = useHistory();

  return (
    <>
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        title="Clear everything?"
        message="This will remove all nodes, connections, and reset the simulation."
        confirmLabel="Clear"
        onConfirm={() => {
          onResetCanvas();
          setResetConfirmOpen(false);
        }}
        onCancel={() => setResetConfirmOpen(false)}
      />
      <header className="flex h-12 shrink-0 items-center gap-4 border-b border-zinc-800 bg-zinc-950 px-3 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
          <Zap className="h-5 w-5 shrink-0 text-cyan-400" strokeWidth={2} aria-hidden />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight text-zinc-100">
              NodeBreaker
            </h1>
          </div>
        </div>

        <nav
          className="hidden items-center justify-center gap-1 md:flex md:flex-1"
          aria-label="Design actions"
        >
          {onSwitchView ? (
            <>
              <button
                type="button"
                className={`${ghostBtn} ${currentView === 'journey' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : ''}`}
                onClick={() => onSwitchView('journey')}
                title="Journey"
              >
                <Map className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span>Journey</span>
              </button>
              <button
                type="button"
                className={`${ghostBtn} ${currentView === 'sandbox' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : ''}`}
                onClick={() => onSwitchView('sandbox')}
                title="Sandbox"
              >
                <PenTool className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span>Sandbox</span>
              </button>
              {onOpenCards ? (
                <button type="button" className={ghostBtn} onClick={onOpenCards} title="Interview cards">
                  <Layers className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span>Cards</span>
                </button>
              ) : null}
              <div className="mx-0.5 h-5 w-px shrink-0 bg-zinc-700/90" aria-hidden />
            </>
          ) : null}
          <button
            type="button"
            className={ghostBtn}
            onClick={undo}
            disabled={!canUndo}
            title="Undo"
            aria-label="Undo"
          >
            <Undo2 className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span className="hidden lg:inline">Undo</span>
          </button>
          <button
            type="button"
            className={ghostBtn}
            onClick={redo}
            disabled={!canRedo}
            title="Redo"
            aria-label="Redo"
          >
            <Redo2 className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span className="hidden lg:inline">Redo</span>
          </button>
          <div className="mx-0.5 h-5 w-px shrink-0 bg-zinc-700/90" aria-hidden />
          <button type="button" className={ghostBtn} onClick={onImportClick} title="Import design">
            <Upload className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>Import</span>
          </button>
          <ExportMenu onExportJson={onExportJson} onExportPng={onExportPng} onExportSvg={onExportSvg} />
          <button
            type="button"
            className={ghostBtnRed}
            onClick={() => setResetConfirmOpen(true)}
            title="Reset canvas"
            aria-label="Reset canvas"
          >
            <Trash2 className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span className="hidden lg:inline">Reset</span>
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
          <button
            type="button"
            className={`${ghostBtn} px-2`}
            onClick={onOpenGlossary}
            title="Learn glossary"
            aria-label="Learn glossary"
          >
            <BookOpen className="h-4 w-4 shrink-0" strokeWidth={2} />
          </button>
          <button type="button" className={ghostBtn} onClick={onTutorials} title="Tutorials" disabled={interviewModeActive}>
            <GraduationCap className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>Tutorials</span>
          </button>
          <button type="button" className={ghostBtn} onClick={onChallenges} title="Challenges" disabled={interviewModeActive}>
            <Trophy className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>Challenges</span>
          </button>
          <button type="button" className={ghostBtn} onClick={onTemplates} title="Templates">
            <LayoutTemplate className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>Templates</span>
          </button>
          {extraActions}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
          <div className="flex items-center gap-0.5 md:hidden">
            <button
              type="button"
              className={`${ghostBtn} px-2`}
              onClick={undo}
              disabled={!canUndo}
              aria-label="Undo"
            >
              <Undo2 className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              className={`${ghostBtn} px-2`}
              onClick={redo}
              disabled={!canRedo}
              aria-label="Redo"
            >
              <Redo2 className="h-4 w-4" strokeWidth={2} />
            </button>
            <button type="button" className={`${ghostBtn} px-2`} onClick={onImportClick} aria-label="Import">
              <Upload className="h-4 w-4" strokeWidth={2} />
            </button>
            <ExportMenu compact onExportJson={onExportJson} onExportPng={onExportPng} onExportSvg={onExportSvg} />
            <button
              type="button"
              className={`${ghostBtnRed} px-2`}
              onClick={() => setResetConfirmOpen(true)}
              aria-label="Reset canvas"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              className={`${ghostBtn} px-2`}
              onClick={() => onShortcutsOpenChange(true)}
              aria-label="Shortcuts"
            >
              <Keyboard className="h-4 w-4" strokeWidth={2} />
            </button>
            <button type="button" className={`${ghostBtn} px-2`} onClick={onOpenGlossary} aria-label="Learn">
              <BookOpen className="h-4 w-4" strokeWidth={2} />
            </button>
            <button type="button" className={`${ghostBtn} px-2`} onClick={onTutorials} aria-label="Tutorials" disabled={interviewModeActive}>
              <GraduationCap className="h-4 w-4" strokeWidth={2} />
            </button>
            <button type="button" className={`${ghostBtn} px-2`} onClick={onChallenges} aria-label="Challenges" disabled={interviewModeActive}>
              <Trophy className="h-4 w-4" strokeWidth={2} />
            </button>
            <button type="button" className={`${ghostBtn} px-2`} onClick={onTemplates} aria-label="Templates">
              <LayoutTemplate className="h-4 w-4" strokeWidth={2} />
            </button>
          {onSwitchView ? (
            <>
              <button
                type="button"
                className={`${ghostBtn} px-2 ${currentView === 'journey' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : ''}`}
                onClick={() => onSwitchView('journey')}
                aria-label="Journey"
              >
                <Map className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                className={`${ghostBtn} px-2 ${currentView === 'sandbox' ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : ''}`}
                onClick={() => onSwitchView('sandbox')}
                aria-label="Sandbox"
              >
                <PenTool className="h-4 w-4" strokeWidth={2} />
              </button>
              {onOpenCards ? (
                <button type="button" className={`${ghostBtn} px-2`} onClick={onOpenCards} aria-label="Cards">
                  <Layers className="h-4 w-4" strokeWidth={2} />
                </button>
              ) : null}
            </>
          ) : null}
          {extraActions}
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
    </>
  );
}
