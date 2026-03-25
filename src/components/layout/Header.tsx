import {
  Github,
  Keyboard,
  LayoutTemplate,
  Lightbulb,
  Moon,
  MoreHorizontal,
  Share2,
  Sun,
  X,
  Zap,
  Code2,
} from 'lucide-react';
import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { ExportMenu } from '@/components/ui';
import { useThemeStore } from '@/store/useThemeStore';

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
  { keys: 'P (Interview mode)', description: 'Pause / Resume interview timer' },
  { keys: 'M (Interview mode)', description: 'Minimize / restore interview timer' },
  { keys: 'Escape (Interview mode)', description: 'Prompt to end interview early' },
];

const actionBtn =
  'flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors';
const actionIcon = 'h-3.5 w-3.5 shrink-0';

function mergeActionBtnClass(node: ReactNode, extraClassName?: string): ReactNode {
  if (!isValidElement(node)) return node;
  const el = node as ReactElement<{ className?: string }>;
  const prev = el.props.className;
  return cloneElement(el, {
    className: [actionBtn, extraClassName, typeof prev === 'string' ? prev : ''].filter(Boolean).join(' ').trim(),
  });
}

export interface HeaderProps {
  currentView?: 'academy' | 'codelab' | 'sandbox';
  onSwitchView?: (view: 'academy' | 'codelab' | 'sandbox') => void;
  onOpenTips?: () => void;
  onBackToAcademy?: () => void;
  hideCanvasTools?: boolean;
  shortcutsOpen: boolean;
  onShortcutsOpenChange: (open: boolean) => void;
  onTemplates: () => void;
  onTutorials: () => void;
  onChallenges: () => void;
  onExportJson: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onShare: () => void;
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
  onOpenTips,
  hideCanvasTools = false,
  shortcutsOpen,
  onShortcutsOpenChange,
  onTemplates,
  onExportJson,
  onExportPng,
  onExportSvg,
  onShare,
  extraActions,
  githubHref = 'https://github.com/sachindevangan/nodebreaker',
}: HeaderProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [compactActions, setCompactActions] = useState(() => window.innerWidth < 1400);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const showTools = !hideCanvasTools;
  const extraActionItems = useMemo(() => Children.toArray(extraActions), [extraActions]);
  const interviewAction = extraActionItems.length > 0 ? extraActionItems[extraActionItems.length - 1] : null;
  const scoreAndCostActions = extraActionItems.slice(0, Math.max(0, extraActionItems.length - 1));

  useEffect(() => {
    const onResize = () => setCompactActions(window.innerWidth < 1400);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!moreRef.current) return;
      if (e.target instanceof Node && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    window.addEventListener('mousedown', onMouseDown);
    return () => window.removeEventListener('mousedown', onMouseDown);
  }, [moreOpen]);

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[var(--header-bg)] px-3 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Zap className="h-5 w-5 shrink-0 text-cyan-400" strokeWidth={2} aria-hidden />
          <h1 className="truncate text-base font-bold tracking-tight text-[var(--text)]">NodeBreaker</h1>
        </div>

        <nav className="hidden min-w-0 flex-none items-center justify-center md:flex" aria-label="Main">
          {onSwitchView ? (
            <div className="inline-flex items-center rounded-full border border-gray-700 bg-gray-800 p-0.5">
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  currentView === 'academy'
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => onSwitchView('academy')}
                title="Academy"
              >
                <span>Academy</span>
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  currentView === 'codelab'
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => onSwitchView('codelab')}
                title="Code Lab"
              >
                <span className="inline-flex items-center gap-1">
                  <Code2 className="h-4 w-4" strokeWidth={2} aria-hidden />
                  <span>Code Lab</span>
                </span>
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  currentView === 'sandbox'
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => onSwitchView('sandbox')}
                title="Sandbox"
              >
                <span>Sandbox</span>
              </button>
            </div>
          ) : null}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          {showTools ? (
            <>
              <div className="flex items-center gap-1">
                <button type="button" className={actionBtn} onClick={onTemplates} title="Templates" aria-label="Templates">
                  <LayoutTemplate className={actionIcon} strokeWidth={2} />
                  <span>Templates</span>
                </button>
                <ExportMenu onExportJson={onExportJson} onExportPng={onExportPng} onExportSvg={onExportSvg} />
                {!compactActions ? (
                  <button type="button" className={actionBtn} onClick={onShare} title="Share" aria-label="Share">
                    <Share2 className={actionIcon} strokeWidth={2} />
                    <span>Share</span>
                  </button>
                ) : null}
              </div>

              {!compactActions ? <div className="mx-1 h-4 w-px shrink-0 bg-gray-700" aria-hidden /> : null}

              {!compactActions ? (
                <div className="flex items-center gap-1" aria-label="Score and cost group">
                  {scoreAndCostActions.map((child, i) => (
                    <Fragment key={i}>{mergeActionBtnClass(child)}</Fragment>
                  ))}
                </div>
              ) : null}

              {!compactActions ? <div className="mx-1 h-4 w-px shrink-0 bg-gray-700" aria-hidden /> : null}

              <div className="flex items-center gap-1" aria-label="Interview and tips group">
                {mergeActionBtnClass(interviewAction)}
                {onOpenTips ? (
                  <button type="button" className={actionBtn} onClick={onOpenTips} title="Tips" aria-label="Tips">
                    <Lightbulb className={actionIcon} strokeWidth={2} />
                    <span>Tips</span>
                  </button>
                ) : null}
              </div>

              {!compactActions ? <div className="mx-1 h-4 w-px shrink-0 bg-gray-700" aria-hidden /> : null}

              <div className="flex items-center gap-1">
                {!compactActions ? (
                  <button
                    type="button"
                    className={actionBtn}
                    onClick={() => onShortcutsOpenChange(true)}
                    title="Shortcuts"
                    aria-label="Shortcuts"
                  >
                    <Keyboard className={actionIcon} strokeWidth={2} />
                    <span>Shortcuts</span>
                  </button>
                ) : null}
                <button type="button" className={actionBtn} onClick={toggleTheme} title="Theme" aria-label="Theme">
                  {theme === 'dark' ? <Sun className={actionIcon} strokeWidth={2} /> : <Moon className={actionIcon} strokeWidth={2} />}
                  <span>Theme</span>
                </button>
                {!compactActions ? (
                  <a
                    href={githubHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={actionBtn}
                    title="GitHub"
                    aria-label="GitHub"
                  >
                    <Github className={actionIcon} strokeWidth={2} />
                    <span>GitHub</span>
                  </a>
                ) : null}
              </div>

              {compactActions ? (
                <div className="relative" ref={moreRef}>
                  <button
                    type="button"
                    className={actionBtn}
                    onClick={() => setMoreOpen((v) => !v)}
                    title="More"
                    aria-label="More"
                  >
                    <MoreHorizontal className={actionIcon} strokeWidth={2} />
                    <span>More</span>
                  </button>
                  {moreOpen ? (
                    <div className="absolute right-0 top-9 z-[120] min-w-48 rounded-md border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                        onClick={() => {
                          onShare();
                          setMoreOpen(false);
                        }}
                        title="Share"
                      >
                        <Share2 className={actionIcon} strokeWidth={2} />
                        <span>Share</span>
                      </button>
                      <div className="flex flex-col gap-0.5">
                        {scoreAndCostActions.map((child, i) => (
                          <Fragment key={i}>{mergeActionBtnClass(child, 'w-full justify-start gap-2')}</Fragment>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                        onClick={() => {
                          onShortcutsOpenChange(true);
                          setMoreOpen(false);
                        }}
                        title="Shortcuts"
                      >
                        <Keyboard className={actionIcon} strokeWidth={2} />
                        <span>Shortcuts</span>
                      </button>
                      <a
                        href={githubHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                        onClick={() => setMoreOpen(false)}
                        title="GitHub"
                      >
                        <Github className={actionIcon} strokeWidth={2} />
                        <span>GitHub</span>
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
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
              className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 id="nb-shortcuts-title" className="text-base font-semibold text-[var(--text)]">
                  Keyboard shortcuts
                </h2>
                <button
                  type="button"
                  onClick={() => onShortcutsOpenChange(false)}
                  className="rounded-md p-1 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              <ul className="mt-4 space-y-3">
                {SHORTCUT_ROWS.map((row) => (
                  <li key={row.keys} className="flex gap-3 text-sm">
                    <kbd className="shrink-0 rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 font-mono text-[11px] text-cyan-200">
                      {row.keys}
                    </kbd>
                    <span className="text-[var(--text-secondary)]">{row.description}</span>
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
