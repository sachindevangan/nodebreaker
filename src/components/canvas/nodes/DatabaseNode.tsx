import type { NodeProps } from '@xyflow/react';
import { getComponentConfig } from '@/constants/components';
import type { FlowNode } from '@/types';
import { BaseNode } from './BaseNode';
import { getNodeIcon } from './nodeIcons';

export function DatabaseNode(props: NodeProps<FlowNode>) {
  const cfg = getComponentConfig('database');
  return (
    <BaseNode
      {...props}
      icon={getNodeIcon(cfg?.icon ?? 'Database')}
      accentColor={cfg?.color ?? '#a855f7'}
    />
  );
}
