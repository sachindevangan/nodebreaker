import { create } from 'zustand';
import type { Challenge } from '@/constants/challenges';
import { getChallengeById } from '@/constants/challenges';
import type { ChallengeResult } from '@/simulation/evaluator';
import { evaluateChallenge } from '@/simulation/evaluator';
import { useChaosStore } from './useChaosStore';
import { useFlowStore } from './useFlowStore';
import { useHistoryStore } from './useHistoryStore';
import { useSimStore } from './useSimStore';

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
  startTime: null,
  completedChallenges: readCompleted(),
  isEvaluating: false,
  lastResult: null,
  isHudMinimized: false,

  startChallenge: (challengeId) => {
    const challenge = getChallengeById(challengeId);
    if (!challenge) return;
    const { nodes } = useFlowStore.getState();
    if (nodes.length > 0) {
      const confirmed = window.confirm('Starting this challenge clears your current canvas. Continue?');
      if (!confirmed) return;
    }
    useChaosStore.getState().clearAllChaos();
    useSimStore.getState().stopSession();
    useHistoryStore.getState().clear();
    useFlowStore.getState().replaceGraph([], []);
    set({
      activeChallenge: challenge,
      currentScore: 0,
      requirementStatuses: new Map(),
      hintsRevealed: 0,
      startTime: Date.now(),
      lastResult: null,
      isHudMinimized: false,
    });
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
    const { activeChallenge, hintsRevealed } = get();
    if (!activeChallenge) return;
    if (hintsRevealed >= activeChallenge.hints.length) return;
    set((state) => ({
      hintsRevealed: state.hintsRevealed + 1,
      currentScore: Math.max(0, state.currentScore - 5),
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
    });
  },

  exitChallenge: () => {
    set({
      activeChallenge: null,
      currentScore: 0,
      requirementStatuses: new Map(),
      hintsRevealed: 0,
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
