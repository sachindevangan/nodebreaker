import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import type { OnSelectionChangeFunc } from '@xyflow/react';
import { useCallback } from 'react';
import { useFlowStore } from '@/store/useFlowStore';
import { useDragToCanvas } from '@/hooks/useDragToCanvas';
import { useSimulation } from '@/hooks/useSimulation';
import { getComponentConfig } from '@/constants/components';
import { flowNodeTypes } from '@/components/canvas/nodes';
import type { FlowEdge, FlowNode } from '@/types';
import { AnimatedEdge } from './AnimatedEdge';

const edgeTypes = {
  animated: AnimatedEdge,
};

const defaultEdgeOptions = {
  type: 'animated' as const,
  animated: false,
  style: {
    stroke: '#3b82f6',
    strokeWidth: 2,
    filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.55))',
  },
};

function FlowCanvasInner() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const clearSelectedNode = useFlowStore((s) => s.clearSelectedNode);
  const setSelectedNodeId = useFlowStore((s) => s.setSelectedNodeId);

  useSimulation();

  const { screenToFlowPosition } = useReactFlow();
  const { onDragOver, onDrop } = useDragToCanvas(screenToFlowPosition);

  const onSelectionChange = useCallback<OnSelectionChangeFunc<FlowNode, FlowEdge>>(
    ({ nodes: selectedNodes }) => {
      setSelectedNodeId(selectedNodes.length === 1 ? selectedNodes[0]!.id : null);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    clearSelectedNode();
  }, [clearSelectedNode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onSelectionChange={onSelectionChange}
      nodeTypes={flowNodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onPaneClick={onPaneClick}
      colorMode="dark"
      deleteKeyCode={null}
      multiSelectionKeyCode="Shift"
      proOptions={{ hideAttribution: true }}
      className="bg-zinc-950"
    >
      <Background
        id="nodebreaker-dots"
        gap={20}
        size={1.25}
        color="rgb(63 63 70 / 0.45)"
        variant={BackgroundVariant.Dots}
      />
      <Controls
        position="bottom-left"
        showInteractive={false}
        className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/95 shadow-xl [&_button]:border-zinc-600 [&_button]:bg-zinc-800 [&_button]:fill-zinc-200 [&_button:hover]:bg-zinc-700"
      />
      <MiniMap
        position="bottom-right"
        className="overflow-hidden rounded-lg border border-zinc-700 shadow-xl"
        bgColor="rgb(9 9 11)"
        maskColor="rgb(24 24 27 / 0.92)"
        maskStrokeColor="rgb(63 63 70)"
        nodeStrokeWidth={2}
        nodeColor={(node) => {
          const t = node.type;
          if (!t) return 'rgb(82 82 91)';
          return getComponentConfig(t)?.color ?? 'rgb(82 82 91)';
        }}
        nodeStrokeColor={(node) =>
          node.selected ? 'rgb(228 228 231)' : 'rgb(39 39 42)'
        }
      />
    </ReactFlow>
  );
}

export function FlowCanvas() {
  return (
    <div className="h-full min-h-0 w-full min-w-0 flex-1">
      <ReactFlowProvider>
        <FlowCanvasInner />
      </ReactFlowProvider>
    </div>
  );
}
