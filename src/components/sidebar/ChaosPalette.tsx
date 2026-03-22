import type { CSSProperties } from 'react';
import { CHAOS_EVENT_DEFINITIONS } from '@/constants/chaosEvents';
import type { ChaosEventType } from '@/simulation/chaos';
import { useChaosStore } from '@/store/useChaosStore';
import { useFlowStore } from '@/store/useFlowStore';
import { useSimStore } from '@/store/useSimStore';
import { useToastStore } from '@/store/useToastStore';
import { getChaosPaletteIcon } from '@/utils/chaosIcons';
import { hexToRgba } from '@/utils/math';

export function ChaosPalette() {
  const simulationSessionActive = useSimStore((s) => s.simulationSessionActive);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const nodes = useFlowStore((s) => s.nodes);

  const selectedNode = selectedNodeId
    ? (nodes.find((n) => n.id === selectedNodeId) ?? null)
    : null;

  const canInject = simulationSessionActive && selectedNodeId !== null;

  const handleInject = (type: ChaosEventType, label: string) => {
    if (!simulationSessionActive) {
      useToastStore.getState().push({
        kind: 'error',
        message: 'Start simulation first',
      });
      return;
    }
    if (!selectedNodeId || !selectedNode) {
      useToastStore.getState().push({
        kind: 'error',
        message: 'Select a node on the canvas first',
      });
      return;
    }
    const startTick = useSimStore.getState().tickCount;
    useChaosStore.getState().injectChaos(type, selectedNodeId, { startTick });
    useToastStore.getState().push({
      kind: 'success',
      message: `${label} injected on ${selectedNode.data.label}`,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {selectedNode ? (
        <div className="rounded-lg border border-cyan-900/50 bg-cyan-950/40 px-2.5 py-2 text-[11px] text-cyan-100/90">
          <span className="font-medium text-cyan-200/80">Target:</span>{' '}
          <span className="font-semibold text-cyan-100">{selectedNode.data.label}</span>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-zinc-700/80 bg-zinc-950/50 px-2.5 py-2 text-[11px] text-zinc-500">
          Select a node on the canvas, then click a chaos event below.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {CHAOS_EVENT_DEFINITIONS.map((def) => {
          const Icon = getChaosPaletteIcon(def.icon);
          const enabled = canInject;
          return (
            <button
              key={def.type}
              type="button"
              disabled={!enabled}
              onClick={() => handleInject(def.type, def.label)}
              title={
                enabled
                  ? `Inject ${def.label} on ${selectedNode?.data.label ?? 'target'}`
                  : !simulationSessionActive
                    ? 'Start simulation first'
                    : 'Select a node on the canvas first'
              }
              className={`select-none rounded-lg border border-zinc-800/90 bg-zinc-950/95 p-2.5 text-left shadow-inner transition-[opacity,transform] ${
                enabled
                  ? 'cursor-pointer border-l-4 hover:brightness-110 active:scale-[0.98]'
                  : 'cursor-not-allowed opacity-45 grayscale'
              }`}
              style={
                {
                  borderLeftColor: def.color,
                  ['--nb-chaos-tint' as string]: hexToRgba(def.color, enabled ? 0.12 : 0.04),
                  backgroundImage: 'linear-gradient(135deg, var(--nb-chaos-tint), rgb(9 9 11 / 0.95))',
                } as CSSProperties
              }
            >
              <div className="flex items-start gap-2">
                <Icon className="h-6 w-6 shrink-0" style={{ color: def.color }} strokeWidth={1.75} />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold leading-tight text-red-100/95">{def.label}</p>
                  <p className="mt-1 line-clamp-3 text-[9px] leading-snug text-zinc-500">{def.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
