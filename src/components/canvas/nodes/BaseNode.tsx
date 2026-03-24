import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Plus, Skull } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getChaosEventDefinition } from '@/constants/chaosEvents';
import { getComponentKnowledge } from '@/constants/knowledge';
import type { ChaosEvent } from '@/simulation/chaos';
import type { FlowNode, NodeStatus } from '@/types';
import { useChaosStore } from '@/store/useChaosStore';
import { useKnowledgeStore } from '@/store/useKnowledgeStore';
import { useSimStore } from '@/store/useSimStore';
import { getChaosPaletteIcon } from '@/utils/chaosIcons';
import { formatLatencyMs, formatThroughput, hexToRgba } from '@/utils/math';

export type BaseNodeProps = NodeProps<FlowNode> & {
  icon: LucideIcon;
  accentColor: string;
};

const plusHandleClass =
  '!pointer-events-none !z-[60] !flex !h-5 !w-5 !min-h-[20px] !min-w-[20px] !items-center !justify-center !rounded-full !border-2 !border-[var(--node-border)] !bg-[var(--surface-hover)] !cursor-crosshair !opacity-0 !shadow-sm !transition-all !duration-200 group-hover:!pointer-events-auto group-hover:!opacity-100 hover:!border-[var(--nb-accent)] hover:!bg-[var(--surface)]';

/** Anchor handles to the card box (half in / half out on the border). */
const HANDLE_ANCHOR = {
  top: '!absolute !left-1/2 !top-0 !right-auto !bottom-auto -translate-x-1/2 -translate-y-1/2',
  bottom:
    '!absolute !left-1/2 !bottom-0 !top-auto !right-auto -translate-x-1/2 translate-y-1/2',
  left: '!absolute !left-0 !top-1/2 !right-auto !bottom-auto -translate-x-1/2 -translate-y-1/2',
  right:
    '!absolute !right-0 !top-1/2 !left-auto !bottom-auto translate-x-1/2 -translate-y-1/2',
} as const;

function getBorderColor(defaultColor: string, utilization: number, sessionActive: boolean): string {
  if (!sessionActive) return defaultColor;
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
  const delayByAnchor: Record<keyof typeof HANDLE_ANCHOR, string> = {
    top: '0ms',
    left: '50ms',
    right: '100ms',
    bottom: '150ms',
  };
  return (
    <Handle
      id={id}
      type={type}
      position={position}
      className={`${plusHandleClass} ${HANDLE_ANCHOR[anchor]} hover:!text-[var(--nb-accent)]`}
      style={{ transitionDelay: delayByAnchor[anchor] }}
    >
      <Plus className="pointer-events-none h-3 w-3 text-[var(--text)]" strokeWidth={2.5} />
    </Handle>
  );
}

