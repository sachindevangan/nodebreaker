import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import {
  CURRICULUM,
  getTopicNavList,
  type Chapter,
  type Topic,
} from '@/constants/curriculum';
import { useAcademyStore } from '@/store/useAcademyStore';

const cardBase =
  'rounded-lg border border-[var(--border)] bg-[var(--surface)] transition-colors';

function ChapterIcon({ name, color }: { name: string; color: string }) {
  const Icon = (LucideIcons as unknown as Record<string, ComponentType<{ className?: string; strokeWidth?: number }>>)[name];
  if (!Icon) return null;
  return (
    <span style={{ color }} className="inline-flex" aria-hidden>
      <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
    </span>
  );
}

function getFirstIncompleteTopicId(
  progress: Map<string, { completed: boolean }>
): string | null {
  for (const entry of getTopicNavList()) {
    if (!progress.get(entry.topic.id)?.completed) return entry.topic.id;
  }
  return null;
}

function getChapterState(
  chapter: Chapter,
  progress: Map<string, { completed: boolean }>
): 'done' | 'active' | 'idle' {
  const total = chapter.topics.length;
  let done = 0;
  for (const t of chapter.topics) {
    if (progress.get(t.id)?.completed) done += 1;
  }
  if (done === total && total > 0) return 'done';
  if (done > 0) return 'active';
  const firstInc = getFirstIncompleteTopicId(progress);
  if (!firstInc) return 'idle';
  const inChapter = chapter.topics.some((t) => t.id === firstInc);
  return inChapter ? 'active' : 'idle';
}

interface AcademyPageProps {
  onOpenTopic: (topicId: string) => void;
  onSkipToSandbox: () => void;
}

