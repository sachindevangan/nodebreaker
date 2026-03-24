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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFlowStore } from '@/store/useFlowStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useDragToCanvas } from '@/hooks/useDragToCanvas';
import { useSimulation } from '@/hooks/useSimulation';
import { getComponentConfig } from '@/constants/components';
import { flowNodeTypes } from '@/components/canvas/nodes';
import { useThemeStore } from '@/store/useThemeStore';
import type { FlowEdge, FlowNode } from '@/types';
import { AnimatedEdge } from './AnimatedEdge';
import {
  CanvasContextMenu,
  type CanvasContextMenuState,
} from '@/components/canvas/CanvasContextMenu';
import { EmptyState } from '@/components/canvas/EmptyState';

declare global {
  interface Window {
    __nbFitViewForExport?: () => void;
  }
}

const edgeTypes = {
  animated: AnimatedEdge,
};

function FlowCanvasInner() {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';
  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'animated' as const,
      animated: false,
      selectable: true,
      deletable: true,
      interactionWidth: 20,
      style: {
        stroke: isLight ? '#1e40af' : '#3b82f6',
        strokeWidth: 2,
        filter: isLight
          ? 'drop-shadow(0 0 2px rgba(30, 64, 175, 0.35))'
          : 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.55))',
      },
    }),
    [isLight]
  );
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

  useEffect(() => {
    window.__nbFitViewForExport = () => {
      fitView({ padding: 0.2, duration: 250 });
    };
    return () => {
      window.__nbFitViewForExport = undefined;
    };
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
      colorMode={isLight ? 'light' : 'dark'}
      deleteKeyCode={['Delete', 'Backspace']}
      multiSelectionKeyCode="Shift"
      proOptions={{ hideAttribution: true }}
      className="h-full w-full bg-[var(--canvas-bg)]"
    >
      <Background
        id="nodebreaker-dots"
        gap={20}
        size={1.25}
        color="var(--canvas-dots)"
        variant={BackgroundVariant.Dots}
      />
      <Controls
        position="bottom-left"
        showInteractive={false}
        className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]/95 shadow-xl [&_button]:border-[var(--border)] [&_button]:bg-[var(--surface)] [&_button]:fill-[var(--text)] [&_button:hover]:bg-[var(--surface-hover)]"
      />
      <MiniMap
        position="bottom-right"
        className="overflow-hidden rounded-lg border border-[var(--border)] shadow-xl"
        bgColor={isLight ? 'rgb(255 255 255)' : 'rgb(9 9 11)'}
        maskColor={isLight ? 'rgb(226 232 240 / 0.9)' : 'rgb(24 24 27 / 0.92)'}
        maskStrokeColor={isLight ? 'rgb(148 163 184)' : 'rgb(63 63 70)'}
        nodeStrokeWidth={2}
        nodeColor={(node) => {
          const t = node.type;
          if (!t) return 'rgb(82 82 91)';
          return getComponentConfig(t)?.color ?? 'rgb(82 82 91)';
        }}
        nodeStrokeColor={(node) =>
          node.selected ? (isLight ? 'rgb(30 41 59)' : 'rgb(228 228 231)') : isLight ? 'rgb(148 163 184)' : 'rgb(39 39 42)'
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
