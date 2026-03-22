import type { NodeTypes } from '@xyflow/react';
import { CacheNode } from './CacheNode';
import { CDNNode } from './CDNNode';
import { DatabaseNode } from './DatabaseNode';
import { LoadBalancerNode } from './LoadBalancerNode';
import { QueueNode } from './QueueNode';
import { ServiceNode } from './ServiceNode';

export { BaseNode } from './BaseNode';
export { CacheNode } from './CacheNode';
export { CDNNode } from './CDNNode';
export { DatabaseNode } from './DatabaseNode';
export { LoadBalancerNode } from './LoadBalancerNode';
export { QueueNode } from './QueueNode';
export { ServiceNode } from './ServiceNode';
export { getNodeIcon } from './nodeIcons';

export const flowNodeTypes = {
  loadBalancer: LoadBalancerNode,
  service: ServiceNode,
  database: DatabaseNode,
  cache: CacheNode,
  queue: QueueNode,
  cdn: CDNNode,
} as const satisfies NodeTypes;
