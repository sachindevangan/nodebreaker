import { useEffect, useMemo, useRef, useState } from 'react';
import { useChaosStore } from '@/store/useChaosStore';
import { useFlowStore } from '@/store/useFlowStore';
import { useSimStore } from '@/store/useSimStore';
import { useTutorialStore } from '@/store/useTutorialStore';
import type { TutorialStep } from '@/constants/tutorials';

function isStepSatisfied(step: TutorialStep): boolean {
  const { nodes, edges } = useFlowStore.getState();
  const simulationRunning = useSimStore.getState().simulationSessionActive;
  const chaosEvents = useChaosStore.getState().activeEvents;
  const action = step.expectedAction;

  switch (action.type) {
    case 'observe':
      return true;
    case 'add_node':
      return nodes.some((node) => node.type === action.nodeType);
    case 'connect_nodes':
      return edges.some((edge) => {
        const sourceType = nodes.find((node) => node.id === edge.source)?.type;
        const targetType = nodes.find((node) => node.id === edge.target)?.type;
        return sourceType === action.fromType && targetType === action.toType;
      });
    case 'change_property':
      return nodes.some((node) => {
        if (node.type !== action.nodeType) return false;
        const value = node.data[action.property];
        if (typeof action.value === 'number') {
          return value === action.value;
        }
        return value !== undefined;
      });
    case 'start_simulation':
      return simulationRunning;
    case 'stop_simulation':
      return !simulationRunning;
    case 'inject_chaos':
      return chaosEvents.some((event) => {
        if (!event.isActive || event.type !== action.chaosType) return false;
        const targetType = nodes.find((node) => node.id === event.targetNodeId)?.type;
        return targetType === action.targetType;
      });
    default:
      return false;
  }
}

export function useTutorialDetection() {
  const activeTutorial = useTutorialStore((s) => s.activeTutorial);
  const currentStepIndex = useTutorialStore((s) => s.currentStepIndex);
  const nextStep = useTutorialStore((s) => s.nextStep);
  const step = activeTutorial?.steps[currentStepIndex] ?? null;

  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const simRunning = useSimStore((s) => s.simulationSessionActive);
  const chaos = useChaosStore((s) => s.activeEvents);

  const [isActionDetected, setIsActionDetected] = useState(false);
  const [showDetectedPulse, setShowDetectedPulse] = useState(false);
  const lastCompletedStepRef = useRef<string | null>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setIsActionDetected(false);
    setShowDetectedPulse(false);
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, [step?.id]);

  const detected = useMemo(() => {
    if (!step) return false;
    return isStepSatisfied(step);
  }, [step, nodes, edges, simRunning, chaos]);

  useEffect(() => {
    if (!step) return;
    if (!detected) return;
    if (lastCompletedStepRef.current === step.id) return;

    setIsActionDetected(true);
    setShowDetectedPulse(true);
    lastCompletedStepRef.current = step.id;
    window.setTimeout(() => setShowDetectedPulse(false), 750);

    if (step.autoComplete) {
      autoAdvanceTimerRef.current = window.setTimeout(() => {
        nextStep();
      }, 1000);
    }
  }, [detected, nextStep, step]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  return {
    isActionDetected,
    showDetectedPulse,
    canProceed: Boolean(step && (step.expectedAction.type === 'observe' || detected)),
  };
}
