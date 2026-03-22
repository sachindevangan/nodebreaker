import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { memo, useMemo } from 'react';
import { useSimStore } from '@/store/useSimStore';

const MAX_DOTS = 14;
const DEFAULT_STROKE_WIDTH = 2;

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
    animated,
    selectable,
    deletable,
    sourceHandleId,
    targetHandleId,
    pathOptions,
    style,
    markerStart,
    markerEnd,
    interactionWidth,
  } = props;
  void animated;
  void selectable;
  void deletable;
  void sourceHandleId;
  void targetHandleId;
  void pathOptions;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const simulationSessionActive = useSimStore((s) => s.simulationSessionActive);
  const traffic = useSimStore((s) => s.edgeTraffic.get(id));
  const partitioned = simulationSessionActive && Boolean(traffic?.partitioned);
  const activeCount = simulationSessionActive ? (traffic?.activeCount ?? 0) : 0;
  const overload = simulationSessionActive && (traffic?.overload ?? false);

  const strokeWidth = useMemo(() => {
    if (!simulationSessionActive) {
      const fromStyle =
        style && typeof style.strokeWidth === 'number' ? style.strokeWidth : undefined;
      return fromStyle ?? DEFAULT_STROKE_WIDTH;
    }
    return 1.2 + Math.min(3.8, activeCount * 0.35);
  }, [activeCount, simulationSessionActive, style]);

  const edgeDomId = `nb-edge-path-${id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  const baseStroke =
    partitioned
      ? '#f87171'
      : !simulationSessionActive
        ? ((style?.stroke as string | undefined) ?? '#3b82f6')
        : overload
          ? '#f87171'
          : (style?.stroke as string | undefined) ?? '#3b82f6';

  const baseFilter = !simulationSessionActive
    ? (style?.filter as string | undefined) ?? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.45))'
    : partitioned
      ? 'drop-shadow(0 0 6px rgba(248,113,113,0.65))'
      : overload
        ? 'drop-shadow(0 0 5px rgba(248,113,113,0.55))'
        : 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.45))';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
        interactionWidth={interactionWidth}
        style={{
          ...style,
          stroke: baseStroke,
          strokeWidth,
          filter: baseFilter,
          strokeDasharray: partitioned ? '7 5' : undefined,
        }}
      />
      {partitioned ? (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2}
          fill="#fca5a5"
          fontSize={14}
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="middle"
          className="pointer-events-none select-none"
          style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.9))' }}
        >
          ×
        </text>
      ) : null}
      {simulationSessionActive && activeCount > 0 && !partitioned ? (
        <TrafficDots edgePath={edgePath} count={activeCount} overload={overload} edgeDomId={edgeDomId} />
      ) : null}
    </>
  );
}

export const AnimatedEdge = memo(AnimatedEdgeInner);