export function BaseNode({ id, type, data, selected, icon: Icon, accentColor }: BaseNodeProps) {
  const simulationSessionActive = useSimStore((s) => s.simulationSessionActive);
  const entryNodeIds = useSimStore((s) => s.entryNodeIds);
  const nodeMetrics = useSimStore((s) => s.nodeMetrics);
  const metrics = nodeMetrics.get(id);
  const chaosEvents = useChaosStore((s) => s.activeEvents);
  const openKnowledge = useKnowledgeStore((s) => s.openKnowledge);
  const [showTooltip, setShowTooltip] = useState(false);
  const [shake, setShake] = useState(false);
  const [startPulse, setStartPulse] = useState(false);
  const hoverTimerRef = useRef<number | null>(null);
  const prevChaosCount = useRef(0);
  const prevSession = useRef(false);

  const myChaos = useMemo(
    () => chaosEvents.filter((e) => e.isActive && e.targetNodeId === id),
    [chaosEvents, id]
  );
  const crashed = myChaos.some((e) => e.type === 'node_crash');
  const underChaos = myChaos.length > 0;

  const simStatus = useMemo((): NodeStatus => {
    if (!simulationSessionActive || !metrics) return data.status ?? 'healthy';
    if (metrics.utilization > 0.8) return 'down';
    if (metrics.utilization > 0.5) return 'degraded';
    return 'healthy';
  }, [simulationSessionActive, metrics, data.status]);

  const dotStyle = useMemo(() => simStatusDotStyle(simStatus), [simStatus]);

  const showEntryBadge = simulationSessionActive && entryNodeIds.includes(id);
  const dropPulse = simulationSessionActive && (metrics?.droppedInLastTick ?? 0) > 0;

  const utilization = metrics?.utilization ?? 0;
  const glowColor =
    simulationSessionActive && metrics ? getBorderColor(accentColor, utilization, true) : accentColor;

  const borderGlow = selected ? 0.55 : 0.32;
  const spread = selected ? 22 : 14;
  const chaosPulse =
    simulationSessionActive && underChaos
      ? `, 0 0 0 1px rgba(239,68,68,0.55), 0 0 ${selected ? 20 : 12}px 2px rgba(239,68,68,0.25)`
      : '';
  const boxShadow = [
    `0 0 0 1px ${glowColor}`,
    `0 0 ${spread}px 3px ${hexToRgba(glowColor, borderGlow)}`,
  ].join(', ') + chaosPulse;
  const knowledgeSummary = type ? getComponentKnowledge(type).summary : null;

  useEffect(() => {
    if (simulationSessionActive && !prevSession.current) {
      setStartPulse(true);
      window.setTimeout(() => setStartPulse(false), 320);
    }
    prevSession.current = simulationSessionActive;
  }, [simulationSessionActive]);

  useEffect(() => {
    if (myChaos.length > prevChaosCount.current) {
      setShake(true);
      window.setTimeout(() => setShake(false), 300);
    }
    prevChaosCount.current = myChaos.length;
  }, [myChaos.length]);

  return (
    <div
      className="group relative flex flex-col items-center gap-2 overflow-visible pb-1"
      style={{ ['--nb-accent' as string]: accentColor }}
      onMouseEnter={() => {
        if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = window.setTimeout(() => setShowTooltip(true), 1500);
      }}
      onMouseLeave={() => {
        if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
        setShowTooltip(false);
      }}
    >
      {showTooltip && type ? (
        <div className="pointer-events-auto absolute -top-12 left-1/2 z-[90] w-64 -translate-x-1/2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-[11px] text-[var(--text)] shadow-lg">
          {data.label}: {knowledgeSummary} Click for details.
          <button
            type="button"
            className="mt-1 block text-[10px] font-medium text-cyan-300 hover:text-cyan-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openKnowledge({ kind: 'component', componentType: type });
            }}
          >
            Learn more
          </button>
        </div>
      ) : null}
      {showEntryBadge ? (
        <span className="absolute -top-1 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-emerald-500/50 bg-emerald-950/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.35)]">
          ENTRY
        </span>
      ) : null}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: startPulse ? [1, 1.05, 1] : 1,
          opacity: 1,
          x: shake ? [-3, 3, -2, 2, 0] : 0,
        }}
        transition={{
          scale: { duration: 0.3, ease: 'easeOut' },
          x: { duration: 0.3, ease: 'easeOut' },
          opacity: { duration: 0.2, ease: 'easeOut' },
          type: 'spring',
          stiffness: 500,
          damping: 25,
        }}
        className={`relative z-0 w-[132px] overflow-visible rounded-xl bg-[var(--node-bg)] px-3 py-4 shadow-inner ${
          crashed ? 'opacity-50' : ''
        } ${dropPulse ? 'animate-pulse' : ''} ${
          simulationSessionActive && underChaos ? 'animate-[pulse_2.5s_ease-in-out_infinite] ring-1 ring-red-500/40' : ''
        }`}
        style={{ boxShadow, transition: 'box-shadow 0.2s ease', willChange: 'transform' }}
      >
        <PlusHandle id="in-top" type="target" position={Position.Top} anchor="top" />
        <PlusHandle id="in-left" type="target" position={Position.Left} anchor="left" />
        <PlusHandle id="out-right" type="source" position={Position.Right} anchor="right" />
        <PlusHandle id="out-bottom" type="source" position={Position.Bottom} anchor="bottom" />
        <span
          className={`absolute right-2 top-2 z-[55] h-2 w-2 rounded-full ${simStatus === 'down' ? 'animate-pulse' : ''}`}
          style={{ ...dotStyle, transition: 'background-color 0.3s ease' }}
          title={simStatus}
          aria-hidden
        />
        {simulationSessionActive && myChaos.length > 0 ? (
          <div
            className="absolute left-2 top-8 z-[56] flex max-w-[calc(100%-1rem)] flex-wrap gap-1"
            aria-label="Active chaos on this node"
          >
            {myChaos.map((ev: ChaosEvent) => {
              const def = getChaosEventDefinition(ev.type);
              if (!def) return null;
              const CIcon = getChaosPaletteIcon(def.icon);
              const pulse = ev.type === 'latency_spike';
              return (
                <motion.span
                  key={ev.id}
                  title={def.label}
                  className={pulse ? 'inline-flex animate-pulse' : 'inline-flex'}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <CIcon className="h-3.5 w-3.5" style={{ color: def.color }} strokeWidth={2} />
                </motion.span>
              );
            })}
          </div>
        ) : null}
        <div className="relative z-0 flex items-center justify-center">
          <Icon className="h-9 w-9" style={{ color: accentColor }} strokeWidth={1.75} />
        </div>
        {crashed && simulationSessionActive ? (
          <div className="pointer-events-none absolute inset-0 z-[58] flex flex-col items-center justify-center rounded-xl bg-black/50 backdrop-blur-[0.5px]">
            <Skull className="h-9 w-9 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.85)]" strokeWidth={1.5} />
            <span className="mt-1 text-[8px] font-bold uppercase tracking-widest text-red-200/90">
              Crashed
            </span>
          </div>
        ) : null}
      </motion.div>
      <div className="relative z-0 max-w-[160px] text-center">
        <div className="inline-block rounded-full bg-[var(--node-bg)] px-3 py-1">
          <span className="text-xs font-medium tracking-tight text-[var(--text)]">{data.label}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap justify-center gap-1">
          <span
            className={`rounded-full bg-[var(--node-bg)] px-2 py-0.5 text-[10px] font-medium ${simulationSessionActive && metrics ? 'text-cyan-300' : 'text-[var(--text-secondary)]'}`}
            title={
              simulationSessionActive && metrics
                ? 'Processed throughput (this tick, req/s)'
                : 'Configured throughput'
            }
          >
            {simulationSessionActive && metrics
              ? formatThroughput(metrics.currentLoad)
              : formatThroughput(data.throughput)}
          </span>
          <span className="rounded-full bg-[var(--node-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
            {formatLatencyMs(data.latency)}
          </span>
        </div>
      </div>
    </div>
  );
}
