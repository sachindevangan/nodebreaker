import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import type { FlowNode, NodeStatus } from '@/types';
import { useSimStore } from '@/store/useSimStore';
import { formatLatencyMs, formatThroughput, hexToRgba } from '@/utils/math';

export type BaseNodeProps = NodeProps<FlowNode> & {
  icon: LucideIcon;
  accentColor: string;
};

const plusHandleClass =
  '!pointer-events-none !z-[60] !flex !h-5 !w-5 !min-h-[20px] !min-w-[20px] !items-center !justify-center !rounded-full !border-2 !border-zinc-600 !bg-zinc-700 !cursor-crosshair !opacity-0 !shadow-sm !transition-all !duration-200 group-hover:!pointer-events-auto group-hover:!opacity-100 hover:!border-[var(--nb-accent)] hover:!bg-zinc-600';

/** Anchor handles to the card box (half in / half out on the border). */
const HANDLE_ANCHOR = {
  top: '!absolute !left-1/2 !top-0 !right-auto !bottom-auto -translate-x-1/2 -translate-y-1/2',
  bottom:
    '!absolute !left-1/2 !bottom-0 !top-auto !right-auto -translate-x-1/2 translate-y-1/2',
  left: '!absolute !left-0 !top-1/2 !right-auto !bottom-auto -translate-x-1/2 -translate-y-1/2',
  right:
    '!absolute !right-0 !top-1/2 !left-auto !bottom-auto translate-x-1/2 -translate-y-1/2',
} as const;

function statusDotClass(status: NodeStatus): string {
  switch (status) {
    case 'healthy':
      return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]';
    case 'degraded':
      return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]';
    case 'down':
      return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.65)]';
  }
}

function PlusHandle({
  id,
  type,
  position,
  anchor,
}: {
  id: string;
  type: 'source' | 'target';
  position: Position;
  anchor: keyof typeof HANDLE_ANCHOR;
}) {
  return (
    <Handle
      id={id}
      type={type}
      position={position}
      className={`${plusHandleClass} ${HANDLE_ANCHOR[anchor]} hover:!text-[var(--nb-accent)]`}
    >
      <Plus className="pointer-events-none h-3 w-3 text-zinc-200" strokeWidth={2.5} />
    </Handle>
  );
}

export function BaseNode({ id, data, selected, icon: Icon, accentColor }: BaseNodeProps) {
  const isRunning = useSimStore((s) => s.isRunning);
  const entryNodeIds = useSimStore((s) => s.entryNodeIds);
  const simMetrics = useSimStore((s) => s.nodeMetrics.get(id));

  const showEntryBadge = isRunning && entryNodeIds.includes(id);
  const dropPulse = isRunning && (simMetrics?.droppedInLastTick ?? 0) > 0;

  let glowColor = accentColor;
  if (isRunning && simMetrics) {
    const u = simMetrics.utilization;
    const stressed = simMetrics.droppedInLastTick > 0;
    if (stressed || u >= 0.8) {
      glowColor = '#ef4444';
    } else if (u >= 0.5) {
      glowColor = '#fbbf24';
    } else {
      glowColor = '#22c55e';
    }
  }

  const borderGlow = selected ? 0.55 : 0.32;
  const spread = selected ? 22 : 14;
  const boxShadow = [
    `0 0 0 1px ${glowColor}`,
    `0 0 ${spread}px 3px ${hexToRgba(glowColor, borderGlow)}`,
  ].join(', ');

  return (
    <div
      className="group relative flex flex-col items-center gap-2 overflow-visible pb-1"
      style={{ ['--nb-accent' as string]: accentColor }}
    >
      {showEntryBadge ? (
        <span className="absolute -top-1 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-emerald-500/50 bg-emerald-950/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.35)]">
          ENTRY
        </span>
      ) : null}
      <div
        className={`relative z-0 w-[132px] overflow-visible rounded-xl bg-zinc-900/95 px-3 py-4 shadow-inner ${dropPulse ? 'animate-pulse' : ''}`}
        style={{ boxShadow }}
      >
        <PlusHandle id="in-top" type="target" position={Position.Top} anchor="top" />
        <PlusHandle id="in-left" type="target" position={Position.Left} anchor="left" />
        <PlusHandle id="out-right" type="source" position={Position.Right} anchor="right" />
        <PlusHandle id="out-bottom" type="source" position={Position.Bottom} anchor="bottom" />
        <span
          className={`absolute right-2 top-2 z-[55] h-2 w-2 rounded-full ${statusDotClass(data.status)}`}
          title={data.status}
          aria-hidden
        />
        <div className="relative z-0 flex items-center justify-center">
          <Icon className="h-9 w-9" style={{ color: accentColor }} strokeWidth={1.75} />
        </div>
      </div>
      <div className="relative z-0 max-w-[160px] text-center">
        <div className="inline-block rounded-full bg-zinc-900/90 px-3 py-1">
          <span className="text-xs font-medium tracking-tight text-zinc-100">{data.label}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap justify-center gap-1">
          <span
            className={`rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium ${isRunning && simMetrics ? 'text-cyan-300' : 'text-zinc-400'}`}
            title={isRunning && simMetrics ? 'Live throughput (this tick)' : 'Configured throughput'}
          >
            {isRunning && simMetrics ? formatThroughput(simMetrics.currentLoad) : formatThroughput(data.throughput)}
          </span>
          <span className="rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
            {formatLatencyMs(data.latency)}
          </span>
        </div>
      </div>
    </div>
  );
}
