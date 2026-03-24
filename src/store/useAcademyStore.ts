import { create } from 'zustand';
import { CURRICULUM, CURRICULUM_TOPIC_COUNT, type Chapter } from '@/constants/curriculum';

const STORAGE_KEY = 'nodebreaker-academy';

export interface TopicProgress {
  readCompleted: boolean;
  demoCompleted: boolean;
  quizScore: number;
  quizAttempts: number;
  completed: boolean;
}

interface PersistedAcademy {
  progress: Record<string, TopicProgress>;
  totalXP: number;
  streak: number;
  lastActiveDate: string;
  collectedInterviewTips: string[];
  currentChapterId: string | null;
  currentTopicId: string | null;
  chapterBonusesAwarded: string[];
}

export interface AcademyStore {
  progress: Map<string, TopicProgress>;
  totalXP: number;
  streak: number;
  lastActiveDate: string;
  collectedInterviewTips: string[];
  currentChapterId: string | null;
  currentTopicId: string | null;
  chapterBonusesAwarded: Set<string>;
  lastXPGain: number;

  markReadComplete: (topicId: string) => void;
  markDemoComplete: (topicId: string) => void;
  submitQuiz: (topicId: string, score: number) => void;
  getChapterProgress: (chapterId: string) => { completed: number; total: number; percentage: number };
  getOverallProgress: () => { completed: number; total: number; percentage: number };
  collectInterviewTip: (topicId: string) => void;
  updateStreak: () => void;
  setCurrentTopic: (chapterId: string | null, topicId: string | null) => void;
  getTopicProgress: (topicId: string) => TopicProgress;
  clearXPGain: () => void;
}

const defaultProgress = (): TopicProgress => ({
  readCompleted: false,
  demoCompleted: false,
  quizScore: 0,
  quizAttempts: 0,
  completed: false,
});

function safeDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function readPersisted(): PersistedAcademy {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        progress: {},
        totalXP: 0,
        streak: 0,
        lastActiveDate: '',
        collectedInterviewTips: [],
        currentChapterId: null,
        currentTopicId: null,
        chapterBonusesAwarded: [],
      };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedAcademy>;
    return {
      progress: parsed.progress && typeof parsed.progress === 'object' ? parsed.progress : {},
      totalXP: typeof parsed.totalXP === 'number' ? parsed.totalXP : 0,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : '',
      collectedInterviewTips: Array.isArray(parsed.collectedInterviewTips) ? parsed.collectedInterviewTips : [],
      currentChapterId:
        typeof parsed.currentChapterId === 'string' || parsed.currentChapterId === null ? parsed.currentChapterId : null,
      currentTopicId:
        typeof parsed.currentTopicId === 'string' || parsed.currentTopicId === null ? parsed.currentTopicId : null,
      chapterBonusesAwarded: Array.isArray(parsed.chapterBonusesAwarded) ? parsed.chapterBonusesAwarded : [],
    };
  } catch {
    return {
      progress: {},
      totalXP: 0,
      streak: 0,
      lastActiveDate: '',
      collectedInterviewTips: [],
      currentChapterId: null,
      currentTopicId: null,
      chapterBonusesAwarded: [],
    };
  }
}

