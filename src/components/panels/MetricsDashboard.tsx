import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Minus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getComponentConfig } from '@/constants/components';
import type { NodeMetrics } from '@/simulation/models';
import { useFlowStore } from '@/store/useFlowStore';
import { useSimStore, type GlobalMetricsSnapshot } from '@/store/useSimStore';
import type { FlowNode } from '@/types';

const UI_INTERVAL_MS = 100;

interface DashboardSnapshot {
  globalMetrics: GlobalMetricsSnapshot;
  globalMetricsPrev: GlobalMetricsSnapshot;
  nodeMetrics: Map<string, NodeMetrics>;
  nodes: FlowNode[];
}

function useThrottledDashboardSnapshot(enabled: boolean): DashboardSnapshot | null {
  const [snap, setSnap] = useState<DashboardSnapshot | null>(null);

  const pull = useCallback(() => {
    const sim = useSimStore.getState();
    const flow = useFlowStore.getState();
    setSnap({
      globalMetrics: { ...sim.globalMetrics },
      globalMetricsPrev: { ...sim.globalMetricsPrev },
      nodeMetrics: new Map(sim.nodeMetrics),
      nodes: flow.nodes,
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      setSnap(null);
      return;
    }
    pull();
    const id = window.setInterval(pull, UI_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled, pull]);

  return enabled ? snap : null;
}

type TrendKind = 'higherIsBetter' | 'lowerIsBetter' | 'neutral';

function TrendGlyph({
  current,
  previous,
  kind,
}: {
  current: number;
  previous: number;
  kind: TrendKind;
}) {
  if (kind === 'neutral' || current === previous) {
    return <Minus className="h-3.5 w-3.5 text-zinc-600" strokeWidth={2} aria-hidden />;
  }
  const up = current > previous;
  const good =
    kind === 'higherIsBetter' ? up : kind === 'lowerIsBetter' ? !up : false;
  const Icon = up ? ArrowUp : ArrowDown;
  const cls = good ? 'text-emerald-400' : 'text-red-400';
  return <Icon className={`h-3.5 w-3.5 ${cls}`} strokeWidth={2} aria-hidden />;
}

function MetricCard({
  label,
  valueText,
  current,
  previous,
  trendKind,
}: {
  label: string;
  valueText: string;
  current: number;
  previous: number;
  trendKind: TrendKind;
}) {
  return (
    <div className="rounded-lg border border-zinc-800/90 bg-zinc-950/80 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{label}</span>
        <TrendGlyph current={current} previous={previous} kind={trendKind} />
      </div>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums tracking-tight text-zinc-100">
        {valueText}
      </p>
    </div>
  );
}

function utilizationBarClass(u: number): string {
  if (u >= 0.8) return 'bg-red-500';
  if (u >= 0.5) return 'bg-amber-400';
  return 'bg-emerald-500';
}

export function MetricsDashboard() {
  const simulationSessionActive = useSimStore((s) => s.simulationSessionActive);
  const [expanded, setExpanded] = useState(false);

  const snap = useThrottledDashboardSnapshot(expanded && simulationSessionActive);

  const rows = useMemo(() => {
    if (!snap) return [];
    const { nodeMetrics, nodes } = snap;
    return [...nodes]
      .map((n) => {
        const m = nodeMetrics.get(n.id);
        return { node: n, metrics: m };
      })
      .filter((r): r is { node: FlowNode; metrics: NodeMetrics } => Boolean(r.metrics))
      .sort((a, b) => b.metrics.utilization - a.metrics.utilization);
  }, [snap]);

  const selectNodeOnCanvas = useFlowStore((s) => s.selectNodeOnCanvas);

  const g = snap?.globalMetrics;
  const gp = snap?.globalMetricsPrev;

  const dropRate =
    g && g.totalCompleted + g.totalDropped > 0
      ? (100 * g.totalDropped) / (g.totalCompleted + g.totalDropped)
      : 0;
  const dropRatePrev =
    gp && gp.totalCompleted + gp.totalDropped > 0
      ? (100 * gp.totalDropped) / (gp.totalCompleted + gp.totalDropped)
      : 0;

  return (
    <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 flex flex-col items-stretch px-3 pb-2">
      <div className="pointer-events-auto mx-auto w-full max-w-6xl">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center justify-center gap-2 rounded-t-lg border border-b-0 border-zinc-700/80 bg-gray-900/95 px-3 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md hover:bg-zinc-900"
          aria-expanded={expanded}
        >
          Metrics
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" strokeWidth={2} />
          ) : (
            <ChevronUp className="h-3.5 w-3.5 text-zinc-500" strokeWidth={2} />
          )}
        </button>

        {expanded ? (
          <div
            className="h-48 overflow-hidden rounded-b-lg border border-t-0 border-zinc-700/80 bg-gray-900/95 shadow-xl backdrop-blur-md"
            role="region"
            aria-label="Simulation metrics"
          >
            {!simulationSessionActive || !g || !gp ? (
              <p className="p-4 text-center text-xs text-zinc-500">
                Start the simulation to stream live metrics.
              </p>
            ) : (
              <div className="flex h-full flex-col gap-2 p-3 pt-2">
                <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  <MetricCard
                    label="Generated"
                    valueText={g.totalGenerated.toLocaleString()}
                    current={g.totalGenerated}
                    previous={gp.totalGenerated}
                    trendKind="neutral"
                  />
                  <MetricCard
                    label="Completed"
                    valueText={g.totalCompleted.toLocaleString()}
                    current={g.totalCompleted}
                    previous={gp.totalCompleted}
                    trendKind="higherIsBetter"
                  />
                  <MetricCard
                    label="Dropped"
                    valueText={g.totalDropped.toLocaleString()}
                    current={g.totalDropped}
                    previous={gp.totalDropped}
                    trendKind="lowerIsBetter"
                  />
                  <MetricCard
                    label="Avg latency"
                    valueText={`${g.avgEndToEndLatency.toFixed(1)} ms`}
                    current={g.avgEndToEndLatency}
                    previous={gp.avgEndToEndLatency}
                    trendKind="lowerIsBetter"
                  />
                  <MetricCard
                    label="Drop rate"
                    valueText={`${dropRate.toFixed(1)}%`}
                    current={dropRate}
                    previous={dropRatePrev}
                    trendKind="lowerIsBetter"
                  />
                </div>

                <div className="min-h-0 flex-1 overflow-auto rounded-md border border-zinc-800/90">
                  <table className="w-full border-collapse text-left text-[11px]">
                    <thead className="sticky top-0 z-10 bg-zinc-950/95">
                      <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-wide text-zinc-500">
                        <th className="px-2 py-1.5 font-medium">Node</th>
                        <th className="px-2 py-1.5 font-medium">Type</th>
                        <th className="px-2 py-1.5 font-medium">Utilization</th>
                        <th className="px-2 py-1.5 font-medium">Throughput</th>
                        <th className="px-2 py-1.5 font-medium">Queue</th>
                        <th className="px-2 py-1.5 font-medium">Dropped</th>
                        <th className="px-2 py-1.5 font-medium">Avg latency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ node, metrics: m }) => {
                        const typeLabel = getComponentConfig(node.type)?.label ?? node.type;
                        const u = m.utilization;
                        return (
                          <tr
                            key={node.id}
                            className="cursor-pointer border-b border-zinc-800/80 transition-colors hover:bg-zinc-800/40"
                            onClick={() => selectNodeOnCanvas(node.id)}
                          >
                            <td className="max-w-[120px] truncate px-2 py-1 font-medium text-zinc-200">
                              {node.data.label}
                            </td>
                            <td className="px-2 py-1 text-zinc-400">{typeLabel}</td>
                            <td className="px-2 py-1">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
                                  <div
                                    className={`h-full rounded-full transition-all ${utilizationBarClass(u)}`}
                                    style={{ width: `${Math.min(100, u * 100)}%` }}
                                  />
                                </div>
                                <span className="font-mono tabular-nums text-zinc-300">
                                  {(u * 100).toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-2 py-1 font-mono tabular-nums text-zinc-300">
                              {Math.round(m.currentLoad)}
                            </td>
                            <td className="px-2 py-1 font-mono tabular-nums text-zinc-300">
                              {m.queueDepth}
                            </td>
                            <td className="px-2 py-1 font-mono tabular-nums text-zinc-300">
                              {m.totalDropped}
                            </td>
                            <td className="px-2 py-1 font-mono tabular-nums text-zinc-300">
                              {m.avgLatency.toFixed(1)} ms
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {rows.length === 0 ? (
                    <p className="p-3 text-center text-xs text-zinc-600">No nodes on canvas.</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
