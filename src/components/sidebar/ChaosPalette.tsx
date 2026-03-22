import type { CSSProperties } from 'react';
import { CHAOS_EVENT_DEFINITIONS } from '@/constants/chaosEvents';
import { NODEBREAKER_CHAOS_MIME } from '@/hooks/useDragToCanvas';
import { useSimStore } from '@/store/useSimStore';
import { getChaosPaletteIcon } from '@/utils/chaosIcons';
import { hexToRgba } from '@/utils/math';

export function ChaosPalette() {
  const simulationSessionActive = useSimStore((s) => s.simulationSessionActive);

  return (
    <div className="grid grid-cols-2 gap-2">
      {CHAOS_EVENT_DEFINITIONS.map((def) => {
        const Icon = getChaosPaletteIcon(def.icon);
        const enabled = simulationSessionActive;
        return (
          <div
            key={def.type}
            draggable={enabled}
            onDragStart={(e) => {
              if (!enabled) {
                e.preventDefault();
                return;
              }
              e.dataTransfer.setData(NODEBREAKER_CHAOS_MIME, def.type);
              e.dataTransfer.effectAllowed = 'copy';
            }}
            title={enabled ? def.description : 'Start simulation first'}
            className={`select-none rounded-lg border border-zinc-800/90 bg-zinc-950/95 p-2.5 text-left shadow-inner transition-[opacity,transform] ${
              enabled
                ? 'cursor-grab border-l-4 active:cursor-grabbing hover:brightness-110'
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
          </div>
        );
      })}
    </div>
  );
}
