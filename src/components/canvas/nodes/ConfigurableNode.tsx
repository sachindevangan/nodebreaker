import type { NodeProps } from '@xyflow/react';
import { getComponentConfig } from '@/constants/components';
import type { FlowNode } from '@/types';
import { BaseNode } from './BaseNode';
import { getNodeIcon } from './nodeIcons';

/** Renders any component type via BaseNode using config from constants. */
export function ConfigurableNode(props: NodeProps<FlowNode>) {
  const nodeType = props.type ?? 'service';
  const cfg = getComponentConfig(nodeType);
  const icon = cfg ? getNodeIcon(cfg.icon) : getNodeIcon('Server');
  const accentColor = cfg?.color ?? '#3b82f6';
  return <BaseNode {...props} icon={icon} accentColor={accentColor} />;
}
