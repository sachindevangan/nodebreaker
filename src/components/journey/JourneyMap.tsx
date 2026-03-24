import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Flame,
  Trophy,
} from 'lucide-react';
import { JOURNEY_STAGES, type JourneyStage } from '@/constants/journey';
import { useJourneyStore } from '@/store/useJourneyStore';

interface JourneyMapProps {
  onOpenLearn: (stage: JourneyStage) => void;
  onOpenBuild: (stage: JourneyStage) => void;
  onOpenSandbox: () => void;
  onOpenCards: () => void;
  onStartTutorial: (tutorialId: string, stageId: string) => void;
  onStartChallenge: (challengeId: string, stageId: string) => void;
  onCollectCard: (stage: JourneyStage) => void;
}

const STAGE_ACCENTS: Record<number, string> = {
  1: '#3b82f6',
  2: '#f59e0b',
  3: '#a855f7',
  4: '#eab308',
  5: '#06b6d4',
  6: '#ef4444',
  7: '#f97316',
  8: '#22c55e',
  9: '#8b5cf6',
  10: '#ef4444',
};

export function JourneyMap({
  onOpenLearn,
  onOpenBuild,
  onOpenSandbox,
  onOpenCards,
  onStartTutorial,
  onStartChallenge,
  onCollectCard,
}: JourneyMapProps) {
  const completedStages = useJourneyStore((s) => s.completedStages);
  const isStageUnlocked = useJourneyStore((s) => s.isStageUnlocked);
  const getStageProgress = useJourneyStore((s) => s.getStageProgress);
  const getCurrentStage = useJourneyStore((s) => s.getCurrentStage);
  const getOverallProgress = useJourneyStore((s) => s.getOverallProgress);
  const totalXP = useJourneyStore((s) => s.totalXP);
  const streak = useJourneyStore((s) => s.streak);
  const stageProgress = useJourneyStore((s) => s.stageProgress);
  const [selectedStage, setSelectedStage] = useState<JourneyStage | null>(null);
  const currentStageId = getCurrentStage() ?? 'stage-1';

  const firstStage = JOURNEY_STAGES[0];
  if (!firstStage) return null;

  const completedCount = completedStages.size;
  const overallProgress = getOverallProgress();
  const currentNumber =
    JOURNEY_STAGES.find((stage) => stage.id === currentStageId)?.number ?? Math.min(completedCount + 1, 10);

  const stageCards = useMemo(
    () =>
      JOURNEY_STAGES.map((stage) => {
        const completed = completedStages.has(stage.id);
        const current = currentStageId === stage.id;
        const unlocked = isStageUnlocked(stage.id);
        const progress = getStageProgress(stage.id);
        const details = stageProgress.get(stage.id);
        const challengeCompleted = Boolean(details?.challengeCompleted);
        return { stage, completed, current, unlocked, progress, challengeCompleted };
      }),
    [completedStages, currentStageId, getStageProgress, isStageUnlocked, stageProgress]
  );

  const hasStarted =
    completedCount > 0 ||
    Array.from(stageProgress.values()).some(
      (p) => p.learnCompleted || p.buildCompleted || p.tutorialCompleted || p.challengeCompleted || p.interviewCardCollected
    );

  const challengeCompletedCount = Array.from(stageProgress.values()).filter((p) => p.challengeCompleted).length;
  const currentStage = JOURNEY_STAGES.find((stage) => stage.id === currentStageId) ?? firstStage;
  const quickChallengeStage =
    (currentStage.parts.challenge ? currentStage : undefined) ??
    JOURNEY_STAGES.find((stage) => stage.parts.challenge && isStageUnlocked(stage.id));

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 xl:px-0">
        <header className="mb-6 space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold">System Design Journey</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Stage {currentNumber} of 10 • {overallProgress}% complete
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              <span>{totalXP} XP</span>
              <span className="inline-flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-orange-400" />
                {streak > 0 ? `${streak} day streak` : 'No streak yet'}
              </span>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface)]">
            <div className="h-full rounded-full bg-blue-500" style={{ width: `${overallProgress}%` }} />
          </div>
        </header>

        <section className="mb-7 flex gap-3 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => onOpenLearn(currentStage)}
            className="min-w-[220px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-left hover:bg-[var(--surface-hover)]"
          >
            <p className="text-sm font-medium">Continue Learning</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Stage {currentStage.number}: {currentStage.title}</p>
          </button>

          <button
            type="button"
            onClick={() => {
              if (quickChallengeStage?.parts.challenge) {
                onStartChallenge(quickChallengeStage.parts.challenge, quickChallengeStage.id);
              }
            }}
            className="min-w-[220px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-left hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!quickChallengeStage?.parts.challenge}
          >
            <p className="text-sm font-medium">Challenges</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{challengeCompletedCount} completed</p>
          </button>

          <button
            type="button"
            onClick={onOpenCards}
            className="min-w-[220px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-left hover:bg-[var(--surface-hover)]"
          >
            <p className="text-sm font-medium">Interview Mode</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Quick launch interview cards</p>
          </button>

          <button
            type="button"
            onClick={onOpenSandbox}
            className="min-w-[220px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-left hover:bg-[var(--surface-hover)]"
          >
            <p className="text-sm font-medium">Sandbox</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Open free canvas</p>
          </button>
        </section>

        {!hasStarted ? (
          <section className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-lg font-semibold">Welcome to NodeBreaker&apos;s System Design Journey.</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              10 stages from basics to interview-ready. Each stage: read -&gt; build -&gt; practice -&gt; prove.
            </p>
            <button
              type="button"
              onClick={() => onOpenLearn(firstStage)}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Start Stage 1
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {stageCards.map(({ stage, completed, current, unlocked, progress, challengeCompleted }) => (
            <button
              key={stage.id}
              type="button"
              onClick={() => setSelectedStage(stage)}
              className={`w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-left hover:bg-[var(--surface-hover)] ${
                current ? 'ring-1 ring-blue-500/60' : ''
              }`}
              style={{ borderLeft: `4px solid ${STAGE_ACCENTS[stage.number] ?? stage.color}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-[var(--text-muted)]">Stage {stage.number}</p>
                  <h3 className="truncate text-lg font-semibold">{stage.title}</h3>
                  <p className="truncate text-sm text-[var(--text-secondary)]">{stage.subtitle}</p>
                </div>
                {completed ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                    <Check className="h-3 w-3" />
                    Complete
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-secondary)]">
                <span>{progress}% complete</span>
                <span>{unlocked ? 'Unlocked' : 'Locked'}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${progress}%` }} />
              </div>
              {challengeCompleted ? (
                <p className="mt-2 inline-flex items-center gap-1 text-sm text-amber-300">
                  <Trophy className="h-3.5 w-3.5" />
                  Challenge completed
                </p>
              ) : null}
            </button>
          ))}
        </section>
      </div>

      {selectedStage ? (
        <div
          className="fixed inset-0 z-[150] bg-black/55 p-4 backdrop-blur-sm"
          onClick={() => setSelectedStage(null)}
          role="presentation"
        >
          <div
            className="mx-auto mt-8 max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Stage ${selectedStage.number} details`}
          >
            <p className="text-sm text-[var(--text-muted)]">Stage {selectedStage.number}</p>
            <h3 className="mt-1 text-lg font-semibold">{selectedStage.title}</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{selectedStage.description}</p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--bg)] p-2.5">
                <span>Learn ({selectedStage.parts.learn.estimatedMinutes} min read)</span>
                <button className="text-blue-400" onClick={() => onOpenLearn(selectedStage)}>
                  Start
                </button>
              </div>
              <div className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--bg)] p-2.5">
                <span>Build</span>
                <button className="text-blue-400" onClick={() => onOpenBuild(selectedStage)}>
                  Try it
                </button>
              </div>
              <div className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--bg)] p-2.5">
                <span>Tutorial</span>
                {selectedStage.parts.tutorial ? (
                  <button
                    className="text-blue-400"
                    onClick={() => onStartTutorial(selectedStage.parts.tutorial!, selectedStage.id)}
                  >
                    Start tutorial
                  </button>
                ) : (
                  <span className="text-[var(--text-muted)]">Not available</span>
                )}
              </div>
              <div className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--bg)] p-2.5">
                <span>Challenge</span>
                {selectedStage.parts.challenge ? (
                  <button
                    className="text-blue-400"
                    onClick={() => onStartChallenge(selectedStage.parts.challenge!, selectedStage.id)}
                  >
                    Start challenge
                  </button>
                ) : (
                  <span className="text-[var(--text-muted)]">Not available</span>
                )}
              </div>
              <div className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--bg)] p-2.5">
                <span>Interview Card</span>
                <button className="text-blue-400" onClick={() => onCollectCard(selectedStage)}>
                  Collect
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
