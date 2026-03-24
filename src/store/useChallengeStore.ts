import { create } from 'zustand';
import type { Challenge } from '@/constants/challenges';
import { getChallengeById } from '@/constants/challenges';
import type { ChallengeResult } from '@/simulation/evaluator';
import { evaluateChallenge } from '@/simulation/evaluator';
import { useChaosStore } from './useChaosStore';
import { useFlowStore } from './useFlowStore';
import { useHistoryStore } from './useHistoryStore';
import { useSimStore } from './useSimStore';
import { useConfirmStore } from './useConfirmStore';

interface CompletedChallenge {
  stars: number;
  score: number;
  time: number;
}

interface PersistedCompletedChallenges {
  [challengeId: string]: CompletedChallenge;
}

interface ChallengeStore {
  activeChallenge: Challenge | null;
  currentScore: number;
  requirementStatuses: Map<string, boolean>;
  hintsRevealed: number;
  revealedHintIds: Set<string>;
  revealedHintMessages: string[];
  startTime: number | null;
  completedChallenges: Map<string, CompletedChallenge>;
  isEvaluating: boolean;
  lastResult: ChallengeResult | null;
  isHudMinimized: boolean;

  startChallenge: (challengeId: string) => void;
  submitDesign: () => Promise<void>;
  revealHint: () => void;
  completeChallenge: (result: ChallengeResult) => void;
  exitChallenge: () => void;
  updateRequirementStatus: (reqId: string, passed: boolean) => void;
  closeResults: () => void;
  toggleHudMinimize: () => void;
}

const STORAGE_KEY = 'nb-completed-challenges';

function readCompleted(): Map<string, CompletedChallenge> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as PersistedCompletedChallenges;
    return new Map(Object.entries(parsed));
  } catch {
    return new Map();
  }
}

function writeCompleted(map: Map<string, CompletedChallenge>): void {
  const obj = Object.fromEntries(map.entries());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  activeChallenge: null,
  currentScore: 0,
  requirementStatuses: new Map(),
  hintsRevealed: 0,
  revealedHintIds: new Set(),
  revealedHintMessages: [],
  startTime: null,
  completedChallenges: readCompleted(),
  isEvaluating: false,
  lastResult: null,
  isHudMinimized: false,

  startChallenge: (challengeId) => {
    const challenge = getChallengeById(challengeId);
    if (!challenge) return;

    const startFlow = () => {
      useChaosStore.getState().clearAllChaos();
      useSimStore.getState().stopSession();
      useHistoryStore.getState().clear();
      useFlowStore.getState().replaceGraph([], []);
      set({
        activeChallenge: challenge,
        currentScore: 0,
        requirementStatuses: new Map(),
        hintsRevealed: 0,
        revealedHintIds: new Set(),
        revealedHintMessages: [],
        startTime: Date.now(),
        lastResult: null,
        isHudMinimized: false,
      });
    };

    const { nodes } = useFlowStore.getState();
    if (nodes.length > 0) {
      useConfirmStore.getState().open({
        title: 'Start challenge?',
        message: 'Starting this challenge clears your current canvas. Continue?',
        confirmLabel: 'Start',
        onConfirm: startFlow,
      });
      return;
    }
    startFlow();
  },

  submitDesign: async () => {
    const activeChallenge = get().activeChallenge;
    if (!activeChallenge) return;
    set({ isEvaluating: true });
    try {
      const result = await evaluateChallenge(activeChallenge);
      get().completeChallenge(result);
    } finally {
      set({ isEvaluating: false });
    }
  },

  revealHint: () => {
    const { activeChallenge, requirementStatuses, revealedHintIds } = get();
    if (!activeChallenge) return;

    const isStaticRequirement = (checkType: Challenge['requirements'][number]['check']['type']) =>
      checkType === 'has_component' ||
      checkType === 'has_redundancy' ||
      checkType === 'no_single_point_of_failure' ||
      checkType === 'max_component_count';

    const allRequirements = activeChallenge.requirements;
    const pending = allRequirements.filter((req) => !requirementStatuses.get(req.id));
    const unrevealedPending = pending.filter((req) => !revealedHintIds.has(req.id));
    const nextRequirement = unrevealedPending[0];

    if (nextRequirement) {
      set((state) => {
        const nextIds = new Set(state.revealedHintIds);
        nextIds.add(nextRequirement.id);
        return {
          revealedHintIds: nextIds,
          revealedHintMessages: [...state.revealedHintMessages, nextRequirement.hint],
          hintsRevealed: nextIds.size,
          currentScore: Math.max(0, state.currentScore - 5),
        };
      });
      return;
    }

    const allPassed = allRequirements.every((req) => requirementStatuses.get(req.id));
    if (allPassed) {
      set((state) => ({
        revealedHintMessages: [...state.revealedHintMessages, 'All requirements met! Click Submit to see your score.'],
      }));
      return;
    }

    const staticPending = pending.filter((req) => isStaticRequirement(req.check.type));
    if (staticPending.length === 0) {
      set((state) => ({
        revealedHintMessages: [
          ...state.revealedHintMessages,
          'Your components look good. Run the simulation to verify performance requirements.',
        ],
      }));
      return;
    }

    set((state) => ({
      revealedHintMessages: [...state.revealedHintMessages, 'All hints used'],
    }));
  },

  completeChallenge: (result) => {
    const { activeChallenge, startTime, completedChallenges } = get();
    if (!activeChallenge) return;
    const elapsedMs = startTime ? Date.now() - startTime : 0;
    const nextCompleted = new Map(completedChallenges);
    const prev = nextCompleted.get(activeChallenge.id);
    if (!prev || result.totalScore > prev.score || result.stars > prev.stars) {
      nextCompleted.set(activeChallenge.id, {
        score: result.totalScore,
        stars: result.stars,
        time: elapsedMs,
      });
      writeCompleted(nextCompleted);
    }
    set({
      completedChallenges: nextCompleted,
      currentScore: result.totalScore,
      lastResult: result,
      activeChallenge: null,
      startTime: null,
      requirementStatuses: new Map(),
      hintsRevealed: 0,
      revealedHintIds: new Set(),
      revealedHintMessages: [],
    });
  },

  exitChallenge: () => {
    set({
      activeChallenge: null,
      currentScore: 0,
      requirementStatuses: new Map(),
      hintsRevealed: 0,
      revealedHintIds: new Set(),
      revealedHintMessages: [],
      startTime: null,
      isHudMinimized: false,
    });
  },

  updateRequirementStatus: (reqId, passed) => {
    set((state) => {
      const next = new Map(state.requirementStatuses);
      next.set(reqId, passed);
      return { requirementStatuses: next };
    });
  },

  closeResults: () => set({ lastResult: null }),
  toggleHudMinimize: () => set((state) => ({ isHudMinimized: !state.isHudMinimized })),
}));
