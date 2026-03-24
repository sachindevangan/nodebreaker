import { create } from 'zustand';
import { getTutorialById, type Tutorial } from '@/constants/tutorials';
import { useChaosStore } from './useChaosStore';
import { useFlowStore } from './useFlowStore';
import { useHistoryStore } from './useHistoryStore';
import { useSimStore } from './useSimStore';
import { useToastStore } from './useToastStore';

const COMPLETED_STORAGE_KEY = 'nb-completed-tutorials';

function readCompletedTutorials(): string[] {
  try {
    const raw = localStorage.getItem(COMPLETED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeCompletedTutorials(completed: string[]): void {
  localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(completed));
}

interface TutorialStore {
  activeTutorial: Tutorial | null;
  currentStepIndex: number;
  completedTutorials: string[];
  isMinimized: boolean;
  showCompletionModal: boolean;
  lastCompletedTutorialId: string | null;

  startTutorial: (tutorialId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  completeTutorial: () => void;
  exitTutorial: () => void;
  toggleMinimize: () => void;
  closeCompletionModal: () => void;
}

export const useTutorialStore = create<TutorialStore>((set, get) => ({
  activeTutorial: null,
  currentStepIndex: 0,
  completedTutorials: readCompletedTutorials(),
  isMinimized: false,
  showCompletionModal: false,
  lastCompletedTutorialId: null,

  startTutorial: (tutorialId) => {
    const tutorial = getTutorialById(tutorialId);
    if (!tutorial) return;

    const { nodes } = useFlowStore.getState();
    if (nodes.length > 0) {
      const confirmed = window.confirm(
        'Starting this tutorial will clear your current canvas. Continue?'
      );
      if (!confirmed) return;
    }

    useChaosStore.getState().clearAllChaos();
    useSimStore.getState().stopSession();
    useHistoryStore.getState().clear();
    useFlowStore.getState().replaceGraph([], []);

    set({
      activeTutorial: tutorial,
      currentStepIndex: 0,
      isMinimized: false,
      showCompletionModal: false,
      lastCompletedTutorialId: null,
    });
    useToastStore.getState().push({ kind: 'info', message: `Started tutorial: ${tutorial.title}` });
  },

  nextStep: () => {
    const { activeTutorial, currentStepIndex } = get();
    if (!activeTutorial) return;
    if (currentStepIndex >= activeTutorial.steps.length - 1) {
      get().completeTutorial();
      return;
    }
    set({ currentStepIndex: currentStepIndex + 1 });
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    set({ currentStepIndex: Math.max(0, currentStepIndex - 1) });
  },

  skipStep: () => {
    get().nextStep();
  },

  completeTutorial: () => {
    const { activeTutorial, completedTutorials } = get();
    if (!activeTutorial) return;
    const nextCompleted = completedTutorials.includes(activeTutorial.id)
      ? completedTutorials
      : [...completedTutorials, activeTutorial.id];
    writeCompletedTutorials(nextCompleted);
    set({
      completedTutorials: nextCompleted,
      showCompletionModal: true,
      lastCompletedTutorialId: activeTutorial.id,
      activeTutorial: null,
      currentStepIndex: 0,
      isMinimized: false,
    });
  },

  exitTutorial: () => {
    const activeTutorial = get().activeTutorial;
    set({ activeTutorial: null, currentStepIndex: 0, isMinimized: false });
    if (activeTutorial) {
      useToastStore.getState().push({ kind: 'warning', message: `Exited tutorial: ${activeTutorial.title}` });
    }
  },

  toggleMinimize: () => {
    set({ isMinimized: !get().isMinimized });
  },

  closeCompletionModal: () => {
    set({ showCompletionModal: false, lastCompletedTutorialId: null });
  },
}));
