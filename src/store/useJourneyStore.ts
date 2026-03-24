import { create } from 'zustand';
import { JOURNEY_STAGES, getJourneyStageById } from '@/constants/journey';

interface StagePartProgress {
  learnCompleted: boolean;
  buildCompleted: boolean;
  tutorialCompleted: boolean;
  challengeCompleted: boolean;
  interviewCardCollected: boolean;
}

interface JourneyStore {
  completedStages: Set<string>;
  currentStageId: string | null;
  stageProgress: Map<string, StagePartProgress>;
  totalXP: number;
  streak: number;
  lastActiveDate: string;
  collectedInterviewCards: string[];
  lastXPGain: number;
  quizResults: Map<string, Record<string, boolean>>;

  completeLearn: (stageId: string) => void;
  completeBuild: (stageId: string) => void;
  completeTutorial: (stageId: string) => void;
  completeChallenge: (stageId: string) => void;
  collectInterviewCard: (stageId: string) => void;
  completeStage: (stageId: string) => void;
  isStageUnlocked: (stageId: string) => boolean;
  getStageProgress: (stageId: string) => number;
  updateStreak: () => void;
  getCurrentStage: () => string | null;
  getOverallProgress: () => number;
  getComputedTotalXP: () => number;
  clearXPGain: () => void;
  setQuizResult: (stageId: string, quizId: string, isCorrect: boolean) => void;
  getQuizSummary: (stageId: string) => { correct: number; total: number };
}

const STORAGE_KEY = 'nb-journey-store-v1';

interface PersistedJourney {
  completedStages: string[];
  currentStageId: string | null;
  stageProgress: Record<string, StagePartProgress>;
  totalXP: number;
  streak: number;
  lastActiveDate: string;
  collectedInterviewCards: string[];
  quizResults: Record<string, Record<string, boolean>>;
}

const defaultProgress: StagePartProgress = {
  learnCompleted: false,
  buildCompleted: false,
  tutorialCompleted: false,
  challengeCompleted: false,
  interviewCardCollected: false,
};

function safeDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function readPersisted(): PersistedJourney {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        completedStages: [],
        currentStageId: 'stage-1',
        stageProgress: {},
        totalXP: 0,
        streak: 0,
        lastActiveDate: '',
        collectedInterviewCards: [],
        quizResults: {},
      };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedJourney>;
    return {
      completedStages: Array.isArray(parsed.completedStages) ? parsed.completedStages : [],
      currentStageId: typeof parsed.currentStageId === 'string' || parsed.currentStageId === null ? parsed.currentStageId : 'stage-1',
      stageProgress:
        parsed.stageProgress && typeof parsed.stageProgress === 'object'
          ? (parsed.stageProgress as Record<string, StagePartProgress>)
          : {},
      totalXP: typeof parsed.totalXP === 'number' ? parsed.totalXP : 0,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : '',
      collectedInterviewCards: Array.isArray(parsed.collectedInterviewCards) ? parsed.collectedInterviewCards : [],
      quizResults:
        parsed.quizResults && typeof parsed.quizResults === 'object'
          ? (parsed.quizResults as Record<string, Record<string, boolean>>)
          : {},
    };
  } catch {
    return {
      completedStages: [],
      currentStageId: 'stage-1',
      stageProgress: {},
      totalXP: 0,
      streak: 0,
      lastActiveDate: '',
      collectedInterviewCards: [],
      quizResults: {},
    };
  }
}

