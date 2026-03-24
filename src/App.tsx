import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout';
import { BuildView, InterviewCardModal, InterviewCards, JourneyMap, LearnView } from '@/components/journey';
import { GlobalConfirmDialog } from '@/components/ui';
import type { JourneyStage } from '@/constants/journey';
import { JOURNEY_STAGES } from '@/constants/journey';
import { useChallengeStore } from '@/store/useChallengeStore';
import { useChaosStore } from '@/store/useChaosStore';
import { useFlowStore } from '@/store/useFlowStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useJourneyStore } from '@/store/useJourneyStore';
import { useSimStore } from '@/store/useSimStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useToastStore } from '@/store/useToastStore';
import { useTutorialStore } from '@/store/useTutorialStore';
import { decodeSharedDesign } from '@/utils/sharing';

export default function App() {
  const theme = useThemeStore((s) => s.theme);
  const [currentView, setCurrentView] = useState<'journey' | 'sandbox'>('journey');
  const [activeLearnStage, setActiveLearnStage] = useState<JourneyStage | null>(null);
  const [activeBuildStage, setActiveBuildStage] = useState<JourneyStage | null>(null);
  const [cardsOpen, setCardsOpen] = useState(false);
  const [collectedCardStage, setCollectedCardStage] = useState<JourneyStage | null>(null);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [learnSandboxState, setLearnSandboxState] = useState<{ stage: JourneyStage; prompt: string } | null>(null);

  const completeTutorialPart = useJourneyStore((s) => s.completeTutorial);
  const completeChallengePart = useJourneyStore((s) => s.completeChallenge);
  const collectInterviewCard = useJourneyStore((s) => s.collectInterviewCard);
  const lastXPGain = useJourneyStore((s) => s.lastXPGain);
  const clearXPGain = useJourneyStore((s) => s.clearXPGain);

  const completedTutorials = useTutorialStore((s) => s.completedTutorials);
  const completedChallenges = useChallengeStore((s) => s.completedChallenges);
  const startTutorial = useTutorialStore((s) => s.startTutorial);
  const startChallenge = useChallengeStore((s) => s.startChallenge);

  const stageByTutorialId = useMemo(() => {
    const pairs: Array<[string, string]> = JOURNEY_STAGES.filter((stage) => stage.parts.tutorial).map((stage) => [
      stage.parts.tutorial!,
      stage.id,
    ]);
    return new Map<string, string>(pairs);
  }, []);

  const stageByChallengeId = useMemo(() => {
    const pairs: Array<[string, string]> = JOURNEY_STAGES.filter((stage) => stage.parts.challenge).map((stage) => [
      stage.parts.challenge!,
      stage.id,
    ]);
    return new Map<string, string>(pairs);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('d');
    if (!encoded) return;
    const decoded = decodeSharedDesign(encoded);
    if (!decoded) {
      useToastStore.getState().push({
        kind: 'error',
        message: 'Could not load shared design - invalid data',
      });
      return;
    }
    useChaosStore.getState().clearAllChaos();
    useSimStore.getState().stopSession();
    useHistoryStore.getState().clear();
    useFlowStore.getState().replaceGraph(decoded.nodes, decoded.edges);
    useToastStore.getState().push({
      kind: 'success',
      message: `Loaded shared design: ${decoded.name}`,
    });
    setCurrentView('sandbox');
    params.delete('d');
    const next = params.toString();
    const cleanUrl = `${window.location.pathname}${next ? `?${next}` : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }, []);

  useEffect(() => {
    for (const tutorialId of completedTutorials) {
      const stageId = stageByTutorialId.get(tutorialId);
      if (stageId) completeTutorialPart(stageId);
    }
  }, [completedTutorials, stageByTutorialId, completeTutorialPart]);

  useEffect(() => {
    for (const challengeId of completedChallenges.keys()) {
      const stageId = stageByChallengeId.get(challengeId);
      if (stageId) completeChallengePart(stageId);
    }
  }, [completedChallenges, stageByChallengeId, completeChallengePart]);

  useEffect(() => {
    if (!lastXPGain) return;
    const timeout = window.setTimeout(() => clearXPGain(), 1800);
    return () => window.clearTimeout(timeout);
  }, [lastXPGain, clearXPGain]);

  if (activeLearnStage) {
    return (
      <>
        <LearnView
          stage={activeLearnStage}
          onBack={() => setActiveLearnStage(null)}
          onTryInSandbox={(prompt) => {
            setLearnSandboxState({ stage: activeLearnStage, prompt });
            setActiveLearnStage(null);
            setCurrentView('sandbox');
          }}
        />
        <GlobalConfirmDialog />
      </>
    );
  }

  return (
    <>
      {currentView === 'journey' ? (
        <JourneyMap
          onOpenLearn={(stage) => setActiveLearnStage(stage)}
          onOpenBuild={(stage) => {
            setActiveBuildStage(stage);
            setCurrentView('sandbox');
          }}
          onOpenSandbox={() => setCurrentView('sandbox')}
          onOpenCards={() => setCardsOpen(true)}
          onStartTutorial={(tutorialId) => {
            setCurrentView('sandbox');
            startTutorial(tutorialId);
          }}
          onStartChallenge={(challengeId) => {
            setCurrentView('sandbox');
            startChallenge(challengeId);
          }}
          onCollectCard={(stage) => {
            collectInterviewCard(stage.id);
            setCollectedCardStage(stage);
            setCardModalOpen(true);
          }}
        />
      ) : (
        <AppShell
          currentView={currentView}
          onSwitchView={setCurrentView}
          onOpenCards={() => setCardsOpen(true)}
          overlay={
            activeBuildStage ? (
              <BuildView
                stage={activeBuildStage}
                onBackToJourney={() => {
                  setActiveBuildStage(null);
                  setCurrentView('journey');
                }}
              />
            ) : learnSandboxState ? (
              <div className="pointer-events-none fixed inset-0 z-[160]">
                <div className="pointer-events-auto absolute left-4 top-4 max-w-sm rounded-xl border border-cyan-700/50 bg-zinc-900/95 p-4">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveLearnStage(learnSandboxState.stage);
                      setCurrentView('journey');
                      setLearnSandboxState(null);
                    }}
                    className="mb-3 rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                  >
                    Back to Learn
                  </button>
                  <h3 className="text-sm font-semibold text-cyan-200">Try this in the Sandbox</h3>
                  <p className="mt-2 whitespace-pre-line text-sm text-zinc-200">{learnSandboxState.prompt}</p>
                </div>
              </div>
            ) : null
          }
        />
      )}
      {cardsOpen ? <InterviewCards onClose={() => setCardsOpen(false)} /> : null}
      <InterviewCardModal
        stage={collectedCardStage}
        isOpen={cardModalOpen}
        onClose={() => {
          setCardModalOpen(false);
          setCollectedCardStage(null);
        }}
      />
      {lastXPGain > 0 ? (
        <div className="pointer-events-none fixed right-6 top-16 z-[180] rounded-full border border-emerald-500/50 bg-emerald-950/80 px-3 py-1 text-xs font-semibold text-emerald-200">
          +{lastXPGain} XP!
        </div>
      ) : null}
      <GlobalConfirmDialog />
    </>
  );
}
