import { X } from 'lucide-react';
import { useMemo } from 'react';
import { getChaosEventDefinition } from '@/constants/chaosEvents';
import { useChaosStore } from '@/store/useChaosStore';
import { useFlowStore } from '@/store/useFlowStore';
import { useSimStore } from '@/store/useSimStore';
import { getChaosPaletteIcon } from '@/utils/chaosIcons';

function formatDuration(ev: { duration: number; startTick: number }, currentTick: number): string {
  if (ev.duration < 0) return 'Permanent';
  const left = ev.startTick + ev.duration - currentTick;
  if (left <= 0) return 'Ending…';
  return `${left} ticks`;
}

export function ChaosOverlay() {
  const activeEvents = useChaosStore((s) => s.activeEvents);
  const removeChaos = useChaosStore((s) => s.removeChaos);
  const clearAllChaos = useChaosStore((s) => s.clearAllChaos);
  const nodes = useFlowStore((s) => s.nodes);
  const tickCount = useSimStore((s) => s.tickCount);
  const simulationSessionActive = useSimStore((s) => s.simulationSessionActive);

  const live = useMemo(
    () => activeEvents.filter((e) => e.isActive),
    [activeEvents]
  );

  const nodeLabel = (id: string) => nodes.find((n) => n.id === id)?.data.label ?? id;

  if (!simulationSessionActive || live.length === 0) return null;

  return (
    <div className="pointer-events-none absolute right-3 top-14 z-[25] w-[min(100%,280px)]">
      <div
        className="pointer-events-auto rounded-lg border border-red-900/50 bg-zinc-950/95 shadow-xl backdrop-blur-md"
        data-hotkeys-ignore
      >
        <div className="flex items-center justify-between border-b border-red-950/50 px-3 py-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-red-200/90">
            Active chaos
            <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {live.length}
            </span>
          </h3>
        </div>
        <ul className="max-h-48 overflow-y-auto py-1">
          {live.map((ev) => {
            const def = getChaosEventDefinition(ev.type);
            const Icon = def ? getChaosPaletteIcon(def.icon) : null;
            return (
              <li
                key={ev.id}
                className="flex items-start gap-2 border-b border-zinc-800/80 px-2 py-2 last:border-b-0"
              >
                {Icon ? (
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: def?.color }} strokeWidth={2} />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium leading-snug text-zinc-100">
                    {def?.label ?? ev.type}{' '}
                    <span className="font-normal text-zinc-500">on</span>{' '}
                    <span className="text-cyan-200/90">{nodeLabel(ev.targetNodeId)}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-500">
                    {formatDuration(ev, tickCount)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeChaos(ev.id, tickCount)}
                  className="shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                  aria-label={`Remove ${def?.label ?? 'chaos event'}`}
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-red-950/40 p-2">
          <button
            type="button"
            onClick={() => clearAllChaos()}
            className="w-full rounded-md border border-red-800/60 bg-red-950/50 py-1.5 text-[11px] font-semibold text-red-200 transition-colors hover:bg-red-950/80"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}
