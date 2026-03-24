import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import type { Connection, OnSelectionChangeFunc } from '@xyflow/react';
import { useCallback, useState } from 'react';
import { useFlowStore } from '@/store/useFlowStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useDragToCanvas } from '@/hooks/useDragToCanvas';
import { useSimulation } from '@/hooks/useSimulation';
import { getComponentConfig } from '@/constants/components';
import { flowNodeTypes } from '@/components/canvas/nodes';
import type { FlowEdge, FlowNode } from '@/types';
import { AnimatedEdge } from './AnimatedEdge';
import {
  CanvasContextMenu,
  type CanvasContextMenuState,
} from '@/components/canvas/CanvasContextMenu';
import { EmptyState } from '@/components/canvas/EmptyState';

const edgeTypes = {
  animated: AnimatedEdge,
};

const defaultEdgeOptions = {
  type: 'animated' as const,
  animated: false,
  selectable: true,
  deletable: true,
  interactionWidth: 20,
  style: {
    stroke: '#3b82f6',
    strokeWidth: 2,
    filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.55))',
  },
};

function FlowCanvasInner() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const storeOnNodesChange = useFlowStore((s) => s.onNodesChange);
  const storeOnEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const storeOnConnect = useFlowStore((s) => s.onConnect);

  const onNodesChange = useCallback(
    (changes: Parameters<typeof storeOnNodesChange>[0]) => {
      const hasRemove = changes.some((c) => c.type === 'remove');
      if (hasRemove) {
        const { nodes, edges } = useFlowStore.getState();
        useHistoryStore.getState().recordSnapshot(nodes, edges);
      }
      storeOnNodesChange(changes);
    },
    [storeOnNodesChange]
  );

  const onEdgesChange = useCallback(
    (changes: Parameters<typeof storeOnEdgesChange>[0]) => {
      const hasRemove = changes.some((c) => c.type === 'remove');
      if (hasRemove) {
        const { nodes, edges } = useFlowStore.getState();
        useHistoryStore.getState().recordSnapshot(nodes, edges);
      }
      storeOnEdgesChange(changes);
    },
    [storeOnEdgesChange]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const { nodes, edges } = useFlowStore.getState();
      useHistoryStore.getState().recordSnapshot(nodes, edges);
      storeOnConnect(connection);
    },
    [storeOnConnect]
  );

  const onNodeDragStart = useCallback(() => {
    const { nodes, edges } = useFlowStore.getState();
    useHistoryStore.getState().recordSnapshot(nodes, edges);
  }, []);
  const clearSelectedNode = useFlowStore((s) => s.clearSelectedNode);
  const setSelectedNodeId = useFlowStore((s) => s.setSelectedNodeId);

  const [contextMenu, setContextMenu] = useState<CanvasContextMenuState>({ kind: 'closed' });

  useSimulation();

  const { screenToFlowPosition, fitView } = useReactFlow();
  const { onDragOver, onDrop } = useDragToCanvas(screenToFlowPosition);

  const onSelectionChange = useCallback<OnSelectionChangeFunc<FlowNode, FlowEdge>>(
    ({ nodes: selectedNodes }) => {
      setSelectedNodeId(selectedNodes.length === 1 ? selectedNodes[0]!.id : null);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    clearSelectedNode();
    setContextMenu({ kind: 'closed' });
  }, [clearSelectedNode]);

  const onNodeContextMenu = useCallback((e: { preventDefault: () => void; clientX: number; clientY: number }, node: FlowNode) => {
    e.preventDefault();
    setContextMenu({
      kind: 'node',
      clientX: e.clientX,
      clientY: e.clientY,
      nodeId: node.id,
    });
  }, []);

  const onPaneContextMenu = useCallback(
    (e: { preventDefault: () => void; clientX: number; clientY: number }) => {
      e.preventDefault();
      const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setContextMenu({
        kind: 'pane',
        clientX: e.clientX,
        clientY: e.clientY,
        flowX: p.x,
        flowY: p.y,
      });
    },
    [screenToFlowPosition]
  );

  const onFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 200 });
  }, [fitView]);

  return (
    <div className="relative h-full w-full min-h-0 min-w-0">
      <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onSelectionChange={onSelectionChange}
      onNodeContextMenu={onNodeContextMenu}
      onNodeDragStart={onNodeDragStart}
      onEdgeContextMenu={(e, edge) => {
        e.preventDefault();
        setContextMenu({
          kind: 'edge',
          clientX: e.clientX,
          clientY: e.clientY,
          edgeId: edge.id,
        });
      }}
      onPaneContextMenu={onPaneContextMenu}
      nodeTypes={flowNodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onPaneClick={onPaneClick}
      colorMode="dark"
      deleteKeyCode={['Delete', 'Backspace']}
      multiSelectionKeyCode="Shift"
      proOptions={{ hideAttribution: true }}
      className="h-full w-full bg-zinc-950"
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
      <EmptyState />
      <CanvasContextMenu
        menu={contextMenu}
        onClose={() => setContextMenu({ kind: 'closed' })}
        onFitView={onFitView}
      />
    </div>
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
