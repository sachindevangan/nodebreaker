import { create } from 'zustand';
import type { LLDChapter } from '@/constants/lldTypes';
import { LLD_CURRICULUM, LLD_TOPIC_COUNT } from '@/constants/lldCurriculum';
import type { LLDTopic as LLDTopicType } from '@/constants/lldTypes';

const STORAGE_KEY = 'nodebreaker-codelab';

export interface LLDTopicProgress {
  readCompleted: boolean;
  exercisesCompleted: string[]; // exercise ids
  quizScore: number; // 0-100
  quizAttempts: number;
  completed: boolean; // true when quizScore === 100
  solutionRevealed: boolean[]; // per exercise index
}

interface PersistedCodeLab {
  progress: Record<string, LLDTopicProgress>;
  totalXP: number;
  currentChapterId: string | null;
  currentTopicId: string | null;
}

export interface CodeLabStore {
  progress: Map<string, LLDTopicProgress>;
  totalXP: number;
  currentChapterId: string | null;
  currentTopicId: string | null;

  markReadComplete: (topicId: string) => void;
  markExerciseComplete: (topicId: string, exerciseId: string) => void;
  revealSolution: (topicId: string, exerciseIndex: number) => void;
  submitQuiz: (topicId: string, score: number) => void;
  getChapterProgress: (chapterId: string) => { completed: number; total: number; percentage: number };
  getOverallProgress: () => { completed: number; total: number; percentage: number };
}

const defaultProgress = (): LLDTopicProgress => ({
  readCompleted: false,
  exercisesCompleted: [],
  quizScore: 0,
  quizAttempts: 0,
  completed: false,
  solutionRevealed: [],
});

function readPersisted(): PersistedCodeLab {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        progress: {},
        totalXP: 0,
        currentChapterId: null,
        currentTopicId: null,
      };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedCodeLab>;
    return {
      progress: parsed.progress && typeof parsed.progress === 'object' ? (parsed.progress as Record<string, LLDTopicProgress>) : {},
      totalXP: typeof parsed.totalXP === 'number' ? parsed.totalXP : 0,
      currentChapterId: typeof parsed.currentChapterId === 'string' ? parsed.currentChapterId : null,
      currentTopicId: typeof parsed.currentTopicId === 'string' ? parsed.currentTopicId : null,
    };
  } catch {
    return {
      progress: {},
      totalXP: 0,
      currentChapterId: null,
      currentTopicId: null,
    };
  }
}

function persist(state: CodeLabStore): void {
  const payload: PersistedCodeLab = {
    progress: Object.fromEntries(state.progress.entries()),
    totalXP: state.totalXP,
    currentChapterId: state.currentChapterId,
    currentTopicId: state.currentTopicId,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function safeSetSolutionRevealed(p: LLDTopicProgress, exerciseIndex: number): LLDTopicProgress {
  if (exerciseIndex < 0) return p;
  const next = { ...p, solutionRevealed: [...p.solutionRevealed] };
  while (next.solutionRevealed.length <= exerciseIndex) next.solutionRevealed.push(false);
  next.solutionRevealed[exerciseIndex] = true;
  return next;
}

function chapterByTopicId(topicId: string): { chapter: LLDChapter; topic: LLDTopicType } | null {
  for (const chapter of LLD_CURRICULUM) {
    const topic = chapter.topics.find((t) => t.id === topicId);
    if (topic) return { chapter, topic };
  }
  return null;
}

function ensureProgress(map: Map<string, LLDTopicProgress>, topicId: string, exerciseCount: number): LLDTopicProgress {
  const current = map.get(topicId) ?? defaultProgress();
  if (current.solutionRevealed.length < exerciseCount) {
    const next = { ...current, solutionRevealed: [...current.solutionRevealed] };
    while (next.solutionRevealed.length < exerciseCount) next.solutionRevealed.push(false);
    map.set(topicId, next);
    return next;
  }
  map.set(topicId, current);
  return current;
}

const initial = readPersisted();

export const useCodeLabStore = create<CodeLabStore>((set, get) => ({
  progress: new Map(Object.entries(initial.progress)),
  totalXP: initial.totalXP,
  currentChapterId: initial.currentChapterId,
  currentTopicId: initial.currentTopicId,

  getChapterProgress: (chapterId) => {
    const chapter = LLD_CURRICULUM.find((c) => c.id === chapterId);
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
    for (const chapter of LLD_CURRICULUM) {
      for (const t of chapter.topics) {
        if (prog.get(t.id)?.completed) completed += 1;
      }
    }
    return {
      completed,
      total: LLD_TOPIC_COUNT,
      percentage: Math.round((completed / LLD_TOPIC_COUNT) * 100),
    };
  },

  markReadComplete: (topicId) => {
    const ctx = chapterByTopicId(topicId);
    if (!ctx) return;
    const { chapter, topic } = ctx;
    const state = get();
    const progress = new Map(state.progress);
    const p = ensureProgress(progress, topicId, topic.exercises.length);
    if (p.readCompleted) return;
    p.readCompleted = true;
    set({
      progress,
      currentChapterId: chapter.id,
      currentTopicId: topicId,
      totalXP: state.totalXP + 10,
    });
    persist(get());
  },

  markExerciseComplete: (topicId, exerciseId) => {
    const ctx = chapterByTopicId(topicId);
    if (!ctx) return;
    const { chapter, topic } = ctx;
    const state = get();
    const progress = new Map(state.progress);
    const p = ensureProgress(progress, topicId, topic.exercises.length);
    if (p.exercisesCompleted.includes(exerciseId)) return;
    p.exercisesCompleted = [...p.exercisesCompleted, exerciseId];
    set({
      progress,
      currentChapterId: chapter.id,
      currentTopicId: topicId,
      totalXP: state.totalXP + 15,
    });
    persist(get());
  },

  revealSolution: (topicId, exerciseIndex) => {
    const ctx = chapterByTopicId(topicId);
    if (!ctx) return;
    const { chapter, topic } = ctx;
    const state = get();
    const progress = new Map(state.progress);
    const p = ensureProgress(progress, topicId, topic.exercises.length);
    const next = safeSetSolutionRevealed(p, exerciseIndex);
    progress.set(topicId, next);
    set({
      progress,
      currentChapterId: chapter.id,
      currentTopicId: topicId,
    });
    persist(get());
  },

  submitQuiz: (topicId, score) => {
    const ctx = chapterByTopicId(topicId);
    if (!ctx) return;
    const { chapter } = ctx;
    const clamped = Math.max(0, Math.min(100, Math.round(score)));
    const state = get();
    const progress = new Map(state.progress);
    const topic = ctx.topic;
    const p = ensureProgress(progress, topicId, topic.exercises.length);
    const wasCompleted = p.completed;

    p.quizAttempts += 1;
    p.quizScore = clamped;
    if (clamped === 100) p.completed = true;

    progress.set(topicId, { ...p });

    const xpGain = clamped === 100 && !wasCompleted ? 30 : 0;

    set({
      progress,
      currentChapterId: chapter.id,
      currentTopicId: topicId,
      totalXP: state.totalXP + xpGain,
    });
    persist(get());
  },
}));

