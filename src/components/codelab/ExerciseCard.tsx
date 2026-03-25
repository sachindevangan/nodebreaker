import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PracticeExercise } from '@/constants/lldTypes';
import { CodeBlock } from './CodeBlock';

function difficultyPillClass(difficulty: PracticeExercise['difficulty']): string {
  if (difficulty === 'easy') return 'bg-emerald-950/50 text-emerald-200 border-emerald-700';
  if (difficulty === 'medium') return 'bg-amber-950/50 text-amber-200 border-amber-700';
  return 'bg-red-950/50 text-red-200 border-red-700';
}

export function ExerciseCard({
  topicId,
  exerciseIndex,
  exercise,
  completed,
  solutionRevealed,
  connectedHldTopics,
  onGoToHldTopic,
  onMarkComplete,
  onRevealSolution,
}: {
  topicId: string;
  exerciseIndex: number;
  exercise: PracticeExercise;
  completed: boolean;
  solutionRevealed: boolean;
  connectedHldTopics: { id: string; label: string }[];
  onGoToHldTopic: (topicId: string) => void;
  onMarkComplete: (topicId: string, exerciseId: string) => void;
  onRevealSolution: (topicId: string, exerciseIndex: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [revealedHints, setRevealedHints] = useState<boolean[]>(() => [false, false, false]);
  const hasStarter = Boolean(exercise.starterCode.trim());
  const hasSolution = Boolean(exercise.solution.trim());

  const difficultyCls = useMemo(() => difficultyPillClass(exercise.difficulty), [exercise.difficulty]);

  const markComplete = () => {
    onMarkComplete(topicId, exercise.id);
  };

  const reveal = () => {
    onRevealSolution(topicId, exerciseIndex);
  };

  const onToggle = () => setExpanded((v) => !v);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[var(--surface-hover)]"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className={`inline-flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full ${
              completed ? 'bg-emerald-500' : 'border border-[var(--border)] bg-transparent'
            }`}
            aria-hidden
          >
            {completed ? <Check className="h-3.5 w-3.5 text-emerald-950" strokeWidth={2} /> : null}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text)]">{exercise.title}</span>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${difficultyCls}`}>
            {exercise.difficulty === 'easy' ? 'Easy' : exercise.difficulty === 'medium' ? 'Medium' : 'Hard'}
          </span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-[var(--text-secondary)]" /> : <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />}
      </button>

      {expanded ? (
        <div className="border-t border-[var(--border)] px-4 py-4">
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{exercise.description}</p>

          {exercise.requirements.length > 0 ? (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Requirements</p>
              <ul className="space-y-1">
                {exercise.requirements.map((r) => (
                  <li key={r} className="flex gap-2 text-sm text-[var(--text)]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" strokeWidth={2} />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {hasStarter ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Starter Code</p>
              <CodeBlock code={exercise.starterCode} copyLabel="Copy Starter Code" />
              <p className="text-xs text-[var(--text-secondary)]">Copy this to your VS Code and implement the TODOs.</p>
            </div>
          ) : null}

          {exercise.testCases.length > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Test cases</p>
              <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                {exercise.testCases.map((t) => (
                  <li key={t}>Test: {t}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {exercise.hints.length > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Hints</p>
              <div className="space-y-2">
                {exercise.hints.slice(0, 3).map((hint, i) => (
                  <div key={`${exercise.id}-hint-${i}`} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                    {revealedHints[i] ? (
                      <>
                        <p className="text-sm text-[var(--text)]">{hint}</p>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setRevealedHints((prev) => prev.map((v, idx) => (idx === i ? true : v)))}
                        className="rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                      >
                        Reveal Hint {i + 1}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 space-y-3">
            {solutionRevealed ? (
              hasSolution ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-200">
                    <Check className="h-4 w-4" strokeWidth={2} />
                    Solution revealed
                  </div>
                  <CodeBlock code={exercise.solution} copyLabel="Copy Solution" highlightLines={undefined} />
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{exercise.solutionExplanation}</p>
                  {exercise.designPrinciples.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {exercise.designPrinciples.map((dp) => (
                        <span key={dp} className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                          {dp}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {connectedHldTopics.length > 0 ? (
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">HLD connection</p>
                      <div className="mt-2 flex flex-wrap gap-3">
                        {connectedHldTopics.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => onGoToHldTopic(t.id)}
                            className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
                          >
                            This connects to HLD: {t.label} →
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null
            ) : (
              <button
                type="button"
                onClick={() => {
                  // eslint-disable-next-line no-alert
                  const ok = window.confirm('Try solving it yourself first. Reveal solution?');
                  if (ok) reveal();
                }}
                className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-600"
              >
                Show Solution
              </button>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={markComplete}
                disabled={completed}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {completed ? (
                  <span className="inline-flex items-center gap-2">
                    <Check className="h-4 w-4" strokeWidth={2} />
                    Exercise Complete
                  </span>
                ) : (
                  'Mark as Complete'
                )}
              </button>
              {solutionRevealed ? (
                <span className="text-xs text-[var(--text-secondary)]">
                  Your solution is saved for this exercise (no XP penalty).
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

