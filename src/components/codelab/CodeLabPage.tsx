import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import {
  LLD_CURRICULUM,
  getLLDTopicNavList,
} from '@/constants/lldCurriculum';
import type { LLDChapter, LLDTopic } from '@/constants/lldTypes';
import { useAcademyStore } from '@/store/useAcademyStore';
import { useCodeLabStore } from '@/store/useCodeLabStore';
import { getTopicContext } from '@/constants/curriculum';

const cardBase = 'rounded-lg border border-[var(--border)] bg-[var(--surface)] transition-colors';

function getChapterIcon({ name, color }: { name: string; color: string }) {
  const Icon = (LucideIcons as unknown as Record<
    string,
    ComponentType<{ className?: string; strokeWidth?: number }>
  >)[name];
  if (!Icon) return null;
  return (
    <span style={{ color }} className="inline-flex" aria-hidden>
      <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
    </span>
  );
}

function getFirstIncompleteTopicId(progress: Map<string, { completed: boolean }>): string | null {
  for (const entry of getLLDTopicNavList()) {
    if (!progress.get(entry.topic.id)?.completed) return entry.topic.id;
  }
  return null;
}

function getChapterState(chapter: LLDChapter, progress: Map<string, { completed: boolean }>): 'done' | 'active' | 'idle' {
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

function difficultyForChapterId(chapterId: string): 'easy' | 'medium' | 'hard' | null {
  if (chapterId === 'L7') return 'easy';
  if (chapterId === 'L8') return 'medium';
  if (chapterId === 'L9') return 'hard';
  return null;
}

function difficultyPill(difficulty: 'easy' | 'medium' | 'hard'): string {
  if (difficulty === 'easy') return 'bg-emerald-950/50 text-emerald-200 border-emerald-700';
  if (difficulty === 'medium') return 'bg-amber-950/50 text-amber-200 border-amber-700';
  return 'bg-red-950/50 text-red-200 border-red-700';
}

const noop = (): void => {};

export function CodeLabPage({
  onOpenTopic,
  onGoToHldTopic = noop,
}: {
  onOpenTopic: (topicId: string) => void;
  onGoToHldTopic?: (topicId: string) => void;
}) {
  const progress = useCodeLabStore((s) => s.progress);
  const progressByCompleted = useMemo(() => progress as unknown as Map<string, { completed: boolean }>, [progress]);
  const totalXP = useAcademyStore((s) => s.totalXP) + useCodeLabStore((s) => s.totalXP);
  const { completed: overallDone, total: overallTotal, percentage } = useCodeLabStore((s) => s.getOverallProgress());

  const firstIncomplete = useMemo(() => getFirstIncompleteTopicId(progressByCompleted), [progressByCompleted]);
  const defaultOpenChapterId = useMemo(() => {
    if (!firstIncomplete) return LLD_CURRICULUM[0]?.id ?? null;
    const ctx = getLLDTopicNavList().find((e) => e.topic.id === firstIncomplete);
    return ctx?.chapter.id ?? LLD_CURRICULUM[0]?.id ?? null;
  }, [firstIncomplete]);

  const hasAnyProgress = progress.size > 0;

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

  const part1 = useMemo(() => LLD_CURRICULUM.filter((c) => c.part === 'foundations'), []);
  const part2 = useMemo(() => LLD_CURRICULUM.filter((c) => c.part === 'problems'), []);

  const renderConnectedLinks = (topic: LLDTopic) => {
    if (topic.connectedHLDTopics.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2">
        {topic.connectedHLDTopics.map((hldTopicId) => {
          const ctx = getTopicContext(hldTopicId);
          if (!ctx) return null;
          return (
            <button
              key={hldTopicId}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onGoToHldTopic(hldTopicId);
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface-hover)] px-2 py-0.5 text-[11px] font-medium text-cyan-200 hover:text-cyan-100"
            >
              Connected: HLD Ch{ctx.chapter.number} — {ctx.chapter.title}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Code Lab — Low-Level Design</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Master object-oriented design in Java — from SOLID principles to system design
            </p>
            <p className="pt-2 text-sm text-[var(--text-secondary)]">
              {overallDone} of {overallTotal} topics complete
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
              <div className="h-full rounded-full bg-cyan-500/90 transition-all" style={{ width: `${percentage}%` }} />
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
              <span aria-hidden>⚡</span>
              <span>{totalXP} XP</span>
            </div>
          </div>
        </div>

        {!hasAnyProgress ? (
          <div className={`${cardBase} mt-10 p-8`}>
            <h2 className="text-lg font-semibold">Welcome to Code Lab</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              9 chapters. 47 topics. From Java OOP basics to designing production systems.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              Study the theory here. Code in your VS Code. Come back to check solutions.
            </p>
            <button
              type="button"
              onClick={() => {
                const first = LLD_CURRICULUM.find((c) => c.id === 'L1')?.topics[0]?.id;
                if (first) onOpenTopic(first);
              }}
              className="mt-6 inline-flex items-center gap-1 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500"
            >
              Start Chapter L1 →
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ) : null}

        <div className="mt-12 space-y-6">
          <div className="text-sm font-semibold text-[var(--text)]">Part 1: Foundations</div>
          {part1.map((chapter) => {
            const st = getChapterState(chapter, progressByCompleted);
            const expanded = expandedIds.has(chapter.id);
            const chProg = {
              completed: chapter.topics.filter((t) => progress.get(t.id)?.completed).length,
              total: chapter.topics.length,
            };
            const borderClass =
              st === 'done' ? 'border-l-emerald-500' : st === 'active' ? 'border-l-cyan-500' : 'border-l-zinc-600';
            return (
              <div key={chapter.id} className={`${cardBase} overflow-hidden border-l-4 ${borderClass}`}>
                <button
                  type="button"
                  onClick={() => toggleChapter(chapter.id)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--surface-hover)]"
                >
                  {getChapterIcon({ name: chapter.icon, color: chapter.color })}
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-[var(--text)]">
                      Chapter {chapter.id}: {chapter.title}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {st === 'done' ? <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} /> : null}
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
                        {chapter.topics.map((topic) => (
                          <button
                            key={topic.id}
                            type="button"
                            onClick={() => onOpenTopic(topic.id)}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--surface-hover)]"
                          >
                            <span
                              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                progress.get(topic.id)?.completed ? 'bg-emerald-500' : 'border border-[var(--border)] bg-transparent'
                              }`}
                              aria-hidden
                            />
                            <span className="min-w-0 flex-1 truncate text-[var(--text)]">{topic.title}</span>
                            {progress.get(topic.id)?.completed ? (
                              <span className="shrink-0 rounded-full bg-emerald-950/80 px-2 py-0.5 text-xs font-medium text-emerald-200">
                                Done
                              </span>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}

          <div className="text-sm font-semibold text-[var(--text)] pt-6">Part 2: Practice Problems</div>
          {part2.map((chapter) => {
            const st = getChapterState(chapter, progressByCompleted);
            const expanded = expandedIds.has(chapter.id);
            const chProg = {
              completed: chapter.topics.filter((t) => progress.get(t.id)?.completed).length,
              total: chapter.topics.length,
            };
            const borderClass =
              st === 'done' ? 'border-l-emerald-500' : st === 'active' ? 'border-l-cyan-500' : 'border-l-zinc-600';
            const diff = difficultyForChapterId(chapter.id);
            if (!diff) return null;
            return (
              <div key={chapter.id} className={`${cardBase} overflow-hidden border-l-4 ${borderClass}`}>
                <button
                  type="button"
                  onClick={() => toggleChapter(chapter.id)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--surface-hover)]"
                >
                  {getChapterIcon({ name: chapter.icon, color: chapter.color })}
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-[var(--text)]">
                      Chapter {chapter.id}: {chapter.title}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {st === 'done' ? <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} /> : null}
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
                        {chapter.topics.map((topic) => (
                          <div key={topic.id} className="px-1 py-1">
                            <button
                              type="button"
                              onClick={() => onOpenTopic(topic.id)}
                              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--surface-hover)]"
                            >
                              <span
                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                  progress.get(topic.id)?.completed ? 'bg-emerald-500' : 'border border-[var(--border)] bg-transparent'
                                }`}
                                aria-hidden
                              />
                              <span className="min-w-0 flex-1 truncate text-[var(--text)]">{topic.title}</span>
                              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${difficultyPill(diff)}`}>
                                {diff === 'easy' ? 'Easy' : diff === 'medium' ? 'Medium' : 'Hard'}
                              </span>
                            </button>
                            <div className="mt-2 pl-7">{renderConnectedLinks(topic)}</div>
                          </div>
                        ))}
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

