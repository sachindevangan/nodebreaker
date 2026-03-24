import type { NodeBreakerNodeData, NodeBreakerNodeType } from '@/types';

/**
 * Full default `data` for a new node of each type (Phase 2 extended fields + Batch 1 extras).
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
    case 'lambda':
      return {
        ...shared,
        coldStartMs: 500,
        timeoutMs: 30000,
      };
    case 'container':
      return {
        ...shared,
        replicas: 3,
        cpuLimit: '1000m',
      };
    case 'search':
      return {
        ...shared,
        indexCount: 10,
        shardCount: 5,
      };
    case 'kafka':
      return {
        ...shared,
        partitions: 12,
        replicationFactor: 3,
      };
    case 'authService':
      return {
        ...shared,
        tokenTTL: 3600,
        maxSessions: 10000,
      };
    case 'rateLimiter':
      return {
        ...shared,
        maxRequestsPerMin: 1000,
        windowMs: 60000,
      };
    default:
      return shared;
  }
}
