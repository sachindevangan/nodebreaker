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
  /** Lambda */
  coldStartMs?: number;
  timeoutMs?: number;
  /** Container */
  replicas?: number;
  cpuLimit?: string;
  /** Search */
  indexCount?: number;
  shardCount?: number;
  /** Kafka */
  partitions?: number;
  replicationFactor?: number;
  /** AuthService */
  tokenTTL?: number;
  maxSessions?: number;
  /** RateLimiter */
  maxRequestsPerMin?: number;
  windowMs?: number;
}

export type NodeBreakerNodeType =
  | 'loadBalancer'
  | 'cdn'
  | 'dns'
  | 'apiGateway'
  | 'waf'
  | 'ingress'
  | 'service'
  | 'worker'
  | 'lambda'
  | 'container'
  | 'cronJob'
  | 'database'
  | 'cache'
  | 'search'
  | 'dataWarehouse'
  | 'blobStorage'
  | 'objectStore'
  | 'queue'
  | 'kafka'
  | 'eventBus'
  | 'pubSub'
  | 'reverseProxy'
  | 'edgeRouter'
  | 'loadBalancerL4'
  | 'loadBalancerL7'
  | 'authService'
  | 'rateLimiter'
  | 'firewall'
  | 'logger'
  | 'healthCheck'
  | 'metricsCollector';

export type FlowNode = Node<NodeBreakerNodeData, NodeBreakerNodeType>;
export type FlowEdge = Edge;
