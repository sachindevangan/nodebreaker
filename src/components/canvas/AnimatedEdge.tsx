import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { memo, useMemo } from 'react';
import { useSimStore } from '@/store/useSimStore';

const MAX_DOTS = 14;

function TrafficDots({
  edgePath,
  count,
  overload,
  edgeDomId,
}: {
  edgePath: string;
  count: number;
  overload: boolean;
  edgeDomId: string;
}) {
  const n = Math.min(MAX_DOTS, Math.max(0, count));
  const fill = overload ? '#f87171' : '#60a5fa';
  const glow = overload ? 'rgba(248,113,113,0.95)' : 'rgba(96,165,250,0.95)';

  return (
    <g className="pointer-events-none">
      {Array.from({ length: n }, (_, i) => (
        <circle
          key={`${edgeDomId}-dot-${i}`}
          r={3}
          fill={fill}
          style={{ filter: `drop-shadow(0 0 5px ${glow})` }}
        >
          <animateMotion
            dur={`${1.1 + (i % 5) * 0.12}s`}
            repeatCount="indefinite"
            path={edgePath}
            begin={`${i * 0.09}s`}
            calcMode="linear"
            rotate="auto"
          />
        </circle>
      ))}
    </g>
  );
}

function AnimatedEdgeInner(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerStart,
    markerEnd,
    interactionWidth,
    ...baseEdgeProps
  } = props;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const traffic = useSimStore((s) => s.edgeTraffic.get(id));
  const activeCount = traffic?.activeCount ?? 0;
  const overload = traffic?.overload ?? false;

  const strokeWidth = useMemo(() => {
    const base = 1.2 + Math.min(3.8, activeCount * 0.35);
    return base;
  }, [activeCount]);

  const edgeDomId = `nb-edge-path-${id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  return (
    <>
      <BaseEdge
        {...baseEdgeProps}
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
        interactionWidth={interactionWidth}
        style={{
          ...style,
          stroke: overload ? '#f87171' : (style?.stroke as string | undefined) ?? '#3b82f6',
          strokeWidth,
          filter: overload
            ? 'drop-shadow(0 0 5px rgba(248,113,113,0.55))'
            : 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.45))',
        }}
      />
      <TrafficDots edgePath={edgePath} count={activeCount} overload={overload} edgeDomId={edgeDomId} />
    </>
  );
}

export const AnimatedEdge = memo(AnimatedEdgeInner);
