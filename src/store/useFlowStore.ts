import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import { create } from 'zustand';
import type { FlowEdge, FlowNode } from '@/types';

export interface FlowStore {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange: OnNodesChange<FlowNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: FlowNode) => void;
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes: NodeChange<FlowNode>[]) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection: Connection) => {
    // #region agent log
    const prevLen = get().edges.length;
    // #endregion
    const nextEdges = addEdge<FlowEdge>(connection, get().edges);
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
        hypothesisId: 'H1-H2',
        location: 'useFlowStore.ts:onConnect',
        message: 'onConnect invoked',
        data: {
          connection,
          prevEdgeCount: prevLen,
          nextEdgeCount: nextEdges.length,
          edgeAdded: nextEdges.length > prevLen,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    set({ edges: nextEdges });
  },
  addNode: (node: FlowNode) => {
    set({ nodes: [...get().nodes, node] });
  },
}));