function persist(state: JourneyStore): void {
  const payload: PersistedJourney = {
    completedStages: Array.from(state.completedStages),
    currentStageId: state.currentStageId,
    stageProgress: Object.fromEntries(state.stageProgress.entries()),
    totalXP: state.totalXP,
    streak: state.streak,
    lastActiveDate: state.lastActiveDate,
    collectedInterviewCards: state.collectedInterviewCards,
    quizResults: Object.fromEntries(state.quizResults.entries()),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function getPartXP(stageId: string, part: keyof StagePartProgress): number {
  const stage = getJourneyStageById(stageId);
  if (!stage) return 0;
  const map: Record<keyof StagePartProgress, number> = {
    learnCompleted: 0.3,
    buildCompleted: 0.2,
    tutorialCompleted: 0.2,
    challengeCompleted: 0.2,
    interviewCardCollected: 0.1,
  };
  return Math.round(stage.xpReward * map[part]);
}

function ensureProgress(map: Map<string, StagePartProgress>, stageId: string): StagePartProgress {
  const current = map.get(stageId) ?? { ...defaultProgress };
  map.set(stageId, current);
  return current;
}

const initial = readPersisted();

export const useJourneyStore = create<JourneyStore>((set, get) => ({
  completedStages: new Set(initial.completedStages),
  currentStageId: initial.currentStageId,
  stageProgress: new Map(Object.entries(initial.stageProgress)),
  totalXP: initial.totalXP,
  streak: initial.streak,
  lastActiveDate: initial.lastActiveDate,
  collectedInterviewCards: initial.collectedInterviewCards,
  quizResults: new Map(Object.entries(initial.quizResults ?? {})),
  lastXPGain: 0,

  completeLearn: (stageId) => {
    const state = get();
    const stageProgress = new Map(state.stageProgress);
    const progress = ensureProgress(stageProgress, stageId);
    if (progress.learnCompleted) return;
    progress.learnCompleted = true;
    const gain = getPartXP(stageId, 'learnCompleted');
    state.updateStreak();
    set((prev) => ({
      stageProgress,
      totalXP: prev.totalXP + gain,
      lastXPGain: gain,
    }));
    const next = get();
    next.completeStage(stageId);
    persist(next);
  },

  completeBuild: (stageId) => {
    const state = get();
    const stageProgress = new Map(state.stageProgress);
    const progress = ensureProgress(stageProgress, stageId);
    if (progress.buildCompleted) return;
    progress.buildCompleted = true;
    const gain = getPartXP(stageId, 'buildCompleted');
    state.updateStreak();
    set((prev) => ({
      stageProgress,
      totalXP: prev.totalXP + gain,
      lastXPGain: gain,
    }));
    const next = get();
    next.completeStage(stageId);
    persist(next);
  },

  completeTutorial: (stageId) => {
    const state = get();
    const stage = getJourneyStageById(stageId);
    if (!stage?.parts.tutorial) return;
    const stageProgress = new Map(state.stageProgress);
    const progress = ensureProgress(stageProgress, stageId);
    if (progress.tutorialCompleted) return;
    progress.tutorialCompleted = true;
    const gain = getPartXP(stageId, 'tutorialCompleted');
    state.updateStreak();
    set((prev) => ({
      stageProgress,
      totalXP: prev.totalXP + gain,
      lastXPGain: gain,
    }));
    const next = get();
    next.completeStage(stageId);
    persist(next);
  },

  completeChallenge: (stageId) => {
    const state = get();
    const stage = getJourneyStageById(stageId);
    if (!stage?.parts.challenge) return;
    const stageProgress = new Map(state.stageProgress);
    const progress = ensureProgress(stageProgress, stageId);
    if (progress.challengeCompleted) return;
    progress.challengeCompleted = true;
    const gain = getPartXP(stageId, 'challengeCompleted');
    state.updateStreak();
    set((prev) => ({
      stageProgress,
      totalXP: prev.totalXP + gain,
      lastXPGain: gain,
    }));
    const next = get();
    next.completeStage(stageId);
    persist(next);
  },

  collectInterviewCard: (stageId) => {
    const state = get();
    const stageProgress = new Map(state.stageProgress);
    const progress = ensureProgress(stageProgress, stageId);
    if (progress.interviewCardCollected) return;
    progress.interviewCardCollected = true;
    const gain = getPartXP(stageId, 'interviewCardCollected');
    state.updateStreak();
    set((prev) => ({
      stageProgress,
      totalXP: prev.totalXP + gain,
      lastXPGain: gain,
      collectedInterviewCards: prev.collectedInterviewCards.includes(stageId)
        ? prev.collectedInterviewCards
        : [...prev.collectedInterviewCards, stageId],
    }));
    const next = get();
    next.completeStage(stageId);
    persist(next);
  },

  completeStage: (stageId) => {
    const stage = getJourneyStageById(stageId);
    if (!stage) return;
    const state = get();
    const progress = state.stageProgress.get(stageId) ?? defaultProgress;
    const tutorialOK = stage.parts.tutorial ? progress.tutorialCompleted : true;
    const challengeOK = stage.parts.challenge ? progress.challengeCompleted : true;
    const done =
      progress.learnCompleted &&
      progress.buildCompleted &&
      tutorialOK &&
      challengeOK &&
      progress.interviewCardCollected;
    if (!done) return;
    if (state.completedStages.has(stageId)) return;
    const completedStages = new Set(state.completedStages);
    completedStages.add(stageId);
    const nextStageId = JOURNEY_STAGES.find(
      (candidate) => !completedStages.has(candidate.id) && candidate.prerequisites.every((req) => completedStages.has(req))
    )?.id;
    set({
      completedStages,
      currentStageId: nextStageId ?? null,
    });
    persist(get());
  },

  isStageUnlocked: (stageId) => {
    const stage = getJourneyStageById(stageId);
    if (!stage) return false;
    return true;
  },

  getStageProgress: (stageId) => {
    const stage = getJourneyStageById(stageId);
    if (!stage) return 0;
    const progress = get().stageProgress.get(stageId) ?? defaultProgress;
    const requiredParts = [
      progress.learnCompleted,
      progress.buildCompleted,
      stage.parts.tutorial ? progress.tutorialCompleted : true,
      stage.parts.challenge ? progress.challengeCompleted : true,
      progress.interviewCardCollected,
    ];
    const completed = requiredParts.filter(Boolean).length;
    return Math.round((completed / requiredParts.length) * 100);
  },

  updateStreak: () => {
    const today = safeDateString(new Date());
    const state = get();
    if (state.lastActiveDate === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = safeDateString(yesterday);
    const nextStreak = state.lastActiveDate === yesterdayStr ? state.streak + 1 : 1;
    set({
      streak: nextStreak,
      lastActiveDate: today,
    });
    persist(get());
  },

  getCurrentStage: () => {
    const state = get();
    if (state.currentStageId) return state.currentStageId;
    const next = JOURNEY_STAGES.find((stage) => !state.completedStages.has(stage.id) && state.isStageUnlocked(stage.id));
    return next?.id ?? null;
  },

  getOverallProgress: () => {
    const done = get().completedStages.size;
    return Math.round((done / JOURNEY_STAGES.length) * 100);
  },

  getComputedTotalXP: () => {
    const state = get();
    let total = 0;
    for (const stage of JOURNEY_STAGES) {
      const progress = state.stageProgress.get(stage.id) ?? defaultProgress;
      if (progress.learnCompleted) total += getPartXP(stage.id, 'learnCompleted');
      if (progress.buildCompleted) total += getPartXP(stage.id, 'buildCompleted');
      if (stage.parts.tutorial && progress.tutorialCompleted) total += getPartXP(stage.id, 'tutorialCompleted');
      if (stage.parts.challenge && progress.challengeCompleted) total += getPartXP(stage.id, 'challengeCompleted');
      if (progress.interviewCardCollected) total += getPartXP(stage.id, 'interviewCardCollected');
    }
    return total;
  },

  clearXPGain: () => set({ lastXPGain: 0 }),

  setQuizResult: (stageId, quizId, isCorrect) => {
    const current = get().quizResults;
    const next = new Map(current);
    const stageResults = { ...(next.get(stageId) ?? {}) };
    stageResults[quizId] = isCorrect;
    next.set(stageId, stageResults);
    set({ quizResults: next });
    persist(get());
  },

  getQuizSummary: (stageId) => {
    const stage = getJourneyStageById(stageId);
    if (!stage) return { correct: 0, total: 0 };
    const total = stage.parts.learn.content.filter((b) => b.type === 'quiz').length;
    const results = get().quizResults.get(stageId) ?? {};
    const correct = Object.values(results).filter(Boolean).length;
    return { correct, total };
  },
}));
