import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
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

function getBorderColor(defaultColor: string, utilization: number, isRunning: boolean): string {
  if (!isRunning) return defaultColor;
  if (utilization > 0.8) return '#ef4444';
  if (utilization > 0.5) return '#f59e0b';
  return '#22c55e';
}

function simStatusDotStyle(simStatus: NodeStatus): { backgroundColor: string; boxShadow: string } {
  switch (simStatus) {
    case 'healthy':
      return { backgroundColor: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.75)' };
    case 'degraded':
      return { backgroundColor: '#f59e0b', boxShadow: '0 0 8px rgba(245,158,11,0.65)' };
    case 'down':
      return { backgroundColor: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.7)' };
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
  const nodeMetrics = useSimStore((s) => s.nodeMetrics);
  const metrics = nodeMetrics.get(id);

  const simStatus = useMemo((): NodeStatus => {
    if (!isRunning || !metrics) return data.status ?? 'healthy';
    if (metrics.utilization > 0.8) return 'down';
    if (metrics.utilization > 0.5) return 'degraded';
    return 'healthy';
  }, [isRunning, metrics, data.status]);

  const dotStyle = useMemo(() => simStatusDotStyle(simStatus), [simStatus]);

  const showEntryBadge = isRunning && entryNodeIds.includes(id);
  const dropPulse = isRunning && (metrics?.droppedInLastTick ?? 0) > 0;

  const utilization = metrics?.utilization ?? 0;
  const glowColor =
    isRunning && metrics ? getBorderColor(accentColor, utilization, true) : accentColor;

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
          className={`absolute right-2 top-2 z-[55] h-2 w-2 rounded-full ${simStatus === 'down' ? 'animate-pulse' : ''}`}
          style={dotStyle}
          title={simStatus}
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
            className={`rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium ${isRunning && metrics ? 'text-cyan-300' : 'text-zinc-400'}`}
            title={
              isRunning && metrics
                ? 'Processed throughput (this tick, req/s)'
                : 'Configured throughput'
            }
          >
            {isRunning && metrics ? formatThroughput(metrics.currentLoad) : formatThroughput(data.throughput)}
          </span>
          <span className="rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
            {formatLatencyMs(data.latency)}
          </span>
        </div>
      </div>
    </div>
  );
}
