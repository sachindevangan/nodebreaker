import type { NodeProps } from '@xyflow/react';
import { getComponentConfig } from '@/constants/components';
import type { FlowNode } from '@/types';
import { BaseNode } from './BaseNode';
import { getNodeIcon } from './nodeIcons';

export function CDNNode(props: NodeProps<FlowNode>) {
  const cfg = getComponentConfig('cdn');
  return (
    <BaseNode
      {...props}
      icon={getNodeIcon(cfg?.icon ?? 'Globe')}
      accentColor={cfg?.color ?? '#22c55e'}
    />
  );
}
