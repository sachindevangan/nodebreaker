import type { ChaosEventType } from '@/simulation/chaos';

export type ChaosPaletteIconName =
  | 'Skull'
  | 'Clock'
  | 'TrendingDown'
  | 'WifiOff'
  | 'HardDrive'
  | 'Unplug'
  | 'Flame'
  | 'Cpu';

export interface ChaosEventDefinition {
  type: ChaosEventType;
  label: string;
  icon: ChaosPaletteIconName;
  color: string;
  description: string;
  defaultDuration: number;
  defaultConfig: Record<string, number>;
}

export const CHAOS_EVENT_DEFINITIONS: readonly ChaosEventDefinition[] = [
  {
    type: 'node_crash',
    label: 'Node Crash',
    icon: 'Skull',
    color: '#ef4444',
    description: 'Completely kills the node. Zero throughput.',
    defaultDuration: -1,
    defaultConfig: {},
  },
  {
    type: 'latency_spike',
    label: 'Latency Spike',
    icon: 'Clock',
    color: '#f59e0b',
    description: 'Multiplies node latency dramatically.',
    defaultDuration: 50,
    defaultConfig: { multiplier: 10 },
  },
  {
    type: 'capacity_drop',
    label: 'Capacity Drop',
    icon: 'TrendingDown',
    color: '#f97316',
    description: 'Reduces throughput by a percentage.',
    defaultDuration: 100,
    defaultConfig: { percentage: 50 },
  },
  {
    type: 'packet_loss',
    label: 'Packet Loss',
    icon: 'WifiOff',
    color: '#a855f7',
    description: 'Randomly drops a percentage of requests.',
    defaultDuration: 80,
    defaultConfig: { percentage: 30 },
  },
  {
    type: 'memory_pressure',
    label: 'Memory Pressure',
    icon: 'HardDrive',
    color: '#ec4899',
    description: 'Throughput degrades gradually over time.',
    defaultDuration: 200,
    defaultConfig: { degradePerTick: 0.5 },
  },
  {
    type: 'network_partition',
    label: 'Network Partition',
    icon: 'Unplug',
    color: '#64748b',
    description: 'Severs connections involving this node.',
    defaultDuration: -1,
    defaultConfig: {},
  },
  {
    type: 'cascading_failure',
    label: 'Cascading Failure',
    icon: 'Flame',
    color: '#dc2626',
    description: 'Overloaded nodes degrade connected downstream neighbors.',
    defaultDuration: -1,
    defaultConfig: { latencyPenalty: 20 },
  },
  {
    type: 'cpu_spike',
    label: 'CPU Spike',
    icon: 'Cpu',
    color: '#6366f1',
    description: 'Adds significant processing latency.',
    defaultDuration: 60,
    defaultConfig: { addedMs: 200 },
  },
] as const;

const byType: Map<ChaosEventType, ChaosEventDefinition> = new Map(
  CHAOS_EVENT_DEFINITIONS.map((d) => [d.type, d])
);

export function getChaosEventDefinition(type: ChaosEventType): ChaosEventDefinition | undefined {
  return byType.get(type);
}

export const CHAOS_TYPES_ORDER: readonly ChaosEventType[] = CHAOS_EVENT_DEFINITIONS.map((d) => d.type);
