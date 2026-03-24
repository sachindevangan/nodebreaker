import { DollarSign, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { COMPONENT_COST_ESTIMATES, type CostTier } from '@/constants/costEstimates';
import { getComponentConfig } from '@/constants/components';
import { useFlowStore } from '@/store/useFlowStore';

export function CostEstimation() {
  const nodes = useFlowStore((s) => s.nodes);
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState<CostTier>('medium');

  const rows = useMemo(() => {
    const byType = new Map<string, number>();
    for (const node of nodes) {
      byType.set(node.type, (byType.get(node.type) ?? 0) + 1);
    }
    return [...byType.entries()].map(([type, count]) => {
      const estimate = COMPONENT_COST_ESTIMATES[type as keyof typeof COMPONENT_COST_ESTIMATES];
      const per = estimate?.tiers[tier].cost ?? 20;
      return {
        type,
        label: getComponentConfig(type)?.label ?? type,
        aws: estimate?.awsService ?? 'AWS Service',
        count,
        per,
        total: per * count,
      };
    });
  }, [nodes, tier]);

  const total = useMemo(() => rows.reduce((sum, r) => sum + r.total, 0), [rows]);
  const tierLabel: Record<CostTier, string> = { small: 'Small', medium: 'Medium', large: 'Large' };

  const tips = useMemo(() => {
    const out: string[] = [];
    const serviceCount = rows.find((r) => r.type === 'service')?.count ?? 0;
    const cacheCount = rows.find((r) => r.type === 'cache')?.count ?? 0;
    const dbCount = rows.find((r) => r.type === 'database')?.count ?? 0;
    if (serviceCount >= 3) out.push(`You have ${serviceCount} Service instances. Consider spot instances to save ~60%.`);
    if (cacheCount > 0) out.push('Your Cache is running 24/7. Consider auto-scaling to reduce off-peak costs.');
    if (dbCount > 0) out.push('Use reserved instances for Database to save ~40%.');
    if (out.length === 0) out.push('Add a cache to reduce expensive database load and monthly spend.');
    return out;
  }, [rows]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700/80 hover:bg-zinc-800/60 hover:text-zinc-100"
        title="Cost estimation"
      >
        <DollarSign className="h-4 w-4" />
        <span>Cost</span>
      </button>
      {open ? (
        <div className="fixed bottom-4 right-4 z-[160] w-[min(680px,calc(100vw-2rem))] rounded-xl border border-zinc-700 bg-zinc-900/95 p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100">Cost Estimation</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">${total.toLocaleString()} / month</p>
          <div className="mt-3 flex gap-2">
            {(['small', 'medium', 'large'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                className={`rounded-md px-2 py-1 text-xs ${tier === t ? 'bg-cyan-700 text-white' : 'bg-zinc-800 text-zinc-300'}`}
              >
                {tierLabel[t]}
              </button>
            ))}
          </div>
          <div className="mt-3 max-h-60 overflow-auto rounded border border-zinc-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-800 text-zinc-200">
                <tr>
                  <th className="px-2 py-1.5">Component</th>
                  <th className="px-2 py-1.5">AWS Service</th>
                  <th className="px-2 py-1.5">Count</th>
                  <th className="px-2 py-1.5">Cost/each</th>
                  <th className="px-2 py-1.5">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.type} className="border-t border-zinc-800 text-zinc-300">
                    <td className="px-2 py-1.5">{row.label}</td>
                    <td className="px-2 py-1.5">{row.aws}</td>
                    <td className="px-2 py-1.5">{row.count}</td>
                    <td className="px-2 py-1.5">${row.per}</td>
                    <td className="px-2 py-1.5">${row.total}</td>
                  </tr>
                ))}
                <tr className="border-t border-zinc-700 bg-zinc-800/60 font-semibold text-zinc-100">
                  <td className="px-2 py-1.5">Total</td>
                  <td />
                  <td />
                  <td />
                  <td className="px-2 py-1.5">${total.toLocaleString()}/mo</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 rounded border border-zinc-700 bg-zinc-950/40 p-2">
            <p className="text-xs font-semibold text-zinc-200">Cost optimization tips</p>
            {tips.map((tip) => (
              <p key={tip} className="mt-1 text-xs text-zinc-400">
                - {tip}
              </p>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            Estimates based on AWS us-east-1 pricing. Actual costs vary by usage, region, and discounts.
          </p>
        </div>
      ) : null}
    </>
  );
}