function persist(state: AcademyStore): void {
  const payload: PersistedAcademy = {
    progress: Object.fromEntries(state.progress.entries()),
    totalXP: state.totalXP,
    streak: state.streak,
    lastActiveDate: state.lastActiveDate,
    collectedInterviewTips: state.collectedInterviewTips,
    currentChapterId: state.currentChapterId,
    currentTopicId: state.currentTopicId,
    chapterBonusesAwarded: Array.from(state.chapterBonusesAwarded),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function ensureProgress(map: Map<string, TopicProgress>, topicId: string): TopicProgress {
  const current = map.get(topicId) ?? defaultProgress();
  map.set(topicId, current);
  return current;
}

function chapterById(id: string): Chapter | undefined {
  return CURRICULUM.find((c) => c.id === id);
}

const initial = readPersisted();

export const useAcademyStore = create<AcademyStore>((set, get) => ({
  progress: new Map(Object.entries(initial.progress)),
  totalXP: initial.totalXP,
  streak: initial.streak,
  lastActiveDate: initial.lastActiveDate,
  collectedInterviewTips: initial.collectedInterviewTips,
  currentChapterId: initial.currentChapterId,
  currentTopicId: initial.currentTopicId,
  chapterBonusesAwarded: new Set(initial.chapterBonusesAwarded),
  lastXPGain: 0,

  getTopicProgress: (topicId) => {
    return get().progress.get(topicId) ?? defaultProgress();
  },

  setCurrentTopic: (chapterId, topicId) => {
    set({ currentChapterId: chapterId, currentTopicId: topicId });
    persist(get());
  },

  markReadComplete: (topicId) => {
    const state = get();
    const progress = new Map(state.progress);
    const p = ensureProgress(progress, topicId);
    if (p.readCompleted) return;
    p.readCompleted = true;
    state.updateStreak();
    const gain = 10;
    set((prev) => ({
      progress,
      totalXP: prev.totalXP + gain,
      lastXPGain: gain,
    }));
    persist(get());
  },

  markDemoComplete: (topicId) => {
    const state = get();
    const progress = new Map(state.progress);
    const p = ensureProgress(progress, topicId);
    if (p.demoCompleted) return;
    p.demoCompleted = true;
    state.updateStreak();
    const gain = 10;
    set((prev) => ({
      progress,
      totalXP: prev.totalXP + gain,
      lastXPGain: gain,
    }));
    persist(get());
  },

  submitQuiz: (topicId, score) => {
    const clamped = Math.max(0, Math.min(100, Math.round(score)));
    const state = get();
    const progress = new Map(state.progress);
    const p = ensureProgress(progress, topicId);
    const wasCompleted = p.completed;
    p.quizAttempts += 1;
    p.quizScore = clamped;
    if (clamped === 100) {
      p.completed = true;
    }
    progress.set(topicId, { ...p });
    state.updateStreak();

    let xpGain = 0;
    if (clamped === 100 && !wasCompleted) {
      xpGain += 30;
    }

    const chapter = getChapterByTopicId(topicId);
    let chapterBonus = 0;
    const chapterBonusesAwarded = new Set(state.chapterBonusesAwarded);
    if (chapter && clamped === 100 && !wasCompleted) {
      const allDone = chapter.topics.every((t) => {
        const pr = progress.get(t.id) ?? defaultProgress();
        return pr.completed;
      });
      if (allDone && !chapterBonusesAwarded.has(chapter.id)) {
        chapterBonus = 100;
        chapterBonusesAwarded.add(chapter.id);
      }
    }

    set((prev) => ({
      progress,
      totalXP: prev.totalXP + xpGain + chapterBonus,
      lastXPGain: xpGain + chapterBonus,
      chapterBonusesAwarded,
    }));
    persist(get());
  },

  getChapterProgress: (chapterId) => {
    const chapter = chapterById(chapterId);
    if (!chapter) return { completed: 0, total: 0, percentage: 0 };
    const total = chapter.topics.length;
    let completed = 0;
    const prog = get().progress;
    for (const t of chapter.topics) {
      if (prog.get(t.id)?.completed) completed += 1;
    }
    return {
      completed,
      total,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  },

  getOverallProgress: () => {
    const prog = get().progress;
    let completed = 0;
    for (const [, p] of prog) {
      if (p.completed) completed += 1;
    }
    const total = CURRICULUM_TOPIC_COUNT;
    return {
      completed,
      total,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  },

  collectInterviewTip: (topicId) => {
    const state = get();
    if (state.collectedInterviewTips.includes(topicId)) return;
    set({ collectedInterviewTips: [...state.collectedInterviewTips, topicId] });
    persist(get());
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

  clearXPGain: () => set({ lastXPGain: 0 }),
}));

function getChapterByTopicId(topicId: string): Chapter | undefined {
  for (const c of CURRICULUM) {
    if (c.topics.some((t) => t.id === topicId)) return c;
  }
  return undefined;
}
