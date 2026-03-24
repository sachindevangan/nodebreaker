import type { NodeTypes } from '@xyflow/react';
import { COMPONENT_TYPE_CONFIGS } from '@/constants/components';
import { ConfigurableNode } from './ConfigurableNode';

export { BaseNode } from './BaseNode';
export { ConfigurableNode } from './ConfigurableNode';
export { getNodeIcon } from './nodeIcons';

/** All node types use ConfigurableNode, keyed by component type from config. */
export const flowNodeTypes: NodeTypes = Object.fromEntries(
  COMPONENT_TYPE_CONFIGS.map((c) => [c.type, ConfigurableNode])
) as NodeTypes;
