import type { NodeProps } from '@xyflow/react';
import { getComponentConfig } from '@/constants/components';
import type { FlowNode } from '@/types';
import { BaseNode } from './BaseNode';
import { getNodeIcon } from './nodeIcons';

export function QueueNode(props: NodeProps<FlowNode>) {
  const cfg = getComponentConfig('queue');
  return (
    <BaseNode
      {...props}
      icon={getNodeIcon(cfg?.icon ?? 'Layers')}
      accentColor={cfg?.color ?? '#f97316'}
    />
  );
}
