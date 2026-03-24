import type { NodeBreakerNodeData, NodeBreakerNodeType } from '@/types';

export type ComponentIconName =
  | 'GitBranch'
  | 'Server'
  | 'Database'
  | 'Zap'
  | 'Layers'
  | 'Globe'
  | 'Globe2'
  | 'Shield'
  | 'ShieldCheck'
  | 'ArrowDownToLine'
  | 'Cog'
  | 'Box'
  | 'Clock'
  | 'Search'
  | 'Warehouse'
  | 'HardDrive'
  | 'Archive'
  | 'Radio'
  | 'Workflow'
  | 'Megaphone'
  | 'ArrowLeftRight'
  | 'Router'
  | 'GitMerge'
  | 'Lock'
  | 'Gauge'
  | 'Flame'
  | 'FileText'
  | 'HeartPulse'
  | 'BarChart3';

export interface ComponentTypeConfig {
  type: NodeBreakerNodeType;
  label: string;
  icon: ComponentIconName;
  color: string;
  category: string;
  defaultData: Pick<NodeBreakerNodeData, 'throughput' | 'latency' | 'capacity' | 'status'>;
}

export const COMPONENT_TYPE_CONFIGS: readonly ComponentTypeConfig[] = [
  // Traffic & Edge
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
    type: 'dns',
    label: 'DNS',
    icon: 'Globe2',
    color: '#06b6d4',
    category: 'Traffic & Edge',
    defaultData: { throughput: 100000, latency: 2, capacity: 500000, status: 'healthy' },
  },
  {
    type: 'apiGateway',
    label: 'API Gateway',
    icon: 'Shield',
    color: '#8b5cf6',
    category: 'Traffic & Edge',
    defaultData: { throughput: 20000, latency: 10, capacity: 100000, status: 'healthy' },
  },
  {
    type: 'waf',
    label: 'WAF',
    icon: 'ShieldCheck',
    color: '#f59e0b',
    category: 'Traffic & Edge',
    defaultData: { throughput: 50000, latency: 3, capacity: 200000, status: 'healthy' },
  },
  {
    type: 'ingress',
    label: 'Ingress',
    icon: 'ArrowDownToLine',
    color: '#14b8a6',
    category: 'Traffic & Edge',
    defaultData: { throughput: 30000, latency: 5, capacity: 150000, status: 'healthy' },
  },
  // Network
  {
    type: 'reverseProxy',
    label: 'Reverse Proxy',
    icon: 'ArrowLeftRight',
    color: '#6366f1',
    category: 'Network',
    defaultData: { throughput: 40000, latency: 3, capacity: 200000, status: 'healthy' },
  },
  {
    type: 'edgeRouter',
    label: 'Edge Router',
    icon: 'Router',
    color: '#f43f5e',
    category: 'Network',
    defaultData: { throughput: 60000, latency: 2, capacity: 300000, status: 'healthy' },
  },
  {
    type: 'loadBalancerL4',
    label: 'Load Balancer (L4)',
    icon: 'GitBranch',
    color: '#0ea5e9',
    category: 'Network',
    defaultData: { throughput: 80000, latency: 1, capacity: 500000, status: 'healthy' },
  },
  {
    type: 'loadBalancerL7',
    label: 'Load Balancer (L7)',
    icon: 'GitMerge',
    color: '#06b6d4',
    category: 'Network',
    defaultData: { throughput: 30000, latency: 5, capacity: 200000, status: 'healthy' },
  },
  // Compute
  {
    type: 'service',
    label: 'Service',
    icon: 'Server',
    color: '#3b82f6',
    category: 'Compute',
    defaultData: { throughput: 2000, latency: 25, capacity: 8000, status: 'healthy' },
  },
  {
    type: 'worker',
    label: 'Worker',
    icon: 'Cog',
    color: '#3b82f6',
    category: 'Compute',
    defaultData: { throughput: 5000, latency: 50, capacity: 20000, status: 'healthy' },
  },
  {
    type: 'lambda',
    label: 'Lambda',
    icon: 'Zap',
    color: '#f97316',
    category: 'Compute',
    defaultData: { throughput: 10000, latency: 100, capacity: 50000, status: 'healthy' },
  },
  {
    type: 'container',
    label: 'Container',
    icon: 'Box',
    color: '#6366f1',
    category: 'Compute',
    defaultData: { throughput: 8000, latency: 30, capacity: 40000, status: 'healthy' },
  },
  {
    type: 'cronJob',
    label: 'Cron Job',
    icon: 'Clock',
    color: '#64748b',
    category: 'Compute',
    defaultData: { throughput: 100, latency: 1000, capacity: 1000, status: 'healthy' },
  },
  // Data
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
    type: 'search',
    label: 'Search Engine',
    icon: 'Search',
    color: '#22c55e',
    category: 'Data',
    defaultData: { throughput: 5000, latency: 15, capacity: 50000, status: 'healthy' },
  },
  {
    type: 'dataWarehouse',
    label: 'Data Warehouse',
    icon: 'Warehouse',
    color: '#a855f7',
    category: 'Data',
    defaultData: { throughput: 1000, latency: 200, capacity: 100000, status: 'healthy' },
  },
  {
    type: 'blobStorage',
    label: 'Blob Storage',
    icon: 'HardDrive',
    color: '#0ea5e9',
    category: 'Data',
    defaultData: { throughput: 20000, latency: 20, capacity: 1_000_000, status: 'healthy' },
  },
  {
    type: 'objectStore',
    label: 'Object Store',
    icon: 'Archive',
    color: '#84cc16',
    category: 'Data',
    defaultData: { throughput: 15000, latency: 25, capacity: 500000, status: 'healthy' },
  },
  // Messaging
  {
    type: 'queue',
    label: 'Queue',
    icon: 'Layers',
    color: '#f97316',
    category: 'Messaging',
    defaultData: { throughput: 12000, latency: 3, capacity: 500000, status: 'healthy' },
  },
  {
    type: 'kafka',
    label: 'Kafka',
    icon: 'Radio',
    color: '#f97316',
    category: 'Messaging',
    defaultData: { throughput: 100000, latency: 5, capacity: 1_000_000, status: 'healthy' },
  },
  {
    type: 'eventBus',
    label: 'Event Bus',
    icon: 'Workflow',
    color: '#ec4899',
    category: 'Messaging',
    defaultData: { throughput: 50000, latency: 8, capacity: 500000, status: 'healthy' },
  },
  {
    type: 'pubSub',
    label: 'Pub/Sub',
    icon: 'Megaphone',
    color: '#14b8a6',
    category: 'Messaging',
    defaultData: { throughput: 80000, latency: 4, capacity: 800000, status: 'healthy' },
  },
  // Security
  {
    type: 'authService',
    label: 'Auth Service',
    icon: 'Lock',
    color: '#f59e0b',
    category: 'Security',
    defaultData: { throughput: 10000, latency: 20, capacity: 50000, status: 'healthy' },
  },
  {
    type: 'rateLimiter',
    label: 'Rate Limiter',
    icon: 'Gauge',
    color: '#ef4444',
    category: 'Security',
    defaultData: { throughput: 100000, latency: 1, capacity: 500000, status: 'healthy' },
  },
  {
    type: 'firewall',
    label: 'Firewall',
    icon: 'Flame',
    color: '#dc2626',
    category: 'Security',
    defaultData: { throughput: 200000, latency: 1, capacity: 1_000_000, status: 'healthy' },
  },
  // Monitoring
  {
    type: 'logger',
    label: 'Logger',
    icon: 'FileText',
    color: '#64748b',
    category: 'Monitoring',
    defaultData: { throughput: 50000, latency: 2, capacity: 500000, status: 'healthy' },
  },
  {
    type: 'healthCheck',
    label: 'Health Check',
    icon: 'HeartPulse',
    color: '#22c55e',
    category: 'Monitoring',
    defaultData: { throughput: 1000, latency: 5, capacity: 10000, status: 'healthy' },
  },
  {
    type: 'metricsCollector',
    label: 'Metrics Collector',
    icon: 'BarChart3',
    color: '#8b5cf6',
    category: 'Monitoring',
    defaultData: { throughput: 20000, latency: 10, capacity: 200000, status: 'healthy' },
  },
];

const configByType: Map<NodeBreakerNodeType, ComponentTypeConfig> = new Map(
  COMPONENT_TYPE_CONFIGS.map((c) => [c.type, c])
);

export function getComponentConfig(type: string): ComponentTypeConfig | undefined {
  return configByType.get(type as NodeBreakerNodeType);
}

export const PALETTE_CATEGORY_ORDER = [
  'Traffic & Edge',
  'Network',
  'Compute',
  'Data',
  'Messaging',
  'Security',
  'Monitoring',
] as const;

export { createDefaultNodeData } from './defaults';
