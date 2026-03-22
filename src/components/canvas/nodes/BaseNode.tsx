import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import type { FlowNode, NodeStatus } from '@/types';
import { formatLatencyMs, formatThroughput, hexToRgba } from '@/utils/math';

export type BaseNodeProps = NodeProps<FlowNode> & {
  icon: LucideIcon;
  accentColor: string;
};

const plusHandleClass =
  '!pointer-events-none !z-50 !flex !h-5 !w-5 !min-h-[20px] !min-w-[20px] !items-center !justify-center !rounded-full !border-2 !border-zinc-600 !bg-zinc-700 !cursor-crosshair !opacity-0 !shadow-sm !transition-all !duration-200 group-hover:!pointer-events-auto group-hover:!opacity-100 hover:!border-[var(--nb-accent)] hover:!bg-zinc-600';

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
}: {
  id: string;
  type: 'source' | 'target';
  position: Position;
}) {
  return (
    <Handle
      id={id}
      type={type}
      position={position}
      className={`${plusHandleClass} hover:!text-[var(--nb-accent)]`}
    >
      <Plus className="pointer-events-none h-3 w-3 text-zinc-200" strokeWidth={2.5} />
    </Handle>
  );
}

export function BaseNode({ data, selected, icon: Icon, accentColor }: BaseNodeProps) {
  const borderGlow = selected ? 0.55 : 0.32;
  const spread = selected ? 22 : 14;
  const boxShadow = [
    `0 0 0 1px ${accentColor}`,
    `0 0 ${spread}px 3px ${hexToRgba(accentColor, borderGlow)}`,
  ].join(', ');

  return (
    <div
      className="group relative flex flex-col items-center gap-2 overflow-visible pb-1"
      style={{ ['--nb-accent' as string]: accentColor }}
    >
      <PlusHandle id="in-top" type="target" position={Position.Top} />
      <PlusHandle id="in-left" type="target" position={Position.Left} />
      <PlusHandle id="out-right" type="source" position={Position.Right} />
      <div
        className="relative z-0 w-[132px] overflow-visible rounded-xl bg-zinc-900/95 px-3 py-4 shadow-inner"
        style={{ boxShadow }}
      >
        <span
          className={`absolute right-2 top-2 z-10 h-2 w-2 rounded-full ${statusDotClass(data.status)}`}
          title={data.status}
          aria-hidden
        />
        <div className="flex items-center justify-center">
          <Icon className="h-9 w-9" style={{ color: accentColor }} strokeWidth={1.75} />
        </div>
      </div>
      <div className="relative z-0 max-w-[160px] text-center">
        <div className="inline-block rounded-full bg-zinc-900/90 px-3 py-1">
          <span className="text-xs font-medium tracking-tight text-zinc-100">{data.label}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap justify-center gap-1">
          <span className="rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
            {formatThroughput(data.throughput)}
          </span>
          <span className="rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
            {formatLatencyMs(data.latency)}
          </span>
        </div>
      </div>
      <PlusHandle id="out-bottom" type="source" position={Position.Bottom} />
    </div>
  );
}
