import type { NodeProps } from '@xyflow/react';
import { getComponentConfig } from '@/constants/components';
import type { FlowNode } from '@/types';
import { BaseNode } from './BaseNode';
import { getNodeIcon } from './nodeIcons';

export function CacheNode(props: NodeProps<FlowNode>) {
  const cfg = getComponentConfig('cache');
  return (
    <BaseNode
      {...props}
      icon={getNodeIcon(cfg?.icon ?? 'Zap')}
      accentColor={cfg?.color ?? '#f59e0b'}
    />
  );
}
