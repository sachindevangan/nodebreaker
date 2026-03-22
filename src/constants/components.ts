import type { NodeBreakerNodeData, NodeBreakerNodeType } from '@/types';

export type ComponentIconName = 'GitBranch' | 'Server' | 'Database' | 'Zap' | 'Layers' | 'Globe';

export interface ComponentTypeConfig {
  type: NodeBreakerNodeType;
  label: string;
  icon: ComponentIconName;
  color: string;
  category: string;
  defaultData: Pick<NodeBreakerNodeData, 'throughput' | 'latency' | 'capacity' | 'status'>;
}

export const COMPONENT_TYPE_CONFIGS: readonly ComponentTypeConfig[] = [
  {
    type: 'loadBalancer',
    label: 'Load Balancer',
    icon: 'GitBranch',
    color: '#06b6d4',
    category: 'Traffic & Edge',
    defaultData: { throughput: 10000, latency: 5, capacity: 50000, status: 'healthy' },
  },
  {
    type: 'cdn',
    label: 'CDN',
    icon: 'Globe',
    color: '#22c55e',
    category: 'Traffic & Edge',
    defaultData: { throughput: 500000, latency: 12, capacity: 1_000_000, status: 'healthy' },
  },
  {
    type: 'service',
    label: 'Service',
    icon: 'Server',
    color: '#3b82f6',
    category: 'Compute',
    defaultData: { throughput: 2000, latency: 25, capacity: 8000, status: 'healthy' },
  },
  {
    type: 'database',
    label: 'Database',
    icon: 'Database',
    color: '#a855f7',
    category: 'Data',
    defaultData: { throughput: 800, latency: 8, capacity: 100000, status: 'healthy' },
  },
  {
    type: 'cache',
    label: 'Cache',
    icon: 'Zap',
    color: '#f59e0b',
    category: 'Data',
    defaultData: { throughput: 50000, latency: 1, capacity: 250000, status: 'healthy' },
  },
  {
    type: 'queue',
    label: 'Queue',
    icon: 'Layers',
    color: '#f97316',
    category: 'Data',
    defaultData: { throughput: 12000, latency: 3, capacity: 500000, status: 'healthy' },
  },
];

const configByType: Map<NodeBreakerNodeType, ComponentTypeConfig> = new Map(
  COMPONENT_TYPE_CONFIGS.map((c) => [c.type, c])
);

export function getComponentConfig(type: string): ComponentTypeConfig | undefined {
  return configByType.get(type as NodeBreakerNodeType);
}

export const PALETTE_CATEGORY_ORDER = ['Traffic & Edge', 'Compute', 'Data'] as const;

export { createDefaultNodeData } from './defaults';
