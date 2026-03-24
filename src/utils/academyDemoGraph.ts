import { createDefaultNodeData } from '@/constants/defaults';
import type { SimulatorDemo } from '@/constants/curriculum';
import { getTemplateById } from '@/constants/templates';
import type { FlowEdge, FlowNode, NodeBreakerNodeData } from '@/types';

export function buildGraphFromSimulatorDemo(demo: SimulatorDemo): { nodes: FlowNode[]; edges: FlowEdge[] } {
  if (demo.templateId) {
    const template = getTemplateById(demo.templateId);
    if (template) return template.build();
  }

  const setup = demo.setupNodes;
  if (!setup?.length) {
    return { nodes: [], edges: [] };
  }

  const nodes: FlowNode[] = setup.map((sn) => {
    const base = createDefaultNodeData(sn.type, sn.label, {
      throughput: 10000,
      latency: 10,
      capacity: 50000,
      status: 'healthy',
    });
    const merged = { ...base, ...(sn.data ?? {}) } as NodeBreakerNodeData;
    return {
      id: crypto.randomUUID(),
      type: sn.type,
      position: { x: sn.position.x, y: sn.position.y },
      selected: false,
      data: merged,
    };
  });

  const edges: FlowEdge[] = (demo.setupEdges ?? []).map((e, i) => ({
    id: `academy-edge-${i}`,
    source: nodes[e.source]!.id,
    target: nodes[e.target]!.id,
    type: 'animated',
  }));

  return { nodes, edges };
}
