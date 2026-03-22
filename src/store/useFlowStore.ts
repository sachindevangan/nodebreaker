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
import type { FlowEdge, FlowNode, NodeBreakerNodeData } from '@/types';

export interface FlowStore {
  nodes: FlowNode[];
  edges: FlowEdge[];
  /** Single selected node id for properties panel; kept in sync with React Flow selection */
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  clearSelectedNode: () => void;
  onNodesChange: OnNodesChange<FlowNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: FlowNode) => void;
  updateNodeData: (id: string, partial: Partial<NodeBreakerNodeData>) => void;
  deleteNode: (id: string) => void;
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  setSelectedNodeId: (id: string | null) => {
    set({ selectedNodeId: id });
  },
  clearSelectedNode: () => {
    set({
      selectedNodeId: null,
      nodes: get().nodes.map((n) => ({ ...n, selected: false })),
    });
  },
  onNodesChange: (changes: NodeChange<FlowNode>[]) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection: Connection) => {
    set({ edges: addEdge<FlowEdge>(connection, get().edges) });
  },
  addNode: (node: FlowNode) => {
    set({ nodes: [...get().nodes, node] });
  },
  updateNodeData: (id: string, partial: Partial<NodeBreakerNodeData>) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...partial } } : n
      ),
    });
  },
  deleteNode: (id: string) => {
    const { nodes, edges, selectedNodeId } = get();
    set({
      nodes: nodes.filter((n) => n.id !== id),
      edges: edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: selectedNodeId === id ? null : selectedNodeId,
    });
  },
}));