export function AcademyPage({ onOpenTopic, onSkipToSandbox }: AcademyPageProps) {
  const progress = useAcademyStore((s) => s.progress);
  const totalXP = useAcademyStore((s) => s.totalXP);
  const streak = useAcademyStore((s) => s.streak);
  const currentChapterId = useAcademyStore((s) => s.currentChapterId);
  const currentTopicId = useAcademyStore((s) => s.currentTopicId);
  const setCurrentTopic = useAcademyStore((s) => s.setCurrentTopic);
  const getOverallProgress = useAcademyStore((s) => s.getOverallProgress);
  const getChapterProgress = useAcademyStore((s) => s.getChapterProgress);

  const { completed: overallDone, total: overallTotal, percentage } = getOverallProgress();
  const firstIncomplete = useMemo(() => getFirstIncompleteTopicId(progress), [progress]);
  const hasAnyCompleted = useMemo(() => {
    for (const [, p] of progress) {
      if (p.completed) return true;
    }
    return false;
  }, [progress]);

  const defaultOpenChapterId = useMemo(() => {
    if (!firstIncomplete) return CURRICULUM[0]?.id ?? null;
    const ctx = getTopicNavList().find((e) => e.topic.id === firstIncomplete);
    return ctx?.chapter.id ?? CURRICULUM[0]?.id ?? null;
  }, [firstIncomplete]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const didInitDefaultOpen = useRef(false);

  useEffect(() => {
    if (!didInitDefaultOpen.current && defaultOpenChapterId) {
      setExpandedIds(new Set([defaultOpenChapterId]));
      didInitDefaultOpen.current = true;
    }
  }, [defaultOpenChapterId]);

  const toggleChapter = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const continueCtx = useMemo(() => {
    if (!currentTopicId || !currentChapterId) return null;
    const p = progress.get(currentTopicId);
    if (p?.completed) return null;
    const ch = CURRICULUM.find((c) => c.id === currentChapterId);
    const topic = ch?.topics.find((t) => t.id === currentTopicId);
    if (!ch || !topic) return null;
    return { chapter: ch, topic };
  }, [currentChapterId, currentTopicId, progress]);

  const topicRowMeta = useMemo(
    () => (topic: Topic) => {
      const tp = progress.get(topic.id);
      const done = tp?.completed === true;
      const fi = firstIncomplete;
      const isFirstIncomplete = fi === topic.id;
      const isFuture = fi ? (() => {
        const list = getTopicNavList();
        const fiIdx = list.findIndex((e) => e.topic.id === fi);
        const tIdx = list.findIndex((e) => e.topic.id === topic.id);
        return tIdx > fiIdx;
      })() : false;

      let right: 'done' | 'continue' | 'start' | null = null;
      if (done) right = 'done';
      else if (isFuture) right = null;
      else if (isFirstIncomplete) {
        right = currentTopicId === topic.id ? 'continue' : 'start';
      }
      return { done, right };
    },
    [progress, firstIncomplete, currentTopicId]
  );

  const startChapter1 = () => {
    const ch = CURRICULUM[0];
    const t = ch?.topics[0];
    if (ch && t) {
      setCurrentTopic(ch.id, t.id);
      onOpenTopic(t.id);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">NodeBreaker Academy</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Master System Design — From Basics to Interview Ready
            </p>
            <p className="pt-2 text-sm text-[var(--text-secondary)]">
              {overallDone} of {overallTotal} topics complete
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
              <div
                className="h-full rounded-full bg-cyan-500/90 transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
              <span aria-hidden>⚡</span>
              <span>{totalXP} XP</span>
              <span aria-hidden>🔥</span>
              <span>{streak} day{streak === 1 ? '' : 's'}</span>
            </div>
            <button
              type="button"
              onClick={onSkipToSandbox}
              className="rounded-md border border-transparent px-2 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
            >
              Skip to Sandbox →
            </button>
          </div>
        </div>

        {continueCtx ? (
          <div
            className={`${cardBase} mt-10 border-l-4 p-5`}
            style={{ borderLeftColor: continueCtx.chapter.color }}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
              Continue where you left off
            </p>
            <p className="mt-2 text-sm text-[var(--text)]">
              Chapter {continueCtx.chapter.number}: {continueCtx.chapter.title} → Topic: {continueCtx.topic.title}
            </p>
            <button
              type="button"
              onClick={() => onOpenTopic(continueCtx.topic.id)}
              className="mt-4 inline-flex items-center gap-1 rounded-md bg-cyan-600/90 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-500"
            >
              Continue
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ) : null}

        {!hasAnyCompleted ? (
          <div className={`${cardBase} mt-10 p-8`}>
            <h2 className="text-lg font-semibold">Welcome to NodeBreaker Academy</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              {CURRICULUM.length} chapters. {overallTotal} topics. From &quot;what is a server?&quot; to &quot;design
              Twitter&apos;s backend.&quot;
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              Each topic: Read the theory → See it in the simulator → Prove you understand (100% quiz).
            </p>
            <button
              type="button"
              onClick={startChapter1}
              className="mt-6 inline-flex items-center gap-1 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500"
            >
              Start Chapter 1
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ) : null}

        <div className="mt-12 space-y-3">
          {CURRICULUM.map((chapter) => {
            const st = getChapterState(chapter, progress);
            const chProg = getChapterProgress(chapter.id);
            const borderClass =
              st === 'done'
                ? 'border-l-emerald-500'
                : st === 'active'
                  ? 'border-l-cyan-500'
                  : 'border-l-zinc-600';
            const expanded = expandedIds.has(chapter.id);

            return (
              <div key={chapter.id} className={`${cardBase} overflow-hidden border-l-4 ${borderClass}`}>
                <button
                  type="button"
                  onClick={() => toggleChapter(chapter.id)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--surface-hover)]"
                >
                  <ChapterIcon name={chapter.icon} color={chapter.color} />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-[var(--text)]">
                      Chapter {chapter.number}: {chapter.title}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {st === 'done' ? (
                      <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} aria-label="Chapter complete" />
                    ) : null}
                    <span className="text-xs tabular-nums text-[var(--text-secondary)]">
                      {chProg.completed}/{chProg.total}
                    </span>
                    <div className="flex gap-0.5">
                      {chapter.topics.map((t) => (
                        <span
                          key={t.id}
                          className={`h-1.5 w-1.5 rounded-full ${
                            progress.get(t.id)?.completed ? 'bg-emerald-500' : 'bg-[var(--border)]'
                          }`}
                          aria-hidden
                        />
                      ))}
                    </div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[var(--border)] px-2 py-2">
                        {chapter.topics.map((topic) => {
                          const { done, right } = topicRowMeta(topic);
                          return (
                            <button
                              key={topic.id}
                              type="button"
                              onClick={() => {
                                setCurrentTopic(chapter.id, topic.id);
                                onOpenTopic(topic.id);
                              }}
                              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--surface-hover)]"
                            >
                              <span
                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                  done ? 'bg-emerald-500' : 'border border-[var(--border)] bg-transparent'
                                }`}
                                aria-hidden
                              />
                              <span className="min-w-0 flex-1 text-[var(--text)]">{topic.title}</span>
                              {right === 'done' ? (
                                <span className="shrink-0 rounded-full bg-emerald-950/80 px-2 py-0.5 text-xs font-medium text-emerald-200">
                                  Done
                                </span>
                              ) : null}
                              {right === 'continue' ? (
                                <span className="shrink-0 text-xs font-medium text-cyan-400">Continue →</span>
                              ) : null}
                              {right === 'start' ? (
                                <span className="shrink-0 text-xs font-medium text-[var(--text-secondary)]">
                                  Start →
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
