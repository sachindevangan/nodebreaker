import type { NodeProps } from '@xyflow/react';
import { getComponentConfig } from '@/constants/components';
import type { FlowNode } from '@/types';
import { BaseNode } from './BaseNode';
import { getNodeIcon } from './nodeIcons';

export function LoadBalancerNode(props: NodeProps<FlowNode>) {
  const cfg = getComponentConfig('loadBalancer');
  return (
    <BaseNode
      {...props}
      icon={getNodeIcon(cfg?.icon ?? 'GitBranch')}
      accentColor={cfg?.color ?? '#06b6d4'}
    />
  );
}
