import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Cpu, HardDrive, LayoutGrid, Radio, Search, Sparkles } from 'lucide-react';
import {
  COMPONENT_TYPE_CONFIGS,
  PALETTE_CATEGORY_ORDER,
  type ComponentTypeConfig,
} from '@/constants/components';
import { NODEBREAKER_DRAG_MIME } from '@/hooks/useDragToCanvas';
import { getNodeIcon } from '@/components/canvas/nodes/nodeIcons';
import { useSimStore } from '@/store/useSimStore';
import { hexToRgba } from '@/utils/math';

type PaletteTab = 'components' | 'chaos';

const CATEGORY_ICONS: Record<(typeof PALETTE_CATEGORY_ORDER)[number], LucideIcon> = {
  'Traffic & Edge': Radio,
  Compute: Cpu,
  Data: HardDrive,
};

function PaletteCard({ config }: { config: ComponentTypeConfig }) {
  const Icon = getNodeIcon(config.icon);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(NODEBREAKER_DRAG_MIME, config.type);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className="group cursor-grab select-none rounded-lg border border-zinc-700/70 bg-zinc-900/85 p-3 text-center transition-[border-color,box-shadow] duration-200 hover:border-zinc-500 active:cursor-grabbing"
      style={
        {
          ['--nb-palette-glow' as string]: hexToRgba(config.color, 0.42),
        } as CSSProperties
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 0 18px var(--nb-palette-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className="flex justify-center">
        <Icon className="h-7 w-7" style={{ color: config.color }} strokeWidth={1.75} />
      </div>
      <p className="mt-2 text-[11px] font-medium leading-tight text-zinc-200">{config.label}</p>
    </div>
  );
}

export function ComponentPalette() {
  const [tab, setTab] = useState<PaletteTab>('components');
  const [query, setQuery] = useState('');
  const isRunning = useSimStore((s) => s.isRunning);
  const speed = useSimStore((s) => s.speed);
  const start = useSimStore((s) => s.start);
  const pause = useSimStore((s) => s.pause);

  const filteredByCategory = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? COMPONENT_TYPE_CONFIGS.filter((c) => c.label.toLowerCase().includes(q))
      : [...COMPONENT_TYPE_CONFIGS];

    const map = new Map<string, ComponentTypeConfig[]>();
    for (const c of filtered) {
      const list = map.get(c.category) ?? [];
      list.push(c);
      map.set(c.category, list);
    }

    return PALETTE_CATEGORY_ORDER.map((name) => ({
      name,
      items: map.get(name) ?? [],
    })).filter((section) => section.items.length > 0);
  }, [query]);

  return (
    <div className="flex h-full min-h-0 w-[260px] shrink-0 flex-col border-r border-border bg-[#0c0c0e]">
      <div className="shrink-0 border-b border-zinc-800/90 px-3 pb-3 pt-3">
        <div className="flex items-center gap-2 text-zinc-100">
          <LayoutGrid className="h-4 w-4 text-zinc-400" strokeWidth={2} />
          <h2 className="text-sm font-semibold tracking-tight">Components</h2>
        </div>

        <div className="mt-3 flex gap-1 rounded-lg bg-zinc-900/80 p-0.5">
          <button
            type="button"
            onClick={() => setTab('components')}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              tab === 'components'
                ? 'border border-cyan-500/40 bg-zinc-800/90 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Components
          </button>
          <button
            type="button"
            onClick={() => setTab('chaos')}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              tab === 'chaos'
                ? 'border border-cyan-500/40 bg-zinc-800/90 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Chaos Items
          </button>
        </div>

        {tab === 'components' && (
          <div className="relative mt-3">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500"
              strokeWidth={2}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search components"
              className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900/90 py-2 pl-8 pr-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              aria-label="Search components"
            />
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {tab === 'chaos' ? (
          <div className="flex flex-col items-center justify-center gap-2 px-2 py-12 text-center">
            <Sparkles className="h-8 w-8 text-zinc-600" strokeWidth={1.5} />
            <p className="text-sm font-medium text-zinc-400">Coming in Phase 5</p>
            <p className="text-xs text-zinc-600">Chaos events will appear here.</p>
          </div>
        ) : filteredByCategory.length === 0 ? (
          <p className="px-1 py-8 text-center text-xs text-zinc-500">No components match your search.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredByCategory.map((section) => {
              const CatIcon = CATEGORY_ICONS[section.name as keyof typeof CATEGORY_ICONS];
              return (
                <section key={section.name}>
                  <div className="mb-2 flex items-center gap-2 text-zinc-400">
                    {CatIcon ? <CatIcon className="h-3.5 w-3.5" strokeWidth={2} /> : null}
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider">
                      {section.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {section.items.map((config) => (
                      <PaletteCard key={config.type} config={config} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-zinc-800/90 p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (isRunning ? pause() : start())}
            className={`min-w-0 flex-1 rounded-full py-3 text-xs font-bold uppercase tracking-wide text-white shadow-lg transition-colors ${
              isRunning
                ? 'bg-red-600 shadow-red-950/30 hover:bg-red-500'
                : 'bg-blue-600 shadow-blue-900/20 hover:bg-blue-500'
            }`}
          >
            {isRunning ? 'STOP SIMULATION' : 'START SIMULATION'}
          </button>
          <span
            className="shrink-0 rounded-md border border-zinc-700/90 bg-zinc-900/90 px-2 py-2 text-[10px] font-semibold tabular-nums text-zinc-300"
            title="Simulation speed"
          >
            {speed}x
          </span>
        </div>
      </div>
    </div>
  );
}
