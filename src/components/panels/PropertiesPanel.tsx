import { AnimatePresence, motion } from 'framer-motion';
import { CloudLightning, X, Zap } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { getComponentConfig } from '@/constants/components';
import { getNodeIcon } from '@/components/canvas/nodes';
import { SelectInput, SliderInput, TextInput, ToggleInput } from '@/components/ui';
import { useFlowStore } from '@/store/useFlowStore';
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

function useSingleSelectedNode(): FlowNode | null {
  const nodes = useFlowStore((s) => s.nodes);
  return useMemo(() => {
    const sel = nodes.filter((n) => n.selected);
    return sel.length === 1 ? sel[0]! : null;
  }, [nodes]);
}

export function PropertiesPanel() {
  const node = useSingleSelectedNode();
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const deleteNode = useFlowStore((s) => s.deleteNode);
  const clearSelection = useFlowStore((s) => s.clearSelection);

  const patch = useCallback(
    (partial: Partial<NodeBreakerNodeData>) => {
      if (!node) return;
      updateNodeData(node.id, partial);
    },
    [node, updateNodeData]
  );

  const handleClose = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleDelete = useCallback(() => {
    if (!node) return;
    const ok = window.confirm(`Delete "${node.data.label}"? This cannot be undone.`);
    if (!ok) return;
    deleteNode(node.id);
  }, [node, deleteNode]);

  const cfg = node?.type ? getComponentConfig(node.type) : undefined;
  const Icon = cfg ? getNodeIcon(cfg.icon) : null;
  const accent = cfg?.color ?? '#71717a';

  return (
    <AnimatePresence mode="wait">
      {node && cfg && Icon ? (
        <motion.aside
          key={node.id}
          initial={{ x: 16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 16, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="flex h-full w-80 shrink-0 flex-col border-l border-zinc-800 bg-gray-900"
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

              <SelectInput
                id={`${node.id}-status`}
                label="Status"
                value={node.data.status}
                options={STATUS_OPTIONS}
                onChange={(v) => patch({ status: v as NodeStatus })}
              />

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
            </section>

            <section className="mt-8 border-t border-zinc-800 pt-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Chaos
              </h3>
              <p className="mt-1 text-[11px] text-zinc-600">Quick actions — Phase 5</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-amber-400 opacity-50"
                  title="Coming in Phase 5"
                >
                  <Zap className="h-5 w-5" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  disabled
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-500 opacity-50"
                  title="Coming in Phase 5"
                >
                  <CloudLightning className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>
            </section>
          </div>

          <footer className="shrink-0 border-t border-zinc-800 p-4">
            <button
              type="button"
              onClick={handleDelete}
              className="w-full rounded-lg border border-red-900/60 bg-red-950/40 py-2.5 text-sm font-medium text-red-200 transition-colors hover:bg-red-950/70"
            >
              Delete node
            </button>
          </footer>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
