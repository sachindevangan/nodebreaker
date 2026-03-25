import { useEffect, useState } from 'react';
import { AcademyDemoOverlay, AcademyPage, InterviewTips, TopicPage } from '@/components/academy';
import { CodeLabPage, LLDTopicPage } from '@/components/codelab';
import { AppShell } from '@/components/layout';
import { Header } from '@/components/layout/Header';
import { GlobalConfirmDialog } from '@/components/ui';
import { GlossaryModal } from '@/components/panels/GlossaryModal';
import type { SimulatorDemo } from '@/constants/curriculum';
import { useAcademyStore } from '@/store/useAcademyStore';
import { useChaosStore } from '@/store/useChaosStore';
import { useFlowStore } from '@/store/useFlowStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useKnowledgeStore } from '@/store/useKnowledgeStore';
import { useSimStore } from '@/store/useSimStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useToastStore } from '@/store/useToastStore';
import { parseChaosEventType } from '@/utils/academyChaos';
import { buildGraphFromSimulatorDemo } from '@/utils/academyDemoGraph';
import { getEntryNodeIds } from '@/utils/graph';
import { decodeSharedDesign } from '@/utils/sharing';

interface DemoSession {
  topicId: string;
  instruction: string;
  demo?: SimulatorDemo;
}

function launchSandboxFromTopic(opts: { topicId: string; instruction: string; demo?: SimulatorDemo }): void {
  useChaosStore.getState().clearAllChaos();
  useSimStore.getState().stopSession();
  useHistoryStore.getState().clear();

  const demo = opts.demo;
  if (demo && (demo.templateId || (demo.setupNodes?.length ?? 0) > 0)) {
    const { nodes, edges } = buildGraphFromSimulatorDemo(demo);
    useFlowStore.getState().replaceGraph(nodes, edges);
    if (demo.simulationAutoStart) {
      useSimStore.getState().startSession();
      const chaosType = demo.chaosToInject ? parseChaosEventType(demo.chaosToInject) : null;
      if (chaosType) {
        const { nodes: n, edges: e } = useFlowStore.getState();
        const entry = getEntryNodeIds(n, e)[0];
        if (entry) {
          useChaosStore.getState().injectChaos(chaosType, entry);
        }
      }
    }
  } else {
    useFlowStore.getState().replaceGraph([], []);
  }
}

const noop = (): void => {};

export default function App() {
  const theme = useThemeStore((s) => s.theme);
  const [view, setView] = useState<'academy' | 'codelab' | 'sandbox'>('academy');
  const [topicId, setTopicId] = useState<string | null>(null); // HLD topic id
  const [lldTopicId, setLldTopicId] = useState<string | null>(null); // LLD topic id
  const [demoSession, setDemoSession] = useState<DemoSession | null>(null);
  const [tipsOpen, setTipsOpen] = useState(false);

  const lastXPGain = useAcademyStore((s) => s.lastXPGain);
  const clearXPGain = useAcademyStore((s) => s.clearXPGain);
  const openGlossary = useKnowledgeStore((s) => s.openGlossary);

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
    setView('sandbox');
    setTopicId(null);
    setDemoSession(null);
    params.delete('d');
    const next = params.toString();
    const cleanUrl = `${window.location.pathname}${next ? `?${next}` : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }, []);

  useEffect(() => {
    if (!lastXPGain) return;
    const timeout = window.setTimeout(() => clearXPGain(), 1800);
    return () => window.clearTimeout(timeout);
  }, [lastXPGain, clearXPGain]);

  const shell = topicId ? (
    <TopicPage
      topicId={topicId}
      onBack={() => setTopicId(null)}
      onNavigateTopic={(id) => setTopicId(id)}
      onGoSandbox={(opts) => {
        launchSandboxFromTopic(opts);
        setDemoSession({
          topicId: opts.topicId,
          instruction: opts.instruction,
          demo: opts.demo,
        });
        setTopicId(null);
        setView('sandbox');
      }}
    />
  ) : lldTopicId ? (
    <LLDTopicPage
      topicId={lldTopicId}
      onBack={() => setLldTopicId(null)}
      onGoToHldTopic={(hldTopicId) => {
        setDemoSession(null);
        setTopicId(hldTopicId);
        setLldTopicId(null);
        setView('academy');
      }}
    />
  ) : view === 'academy' ? (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      <Header
        currentView="academy"
        onSwitchView={(v) => {
          setView(v);
          setDemoSession(null);
          if (v === 'academy') setLldTopicId(null);
          if (v !== 'academy') setTopicId(null);
        }}
        onOpenTips={() => setTipsOpen(true)}
        hideCanvasTools
        shortcutsOpen={false}
        onShortcutsOpenChange={noop}
        onTemplates={noop}
        onTutorials={noop}
        onChallenges={noop}
        onExportJson={noop}
        onExportPng={noop}
        onExportSvg={noop}
        onShare={noop}
        onImportClick={noop}
        onResetCanvas={noop}
        onOpenGlossary={openGlossary}
      />
      <AcademyPage onOpenTopic={(id) => setTopicId(id)} onSkipToSandbox={() => setView('sandbox')} />
    </div>
  ) : view === 'codelab' ? (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      <Header
        currentView="codelab"
        onSwitchView={(v) => {
          setView(v);
          setDemoSession(null);
          if (v === 'codelab') setTopicId(null);
          if (v !== 'codelab') setLldTopicId(null);
        }}
        onOpenTips={() => setTipsOpen(true)}
        hideCanvasTools
        shortcutsOpen={false}
        onShortcutsOpenChange={noop}
        onTemplates={noop}
        onTutorials={noop}
        onChallenges={noop}
        onExportJson={noop}
        onExportPng={noop}
        onExportSvg={noop}
        onShare={noop}
        onImportClick={noop}
        onResetCanvas={noop}
        onOpenGlossary={openGlossary}
      />
      <CodeLabPage
        onOpenTopic={(id) => setLldTopicId(id)}
        onGoToHldTopic={(hldTopicId) => {
          setDemoSession(null);
          setTopicId(hldTopicId);
          setLldTopicId(null);
          setView('academy');
        }}
      />
    </div>
  ) : (
    <AppShell
      currentView={view}
      onSwitchView={(v) => {
        setView(v);
        setDemoSession(null);
        if (v !== 'academy') setTopicId(null);
        if (v !== 'codelab') setLldTopicId(null);
      }}
      onOpenTips={() => setTipsOpen(true)}
      onBackToAcademy={() => {
        setView('academy');
        setDemoSession(null);
        setLldTopicId(null);
      }}
      overlay={
        demoSession ? (
          <AcademyDemoOverlay
            topicId={demoSession.topicId}
            instruction={demoSession.instruction}
            onBackToTopic={() => {
              setView('academy');
              setTopicId(demoSession.topicId);
              setDemoSession(null);
            }}
          />
        ) : null
      }
    />
  );

  return (
    <>
      {shell}
      <GlossaryModal />
      <InterviewTips isOpen={tipsOpen} onClose={() => setTipsOpen(false)} />
      {lastXPGain > 0 ? (
        <div className="pointer-events-none fixed right-6 top-16 z-[180] rounded-full border border-emerald-500/50 bg-emerald-950/80 px-3 py-1 text-xs font-semibold text-emerald-200">
          +{lastXPGain} XP!
        </div>
      ) : null}
      <GlobalConfirmDialog />
    </>
  );
}
