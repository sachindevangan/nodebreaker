import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout';
import { BuildView, InterviewCardModal, InterviewCards, JourneyMap, LearnView } from '@/components/journey';
import type { JourneyStage } from '@/constants/journey';
import { JOURNEY_STAGES } from '@/constants/journey';
import { useChallengeStore } from '@/store/useChallengeStore';
import { useJourneyStore } from '@/store/useJourneyStore';
import { useTutorialStore } from '@/store/useTutorialStore';

export default function App() {
  const [currentView, setCurrentView] = useState<'journey' | 'sandbox'>('journey');
  const [activeLearnStage, setActiveLearnStage] = useState<JourneyStage | null>(null);
  const [activeBuildStage, setActiveBuildStage] = useState<JourneyStage | null>(null);
  const [cardsOpen, setCardsOpen] = useState(false);
  const [collectedCardStage, setCollectedCardStage] = useState<JourneyStage | null>(null);
  const [cardModalOpen, setCardModalOpen] = useState(false);

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
    return <LearnView stage={activeLearnStage} onBack={() => setActiveLearnStage(null)} />;
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
    </>
  );
}
