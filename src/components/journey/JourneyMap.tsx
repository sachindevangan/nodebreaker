import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Flame,
  Gauge,
  GitBranch,
  Layout,
  Layers,
  ListOrdered,
  Server,
  ShieldAlert,
  TrendingUp,
  Trophy,
  Wrench,
  Zap,
  Database,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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

const ICONS: Record<string, LucideIcon> = {
  Server,
  Gauge,
  Database,
  Zap,
  GitBranch,
  ShieldAlert,
  ListOrdered,
  TrendingUp,
  Layout,
  Flame,
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
  const currentStageId = getCurrentStage();
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!currentStageId || !scrollerRef.current) return;
    const target = scrollerRef.current.querySelector(`[data-stage-id="${currentStageId}"]`);
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStageId]);

  const completedCount = completedStages.size;
  const overallProgress = getOverallProgress();
  const currentNumber =
    JOURNEY_STAGES.find((stage) => stage.id === currentStageId)?.number ?? Math.min(completedCount + 1, 10);

  const stageNodes = useMemo(
    () =>
      JOURNEY_STAGES.map((stage) => {
        const completed = completedStages.has(stage.id);
        const current = currentStageId === stage.id;
        const unlocked = isStageUnlocked(stage.id);
        return { stage, completed, current, unlocked };
      }),
    [completedStages, currentStageId, isStageUnlocked]
  );

  return (
    <div className="relative h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_35%),radial-gradient(circle_at_bottom,rgba(34,197,94,0.08),transparent_35%)]" />
      <div className="relative flex h-full flex-col">
        <header className="border-b border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold">System Design Journey</h1>
              <p className="text-xs text-zinc-400">
                Stage {currentNumber} of 10 - {overallProgress}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenCards}
                className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1.5 text-xs hover:bg-zinc-800"
              >
                <Layers className="h-3.5 w-3.5" />
                Cards
              </button>
              <button
                type="button"
                onClick={onOpenSandbox}
                className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1.5 text-xs hover:bg-zinc-800"
              >
                Skip to Sandbox <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full rounded-full bg-blue-500" style={{ width: `${overallProgress}%` }} />
            </div>
            <p className="text-xs text-amber-300">⚡ {totalXP} XP</p>
            <p className="text-xs text-orange-300">{streak > 0 ? `🔥 ${streak} day streak` : 'Start your streak!'}</p>
          </div>
        </header>

        <div ref={scrollerRef} className="min-h-0 flex-1 overflow-auto px-4 py-8">
          <div className="mx-auto max-w-5xl">
            {stageNodes.map(({ stage, completed, current }) => {
              const Icon = ICONS[stage.icon] ?? Server;
              const isOdd = stage.number % 2 === 1;
              const progress = getStageProgress(stage.id);
              return (
                <div
                  key={stage.id}
                  data-stage-id={stage.id}
                  className={`relative mb-10 flex items-center ${isOdd ? 'justify-start' : 'justify-end'}`}
                >
                  <div className="absolute left-1/2 top-0 -ml-px h-[140%] w-0.5 bg-zinc-700/70" />
                  <button
                    type="button"
                    onClick={() => setSelectedStage(stage)}
                    className={`group relative z-10 flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-left transition hover:border-zinc-500 ${
                      current ? 'ring-2 ring-blue-500/60' : ''
                    }`}
                    style={{ width: 'min(92%, 460px)' }}
                  >
                    <span
                      className={`relative inline-flex items-center justify-center rounded-full border ${
                        current ? 'h-20 w-20' : 'h-16 w-16'
                      } ${completed ? 'border-emerald-400 bg-emerald-600/20' : 'border-zinc-600 bg-zinc-900'} `}
                    >
                      <Icon className="h-6 w-6" style={{ color: stage.color }} />
                      {completed ? (
                        <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500 p-1">
                          <Check className="h-3 w-3 text-white" />
                        </span>
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <p className="text-xs text-zinc-500">Stage {stage.number}</p>
                      <p className="truncate text-sm font-semibold text-zinc-100">{stage.title}</p>
                      <p className="truncate text-xs text-zinc-400">{stage.subtitle}</p>
                      <p className="mt-1 text-[11px] text-zinc-500">{progress}% complete</p>
                    </span>
                    {current ? <span className="animate-pulse text-xs font-semibold text-blue-300">Continue →</span> : null}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedStage ? (
        <div className="fixed inset-0 z-[150] bg-black/70 p-4 backdrop-blur-sm" onClick={() => setSelectedStage(null)}>
          <div
            className="mx-auto max-w-2xl rounded-xl border border-zinc-700 bg-zinc-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-zinc-500">Stage {selectedStage.number}</p>
            <h3 className="mt-1 text-xl font-semibold text-zinc-100">{selectedStage.title}</h3>
            <p className="mt-2 text-sm text-zinc-300">{selectedStage.description}</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-950 p-2">
                <span>📖 Learn ({selectedStage.parts.learn.estimatedMinutes} min read)</span>
                <button className="text-blue-300" onClick={() => onOpenLearn(selectedStage)}>Start</button>
              </div>
              <div className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-950 p-2">
                <span>🔧 Build</span>
                <button className="text-blue-300" onClick={() => onOpenBuild(selectedStage)}>Try it</button>
              </div>
              <div className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-950 p-2">
                <span>🎓 Tutorial</span>
                {selectedStage.parts.tutorial ? (
                  <button className="text-blue-300" onClick={() => onStartTutorial(selectedStage.parts.tutorial!, selectedStage.id)}>
                    Start Tutorial
                  </button>
                ) : (
                  <span className="text-zinc-500">Not available</span>
                )}
              </div>
              <div className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-950 p-2">
                <span>🏆 Challenge</span>
                {selectedStage.parts.challenge ? (
                  <button className="text-blue-300" onClick={() => onStartChallenge(selectedStage.parts.challenge!, selectedStage.id)}>
                    Start Challenge
                  </button>
                ) : (
                  <span className="text-zinc-500">Not available</span>
                )}
              </div>
              <div className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-950 p-2">
                <span>💡 Interview Card</span>
                <button className="text-blue-300" onClick={() => onCollectCard(selectedStage)}>
                  Collect
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {selectedStage.concepts.map((concept) => (
                <span key={concept} className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                  {concept}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-amber-300">⚡ XP Reward: {selectedStage.xpReward}</p>
            <button
              type="button"
              onClick={() => onOpenLearn(selectedStage)}
              className="mt-4 inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
            >
              <Wrench className="h-4 w-4" />
              Start Learning
            </button>
            {stageProgress.get(selectedStage.id)?.challengeCompleted ? (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-amber-300">
                <Trophy className="h-3.5 w-3.5" /> Challenge completed
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
