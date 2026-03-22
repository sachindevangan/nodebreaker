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
import { getClipboardBlueprint, setClipboardFromNode } from '@/utils/nodeClipboard';
import { useChaosStore } from './useChaosStore';

export interface FlowStore {
  nodes: FlowNode[];
  edges: FlowEdge[];
  /** Single selected node id for properties panel; kept in sync with React Flow selection */
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  /** Selects one node on the canvas and syncs `selected` flags for React Flow. */
  selectNodeOnCanvas: (id: string) => void;
  clearSelectedNode: () => void;
  onNodesChange: OnNodesChange<FlowNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: FlowNode) => void;
  /** Replaces the entire graph (clears selection). Callers should stop simulation / clear chaos if needed. */
  replaceGraph: (nodes: FlowNode[], edges: FlowEdge[]) => void;
  duplicateNode: (id: string) => void;
  /** Pastes clipboard blueprint at flow coordinates. Returns false if clipboard empty. */
  pasteNodeAt: (x: number, y: number) => boolean;
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
  selectNodeOnCanvas: (id: string) => {
    set({
      selectedNodeId: id,
      nodes: get().nodes.map((n) => ({ ...n, selected: n.id === id })),
    });
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
  replaceGraph: (nodes, edges) => {
    set({
      nodes: nodes.map((n) => ({ ...n, selected: false })),
      edges,
      selectedNodeId: null,
    });
  },
  duplicateNode: (id: string) => {
    const src = get().nodes.find((n) => n.id === id);
    if (!src) return;
    const copy: FlowNode = {
      ...src,
      id: crypto.randomUUID(),
      position: { x: src.position.x + 50, y: src.position.y + 50 },
      selected: true,
    };
    set({
      nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), { ...copy, selected: true }],
      selectedNodeId: copy.id,
    });
    const created = get().nodes.find((n) => n.id === copy.id);
    if (created) setClipboardFromNode(created);
  },
  pasteNodeAt: (x, y) => {
    const bp = getClipboardBlueprint();
    if (!bp) return false;
    const newNode: FlowNode = {
      id: crypto.randomUUID(),
      type: bp.type,
      position: { x, y },
      selected: true,
      data: { ...bp.data },
    };
    set({
      nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), { ...newNode, selected: true }],
      selectedNodeId: newNode.id,
    });
    return true;
  },
  updateNodeData: (id: string, partial: Partial<NodeBreakerNodeData>) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...partial } } : n
      ),
    });
  },
  deleteNode: (id: string) => {
    useChaosStore.getState().removeEventsForNode(id);
    const { nodes, edges, selectedNodeId } = get();
    set({
      nodes: nodes.filter((n) => n.id !== id),
      edges: edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: selectedNodeId === id ? null : selectedNodeId,
    });
  },
}));
