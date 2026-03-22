import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { LucideIcon } from 'lucide-react';
import type { FlowNode, NodeStatus } from '@/types';
import { formatLatencyMs, formatThroughput, hexToRgba } from '@/utils/math';

export type BaseNodeProps = NodeProps<FlowNode> & {
  icon: LucideIcon;
  accentColor: string;
};

const handleClassName =
  '!pointer-events-auto !z-50 !h-3 !w-3 !min-h-[12px] !min-w-[12px] !shrink-0 !rounded-full !border-0 !bg-gray-500 !cursor-crosshair transition-colors duration-150';

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

export function BaseNode({ data, selected, icon: Icon, accentColor }: BaseNodeProps) {
  const borderGlow = selected ? 0.55 : 0.32;
  const spread = selected ? 22 : 14;
  const boxShadow = [
    `0 0 0 1px ${accentColor}`,
    `0 0 ${spread}px 3px ${hexToRgba(accentColor, borderGlow)}`,
  ].join(', ');

  return (
    <div
      className="relative flex flex-col items-center gap-2 overflow-visible pb-1"
      style={{ ['--nb-accent' as string]: accentColor }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={`${handleClassName} hover:!bg-[var(--nb-accent)]`}
      />
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
      <Handle
        type="source"
        position={Position.Bottom}
        className={`${handleClassName} hover:!bg-[var(--nb-accent)]`}
      />
    </div>
  );
}
