import { useCallback } from 'react';
import type { DragEvent } from 'react';
import type { XYPosition } from '@xyflow/react';
import { createDefaultNodeData, getComponentConfig } from '@/constants/components';
import { useFlowStore } from '@/store/useFlowStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import type { FlowNode, NodeBreakerNodeType } from '@/types';

export const NODEBREAKER_DRAG_MIME = 'application/nodebreaker';

export function useDragToCanvas(
  screenToFlowPosition: (clientPosition: XYPosition) => XYPosition
) {
  const addNode = useFlowStore((s) => s.addNode);

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const raw = event.dataTransfer.getData(NODEBREAKER_DRAG_MIME);
      if (!raw) return;

      const nodeType = raw as NodeBreakerNodeType;
      const config = getComponentConfig(nodeType);
      if (!config) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: FlowNode = {
        id: crypto.randomUUID(),
        type: nodeType,
        position,
        data: createDefaultNodeData(nodeType, config.label, config.defaultData),
      };

      const { nodes, edges } = useFlowStore.getState();
      useHistoryStore.getState().recordSnapshot(nodes, edges);
      addNode(newNode);
    },
    [addNode, screenToFlowPosition]
  );

  return { onDragOver, onDrop };
}
