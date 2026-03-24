import type { ChaosEventType } from '@/simulation/chaos';

const CHAOS_TYPES = new Set<string>([
  'node_crash',
  'latency_spike',
  'capacity_drop',
  'packet_loss',
  'memory_pressure',
  'network_partition',
  'cascading_failure',
  'cpu_spike',
]);

export function parseChaosEventType(raw: string): ChaosEventType | null {
  const t = raw.trim();
  return CHAOS_TYPES.has(t) ? (t as ChaosEventType) : null;
}
