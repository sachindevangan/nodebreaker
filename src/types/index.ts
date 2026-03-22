import type { Edge, Node } from '@xyflow/react';

export type NodeStatus = 'healthy' | 'degraded' | 'down';

export interface NodeBreakerNodeData extends Record<string, unknown> {
  label: string;
  throughput: number;
  latency: number;
  capacity: number;
  status: NodeStatus;
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
