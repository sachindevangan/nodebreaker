import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Skull, TrendingDown, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getComponentConfig } from '@/constants/components';
import { getNodeIcon } from '@/components/canvas/nodes';
import { ConfirmDialog, SelectInput, SliderInput, TextInput, ToggleInput } from '@/components/ui';
import type { ChaosEventType } from '@/simulation/chaos';
import { getChaosEventDefinition } from '@/constants/chaosEvents';
import { useChaosStore } from '@/store/useChaosStore';
import { useFlowStore } from '@/store/useFlowStore';
import { useSimStore } from '@/store/useSimStore';
import { useToastStore } from '@/store/useToastStore';
import type { FlowNode, LoadBalancerAlgorithm, NodeBreakerNodeData, NodeStatus } from '@/types';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'degraded', label: 'Degraded' },
  { value: 'down', label: 'Down' },
];

const ALGORITHM_OPTIONS: { value: string; label: string }[] = [
  { value: 'round_robin', label: 'Round robin' },
  { value: 'least_connections', label: 'Least connections' },
  { value: 'random', label: 'Random' },
];

export function PropertiesPanel() {
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const nodes = useFlowStore((s) => s.nodes);
  const node = useMemo((): FlowNode | null => {
    if (!selectedNodeId) return null;
    return nodes.find((n) => n.id === selectedNodeId) ?? null;
  }, [nodes, selectedNodeId]);

  const simulationSessionActive = useSimStore((s) => s.simulationSessionActive);
  const nodeMetricsMap = useSimStore((s) => s.nodeMetrics);
  const selectedMetrics = selectedNodeId ? nodeMetricsMap.get(selectedNodeId) : undefined;

  const simDerivedStatus = useMemo((): NodeStatus | null => {
    if (!simulationSessionActive || !selectedMetrics) return null;
    if (selectedMetrics.utilization > 0.8) return 'down';
    if (selectedMetrics.utilization > 0.5) return 'degraded';
    return 'healthy';
  }, [simulationSessionActive, selectedMetrics]);

  const statusDropdownValue: NodeStatus =
    simDerivedStatus !== null ? simDerivedStatus : (node?.data.status ?? 'healthy');
  const statusControlledBySim = simulationSessionActive && selectedMetrics !== undefined;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!node) setDeleteDialogOpen(false);
  }, [node]);

  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const deleteNode = useFlowStore((s) => s.deleteNode);
  const clearSelectedNode = useFlowStore((s) => s.clearSelectedNode);

  const patch = useCallback(
    (partial: Partial<NodeBreakerNodeData>) => {
      if (!node) return;
      updateNodeData(node.id, partial);
    },
    [node, updateNodeData]
  );

  const handleClose = useCallback(() => {
    clearSelectedNode();
  }, [clearSelectedNode]);

  const confirmDelete = useCallback(() => {
    if (!node) return;
    deleteNode(node.id);
    setDeleteDialogOpen(false);
  }, [node, deleteNode]);

  const injectChaosQuick = useCallback(
    (type: ChaosEventType) => {
      if (!node || !simulationSessionActive) return;
      const startTick = useSimStore.getState().tickCount;
      useChaosStore.getState().injectChaos(type, node.id, { startTick });
      const def = getChaosEventDefinition(type);
      useToastStore.getState().push({
        kind: 'success',
        message: `${def?.label ?? type} injected on ${node.data.label}`,
      });
    },
    [node, simulationSessionActive]
  );

  const cfg = node?.type ? getComponentConfig(node.type) : undefined;
  const Icon = cfg ? getNodeIcon(cfg.icon) : null;
  const accent = cfg?.color ?? '#71717a';

  const panelOpen = Boolean(node && cfg && Icon);

  return (
    <div
      className={`flex h-full min-h-0 shrink-0 flex-col overflow-hidden transition-[width] duration-200 ease-out ${
        panelOpen ? 'w-[320px]' : 'w-0'
      }`}
    >
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete node?"
        message={
          node
            ? `Remove “${node.data.label}” from the canvas. Connected edges will be removed.`
            : ''
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
      <AnimatePresence mode="wait">
        {panelOpen && node && cfg && Icon ? (
          <motion.aside
            key={node.id}
            initial={{ x: 16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="flex h-full w-[320px] flex-col border-l border-zinc-800 bg-gray-900"
            style={{ borderLeftColor: accent }}
            aria-label="Node properties"
          >
          <header className="flex shrink-0 items-start gap-3 border-b border-zinc-800 p-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-950/80"
              style={{ color: accent }}
            >
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold tracking-tight text-zinc-100">
                {node.data.label}
              </h2>
              <p className="mt-0.5 text-[11px] italic text-zinc-500">
                Double-click a component on the canvas for settings
              </p>
              <span
                className="mt-2 inline-block rounded-md border border-zinc-700 bg-zinc-950 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-400"
              >
                {node.type}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
              aria-label="Close properties"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <section className="space-y-4">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Settings
              </h3>

              <TextInput
                id={`${node.id}-label`}
                label="Label"
                value={node.data.label}
                onChange={(v) => patch({ label: v })}
              />

              <SliderInput
                id={`${node.id}-throughput`}
                label="Throughput"
                value={node.data.throughput}
                min={0}
                max={2_000_000}
                step={100}
                onChange={(v) => patch({ throughput: v })}
                suffix="req/s"
              />

              <SliderInput
                id={`${node.id}-latency`}
                label="Latency"
                value={node.data.latency}
                min={0}
                max={5000}
                step={1}
                onChange={(v) => patch({ latency: v })}
                suffix="ms"
              />

              <SliderInput
                id={`${node.id}-capacity`}
                label="Capacity"
                value={node.data.capacity}
                min={0}
                max={5_000_000}
                step={1000}
                onChange={(v) => patch({ capacity: v })}
              />

              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`${node.id}-status`}
                  className="text-[11px] font-medium uppercase tracking-wide text-zinc-500"
                >
                  Status
                </label>
                <select
                  id={`${node.id}-status`}
                  value={statusDropdownValue}
                  disabled={statusControlledBySim}
                  onChange={(e) => patch({ status: e.target.value as NodeStatus })}
                  className="rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-zinc-950">
                      {opt.label}
                    </option>
                  ))}
                </select>
                {statusControlledBySim ? (
                  <p className="text-[10px] leading-snug text-zinc-500">
                    Status controlled by simulation
                  </p>
                ) : null}
              </div>

              {node.type === 'loadBalancer' ? (
                <>
                  <SelectInput
                    id={`${node.id}-algo`}
                    label="Algorithm"
                    value={node.data.algorithm ?? 'round_robin'}
                    options={ALGORITHM_OPTIONS}
                    onChange={(v) => patch({ algorithm: v as LoadBalancerAlgorithm })}
                  />
                  <ToggleInput
                    id={`${node.id}-rate-limit`}
                    label="Rate limiting"
                    checked={Boolean(node.data.rateLimiting)}
                    onChange={(c) => patch({ rateLimiting: c, rateLimitRps: c ? node.data.rateLimitRps ?? 1000 : null })}
                  />
                  {node.data.rateLimiting ? (
                    <SliderInput
                      id={`${node.id}-rate-rps`}
                      label="Rate limit"
                      value={node.data.rateLimitRps ?? 1000}
                      min={1}
                      max={500_000}
                      step={10}
                      onChange={(v) => patch({ rateLimitRps: v })}
                      suffix="req/s"
                    />
                  ) : null}
                </>
              ) : null}

              {node.type === 'database' ? (
                <>
                  <SliderInput
                    id={`${node.id}-replicas`}
                    label="Read replicas"
                    value={node.data.readReplicas ?? 2}
                    min={0}
                    max={32}
                    step={1}
                    onChange={(v) => patch({ readReplicas: v })}
                  />
                  <SliderInput
                    id={`${node.id}-pool`}
                    label="Connection pool size"
                    value={node.data.connectionPoolSize ?? 20}
                    min={1}
                    max={500}
                    step={1}
                    onChange={(v) => patch({ connectionPoolSize: v })}
                  />
                </>
              ) : null}

              {node.type === 'cache' ? (
                <>
                  <SliderInput
                    id={`${node.id}-ttl`}
                    label="TTL"
                    value={node.data.ttlSeconds ?? 300}
                    min={1}
                    max={86400}
                    step={1}
                    onChange={(v) => patch({ ttlSeconds: v })}
                    suffix="s"
                  />
                  <SliderInput
                    id={`${node.id}-mem`}
                    label="Max memory"
                    value={node.data.maxMemoryMb ?? 512}
                    min={16}
                    max={65536}
                    step={16}
                    onChange={(v) => patch({ maxMemoryMb: v })}
                    suffix="MB"
                  />
                </>
              ) : null}

              {node.type === 'queue' ? (
                <>
                  <SliderInput
                    id={`${node.id}-depth`}
                    label="Max queue depth"
                    value={node.data.maxQueueDepth ?? 10000}
                    min={100}
                    max={10_000_000}
                    step={100}
                    onChange={(v) => patch({ maxQueueDepth: v })}
                  />
                  <SliderInput
                    id={`${node.id}-consumers`}
                    label="Consumer count"
                    value={node.data.consumerCount ?? 4}
                    min={1}
                    max={256}
                    step={1}
                    onChange={(v) => patch({ consumerCount: v })}
                  />
                </>
              ) : null}

              {node.type === 'lambda' ? (
                <>
                  <SliderInput
                    id={`${node.id}-coldstart`}
                    label="Cold start"
                    value={node.data.coldStartMs ?? 500}
                    min={0}
                    max={10000}
                    step={10}
                    onChange={(v) => patch({ coldStartMs: v })}
                    suffix="ms"
                  />
                  <SliderInput
                    id={`${node.id}-timeout`}
                    label="Timeout"
                    value={node.data.timeoutMs ?? 30000}
                    min={1000}
                    max={900000}
                    step={1000}
                    onChange={(v) => patch({ timeoutMs: v })}
                    suffix="ms"
                  />
                </>
              ) : null}

              {node.type === 'container' ? (
                <>
                  <SliderInput
                    id={`${node.id}-replicas`}
                    label="Replicas"
                    value={node.data.replicas ?? 3}
                    min={1}
                    max={100}
                    step={1}
                    onChange={(v) => patch({ replicas: v })}
                  />
                  <TextInput
                    id={`${node.id}-cpulimit`}
                    label="CPU limit"
                    value={node.data.cpuLimit ?? '1000m'}
                    onChange={(v) => patch({ cpuLimit: v })}
                  />
                </>
              ) : null}

              {node.type === 'search' ? (
                <>
                  <SliderInput
                    id={`${node.id}-indexcount`}
                    label="Index count"
                    value={node.data.indexCount ?? 10}
                    min={1}
                    max={1000}
                    step={1}
                    onChange={(v) => patch({ indexCount: v })}
                  />
                  <SliderInput
                    id={`${node.id}-shardcount`}
                    label="Shard count"
                    value={node.data.shardCount ?? 5}
                    min={1}
                    max={100}
                    step={1}
                    onChange={(v) => patch({ shardCount: v })}
                  />
                </>
              ) : null}

              {node.type === 'kafka' ? (
                <>
                  <SliderInput
                    id={`${node.id}-partitions`}
                    label="Partitions"
                    value={node.data.partitions ?? 12}
                    min={1}
                    max={1000}
                    step={1}
                    onChange={(v) => patch({ partitions: v })}
                  />
                  <SliderInput
                    id={`${node.id}-replication`}
                    label="Replication factor"
                    value={node.data.replicationFactor ?? 3}
                    min={1}
                    max={16}
                    step={1}
                    onChange={(v) => patch({ replicationFactor: v })}
                  />
                </>
              ) : null}

              {node.type === 'authService' ? (
                <>
                  <SliderInput
                    id={`${node.id}-tokenTTL`}
                    label="Token TTL"
                    value={node.data.tokenTTL ?? 3600}
                    min={60}
                    max={86400}
                    step={60}
                    onChange={(v) => patch({ tokenTTL: v })}
                    suffix="s"
                  />
                  <SliderInput
                    id={`${node.id}-maxSessions`}
                    label="Max sessions"
                    value={node.data.maxSessions ?? 10000}
                    min={100}
                    max={1_000_000}
                    step={100}
                    onChange={(v) => patch({ maxSessions: v })}
                  />
                </>
              ) : null}

              {node.type === 'rateLimiter' ? (
                <>
                  <SliderInput
                    id={`${node.id}-maxRpm`}
                    label="Max requests/min"
                    value={node.data.maxRequestsPerMin ?? 1000}
                    min={1}
                    max={1_000_000}
                    step={10}
                    onChange={(v) => patch({ maxRequestsPerMin: v })}
                  />
                  <SliderInput
                    id={`${node.id}-windowMs`}
                    label="Window"
                    value={node.data.windowMs ?? 60000}
                    min={1000}
                    max={3600000}
                    step={1000}
                    onChange={(v) => patch({ windowMs: v })}
                    suffix="ms"
                  />
                </>
              ) : null}
            </section>

            <section className="mt-8 border-t border-zinc-800 pt-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Chaos
              </h3>
              <p className="mt-1 text-[11px] text-zinc-600">
                Quick inject on this node (simulation must be running)
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!simulationSessionActive}
                  onClick={() => injectChaosQuick('node_crash')}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-900/50 bg-red-950/50 text-red-300 transition-colors hover:bg-red-950/80 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Node crash"
                >
                  <Skull className="h-5 w-5" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  disabled={!simulationSessionActive}
                  onClick={() => injectChaosQuick('latency_spike')}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-900/50 bg-amber-950/40 text-amber-300 transition-colors hover:bg-amber-950/70 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Latency spike"
                >
                  <Clock className="h-5 w-5" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  disabled={!simulationSessionActive}
                  onClick={() => injectChaosQuick('capacity_drop')}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-orange-900/50 bg-orange-950/40 text-orange-300 transition-colors hover:bg-orange-950/70 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Capacity drop"
                >
                  <TrendingDown className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>
            </section>
          </div>

          <footer className="shrink-0 border-t border-zinc-800 p-4">
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              className="w-full rounded-lg border border-red-900/60 bg-red-950/40 py-2.5 text-sm font-medium text-red-200 transition-colors hover:bg-red-950/70"
            >
              Delete node
            </button>
          </footer>
        </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
