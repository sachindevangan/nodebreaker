import type { NodeBreakerNodeData, NodeBreakerNodeType } from '@/types';

/**
 * Full default `data` for a new node of each type (Phase 2 extended fields).
 */
export function createDefaultNodeData(
  type: NodeBreakerNodeType,
  label: string,
  base: Pick<NodeBreakerNodeData, 'throughput' | 'latency' | 'capacity' | 'status'>
): NodeBreakerNodeData {
  const shared: NodeBreakerNodeData = {
    label,
    throughput: base.throughput,
    latency: base.latency,
    capacity: base.capacity,
    status: base.status,
  };

  switch (type) {
    case 'loadBalancer':
      return {
        ...shared,
        algorithm: 'round_robin',
        rateLimiting: false,
        rateLimitRps: null,
      };
    case 'database':
      return {
        ...shared,
        readReplicas: 2,
        connectionPoolSize: 20,
      };
    case 'cache':
      return {
        ...shared,
        ttlSeconds: 300,
        maxMemoryMb: 512,
      };
    case 'queue':
      return {
        ...shared,
        maxQueueDepth: 10000,
        consumerCount: 4,
      };
    default:
      return shared;
  }
}
