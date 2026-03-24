import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Cpu,
  HardDrive,
  LayoutGrid,
  Lock,
  Radio,
  Router,
  Search,
} from 'lucide-react';
import {
  COMPONENT_TYPE_CONFIGS,
  PALETTE_CATEGORY_ORDER,
  type ComponentTypeConfig,
} from '@/constants/components';
import { NODEBREAKER_DRAG_MIME } from '@/hooks/useDragToCanvas';
import { getNodeIcon } from '@/components/canvas/nodes/nodeIcons';
import { InfoTooltip } from '@/components/ui';
import { useSimStore } from '@/store/useSimStore';
import { useTutorialStore } from '@/store/useTutorialStore';
import { getComponentKnowledge } from '@/constants/knowledge';
import { hexToRgba } from '@/utils/math';
import { ChaosPalette } from './ChaosPalette';

type PaletteTab = 'components' | 'chaos';

const CATEGORY_ICONS: Record<(typeof PALETTE_CATEGORY_ORDER)[number], LucideIcon> = {
  'Traffic & Edge': Radio,
  Network: Router,
  Compute: Cpu,
  Data: HardDrive,
  Messaging: Radio,
  Security: Lock,
  Monitoring: BarChart3,
};

function PaletteCard({
  config,
  highlighted,
  dimmed,
}: {
  config: ComponentTypeConfig;
  highlighted: boolean;
  dimmed: boolean;
}) {
  const Icon = getNodeIcon(config.icon);
  const knowledge = getComponentKnowledge(config.type);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        // #region agent log
        fetch('http://127.0.0.1:7699/ingest/1f64e223-b5c9-4f0c-bf28-285d4e212d98',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0b8e06'},body:JSON.stringify({sessionId:'0b8e06',runId:'pre-fix',hypothesisId:'H4',location:'ComponentPalette.tsx:onDragStart',message:'Palette card drag start',data:{type:config.type,label:config.label},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        e.dataTransfer.setData(NODEBREAKER_DRAG_MIME, config.type);
        e.dataTransfer.effectAllowed = 'move';
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      className="group relative cursor-grab select-none rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-center transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-zinc-500 active:cursor-grabbing"
      style={
        {
          ['--nb-palette-glow' as string]: hexToRgba(config.color, 0.42),
          opacity: dimmed ? 0.6 : 1,
          transform: dragging ? 'scale(0.95)' : undefined,
        } as CSSProperties
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 0 18px var(--nb-palette-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {highlighted ? (
        <>
          <span className="pointer-events-none absolute inset-0 animate-pulse rounded-lg border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.45)]" />
          <span className="pointer-events-none absolute -left-1 top-1 rounded bg-cyan-500/90 px-1.5 py-0.5 text-[9px] font-semibold text-cyan-950">
            ← Drag this
          </span>
        </>
      ) : null}
      <div className="flex justify-center">
        <Icon className="h-7 w-7" style={{ color: config.color }} strokeWidth={1.75} />
      </div>
      <p className="mt-2 inline-flex items-center justify-center text-[11px] font-medium leading-tight text-[var(--text)]">
        {config.label}
        <InfoTooltip title={config.label} description={knowledge.summary} side="right" />
      </p>
    </div>
  );
}

export function ComponentPalette() {
  const [tab, setTab] = useState<PaletteTab>('components');
  const [query, setQuery] = useState('');
  const simulationSessionActive = useSimStore((s) => s.simulationSessionActive);
  const isPlaying = useSimStore((s) => s.isPlaying);
  const speed = useSimStore((s) => s.speed);
  const startSession = useSimStore((s) => s.startSession);
  const stopSession = useSimStore((s) => s.stopSession);
  const activeTutorial = useTutorialStore((s) => s.activeTutorial);
  const currentStepIndex = useTutorialStore((s) => s.currentStepIndex);
  const highlightedComponent = activeTutorial?.steps[currentStepIndex]?.highlightComponent;

  const filteredByCategory = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? COMPONENT_TYPE_CONFIGS.filter(
          (c) =>
            c.label.toLowerCase().includes(q) ||
            c.type.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q)
        )
      : [...COMPONENT_TYPE_CONFIGS];

    const map = new Map<string, ComponentTypeConfig[]>();
    for (const c of filtered) {
      const list = map.get(c.category) ?? [];
      list.push(c);
      map.set(c.category, list);
    }

    return PALETTE_CATEGORY_ORDER.filter((name) => {
      const items = map.get(name);
      return items && items.length > 0;
    }).map((name) => ({
      name,
      items: map.get(name) ?? [],
    }));
  }, [query]);

  return (
    <div className="flex h-full min-h-0 w-full shrink-0 flex-col border-r border-[var(--border)] bg-[var(--panel-bg)]">
      <div className="shrink-0 border-b border-[var(--border)] px-3 pb-3 pt-3">
        <div className="flex items-center gap-2 text-[var(--text)]">
          <LayoutGrid className="h-4 w-4 text-[var(--text-secondary)]" strokeWidth={2} />
          <h2 className="text-sm font-semibold tracking-tight">Components</h2>
        </div>

        <div className="mt-3 flex gap-1 rounded-lg bg-[var(--surface)] p-0.5">
          <button
            type="button"
            onClick={() => setTab('components')}
            className={`relative flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              tab === 'components'
                ? 'border border-cyan-500/40 bg-[var(--surface-hover)] text-[var(--text)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            {tab === 'components' ? (
              <motion.span
                layoutId="palette-tab-active"
                className="absolute inset-0 -z-10 rounded-md border border-cyan-500/40 bg-[var(--surface-hover)]"
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            ) : null}
            Components
          </button>
          <button
            type="button"
            onClick={() => setTab('chaos')}
            className={`relative flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              tab === 'chaos'
                ? 'border border-cyan-500/40 bg-[var(--surface-hover)] text-[var(--text)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            {tab === 'chaos' ? (
              <motion.span
                layoutId="palette-tab-active"
                className="absolute inset-0 -z-10 rounded-md border border-cyan-500/40 bg-[var(--surface-hover)]"
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            ) : null}
            Chaos Items
          </button>
        </div>

        {tab === 'components' && (
          <div className="relative mt-3">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-secondary)]"
              strokeWidth={2}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search components"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-8 pr-2 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              aria-label="Search components"
            />
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <AnimatePresence mode="wait">
          {tab === 'chaos' ? (
            <motion.div key="chaos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChaosPalette />
            </motion.div>
          ) : filteredByCategory.length === 0 ? (
            <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-1 py-8 text-center text-xs text-[var(--text-secondary)]">No components match your search.</motion.p>
          ) : (
            <motion.div key="components" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex flex-col gap-6">
            {filteredByCategory.map((section) => {
              const CatIcon = CATEGORY_ICONS[section.name as keyof typeof CATEGORY_ICONS];
              return (
                <section key={section.name}>
                  <div className="mb-2 flex items-center gap-2 text-[var(--text-secondary)]">
                    {CatIcon ? <CatIcon className="h-3.5 w-3.5" strokeWidth={2} /> : null}
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider">
                      {section.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {section.items.map((config) => (
                      <PaletteCard
                        key={config.type}
                        config={config}
                        highlighted={highlightedComponent === config.type}
                        dimmed={Boolean(highlightedComponent && highlightedComponent !== config.type)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="shrink-0 border-t border-[var(--border)] p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (simulationSessionActive ? stopSession() : startSession())}
            className={`relative min-w-0 flex-1 rounded-full py-3 text-xs font-bold uppercase tracking-wide text-white shadow-lg transition-colors ${
              simulationSessionActive
                ? 'bg-red-600 shadow-red-950/30 hover:bg-red-500'
                : 'bg-blue-600 shadow-blue-900/20 hover:bg-blue-500'
            }`}
          >
            {simulationSessionActive && isPlaying ? (
              <span
                className="absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 animate-pulse rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                aria-hidden
              />
            ) : null}
            <span className={simulationSessionActive && isPlaying ? 'pl-4' : ''}>
              {simulationSessionActive ? 'STOP SIMULATION' : 'START SIMULATION'}
            </span>
          </button>
          <span
            className="shrink-0 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[10px] font-semibold tabular-nums text-[var(--text-secondary)]"
            title="Simulation speed"
          >
            {speed}x
          </span>
        </div>
      </div>
    </div>
  );
}
