import { useCallback } from 'react';
import type { DragEvent } from 'react';
import type { Node, XYPosition } from '@xyflow/react';
import { createDefaultNodeData, getComponentConfig } from '@/constants/components';
import { isChaosEventType } from '@/simulation/chaos';
import { useFlowStore } from '@/store/useFlowStore';
import { useChaosStore } from '@/store/useChaosStore';
import { useSimStore } from '@/store/useSimStore';
import { useToastStore } from '@/store/useToastStore';
import type { FlowNode, NodeBreakerNodeType } from '@/types';

export const NODEBREAKER_DRAG_MIME = 'application/nodebreaker';
export const NODEBREAKER_CHAOS_MIME = 'application/nodebreaker-chaos';

const DEFAULT_NODE_W = 150;
const DEFAULT_NODE_H = 110;

export function findTopNodeAtFlowPoint(nodes: Node[], p: XYPosition): Node | null {
  const hits = nodes
    .map((n) => {
      const w = n.measured?.width ?? DEFAULT_NODE_W;
      const h = n.measured?.height ?? DEFAULT_NODE_H;
      return { n, w, h, z: n.zIndex ?? 0 };
    })
    .filter(
      ({ n, w, h }) =>
        p.x >= n.position.x &&
        p.x <= n.position.x + w &&
        p.y >= n.position.y &&
        p.y <= n.position.y + h
    )
    .sort((a, b) => a.z - b.z);
  return hits[hits.length - 1]?.n ?? null;
}

export function useDragToCanvas(
  screenToFlowPosition: (clientPosition: XYPosition) => XYPosition,
  getNodes?: () => Node[]
) {
  const addNode = useFlowStore((s) => s.addNode);

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const chaosRaw = event.dataTransfer.getData(NODEBREAKER_CHAOS_MIME);
      if (chaosRaw) {
        if (!getNodes) return;
        if (!isChaosEventType(chaosRaw)) return;
        const flowPoint = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const hit = findTopNodeAtFlowPoint(getNodes(), flowPoint);
        if (!hit) {
          useToastStore.getState().push({
            kind: 'error',
            message: 'Drop chaos events on a node',
          });
          return;
        }
        const startTick = useSimStore.getState().tickCount;
        useChaosStore.getState().injectChaos(chaosRaw, hit.id, { startTick });
        return;
      }

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

      addNode(newNode);
    },
    [addNode, getNodes, screenToFlowPosition]
  );

  return { onDragOver, onDrop };
}
