import type { NodeProps } from '@xyflow/react';
import { getComponentConfig } from '@/constants/components';
import type { FlowNode } from '@/types';
import { BaseNode } from './BaseNode';
import { getNodeIcon } from './nodeIcons';

export function ServiceNode(props: NodeProps<FlowNode>) {
  const cfg = getComponentConfig('service');
  return (
    <BaseNode
      {...props}
      icon={getNodeIcon(cfg?.icon ?? 'Server')}
      accentColor={cfg?.color ?? '#3b82f6'}
    />
  );
}
