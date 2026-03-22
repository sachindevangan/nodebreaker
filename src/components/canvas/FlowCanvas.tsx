import type { FinalConnectionState, OnConnectEnd, OnConnectStart } from '@xyflow/react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { useFlowStore } from '@/store/useFlowStore';
import { useDragToCanvas } from '@/hooks/useDragToCanvas';
import { getComponentConfig } from '@/constants/components';
import { flowNodeTypes } from '@/components/canvas/nodes';

const defaultEdgeOptions = {
  type: 'smoothstep' as const,
  animated: true,
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

  const { screenToFlowPosition } = useReactFlow();
  const { onDragOver, onDrop } = useDragToCanvas(screenToFlowPosition);

  const onConnectStart: OnConnectStart = (_evt, params) => {
    // #region agent log
    fetch('http://127.0.0.1:7699/ingest/1f64e223-b5c9-4f0c-bf28-285d4e212d98', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '370d51',
      },
      body: JSON.stringify({
        sessionId: '370d51',
        runId: 'pre-fix',
        hypothesisId: 'H3-H4',
        location: 'FlowCanvas.tsx:onConnectStart',
        message: 'connection drag started',
        data: {
          nodeId: params.nodeId,
          handleId: params.handleId,
          handleType: params.handleType,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  };

  const onConnectEnd: OnConnectEnd = (_evt, state) => {
    // #region agent log
    const s = state as FinalConnectionState;
    fetch('http://127.0.0.1:7699/ingest/1f64e223-b5c9-4f0c-bf28-285d4e212d98', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '370d51',
      },
      body: JSON.stringify({
        sessionId: '370d51',
        runId: 'pre-fix',
        hypothesisId: 'H3-H4',
        location: 'FlowCanvas.tsx:onConnectEnd',
        message: 'connection gesture ended',
        data: {
          fromNode: s.fromHandle?.nodeId,
          toHandleNode: s.toHandle?.nodeId,
          isValid: s.isValid,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      nodeTypes={flowNodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onDragOver={onDragOver}
      onDrop={onDrop}
      colorMode="dark"
      deleteKeyCode={['Backspace', 'Delete']}
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
    <div className="h-full min-h-0 w-full flex-1">
      <ReactFlowProvider>
        <FlowCanvasInner />
      </ReactFlowProvider>
    </div>
  );
}
