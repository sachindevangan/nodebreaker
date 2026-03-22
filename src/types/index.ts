import type { Edge, Node } from '@xyflow/react';

export type NodeStatus = 'healthy' | 'degraded' | 'down';

export type LoadBalancerAlgorithm = 'round_robin' | 'least_connections' | 'random';

export interface NodeBreakerNodeData extends Record<string, unknown> {
  label: string;
  throughput: number;
  latency: number;
  capacity: number;
  status: NodeStatus;
  /** Load balancer */
  algorithm?: LoadBalancerAlgorithm;
  rateLimiting?: boolean;
  rateLimitRps?: number | null;
  /** Database */
  readReplicas?: number;
  connectionPoolSize?: number;
  /** Cache */
  ttlSeconds?: number;
  maxMemoryMb?: number;
  /** Queue */
  maxQueueDepth?: number;
  consumerCount?: number;
}

export type NodeBreakerNodeType =
  | 'loadBalancer'
  | 'service'
  | 'database'
  | 'cache'
  | 'queue'
  | 'cdn';

export type FlowNode = Node<NodeBreakerNodeData, NodeBreakerNodeType>;
export type FlowEdge = Edge;
