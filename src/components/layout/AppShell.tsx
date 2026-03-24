import { useCallback, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { FlowCanvas } from '@/components/canvas';
import {
  ChaosOverlay,
  CostEstimation,
  ChallengeBriefing,
  ChallengeHUD,
  ChallengeLauncher,
  ChallengeResults,
  GlossaryModal,
  InterviewTimer,
  KnowledgePanel,
  MetricsDashboard,
  PropertiesPanel,
  ScorePanel,
  SimulationControls,
  TemplateSelector,
  TutorialLauncher,
  TutorialOverlay,
} from '@/components/panels';
import { ComponentPalette } from '@/components/sidebar';
import { ToastViewport } from '@/components/ui/Toast';
import { AppChromeContext } from '@/context/AppChromeContext';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useChaosStore } from '@/store/useChaosStore';
import { useFlowStore } from '@/store/useFlowStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useSimStore } from '@/store/useSimStore';
import { useToastStore } from '@/store/useToastStore';
import { useKnowledgeStore } from '@/store/useKnowledgeStore';
import { useChallengeStore } from '@/store/useChallengeStore';
import { getChallengeById } from '@/constants/challenges';
import {
  designToFlowGraph,
  downloadDesignJson,
  serializeDesign,
  validateDesignFile,
} from '@/utils/serialization';
import { exportCanvasAsPng, exportCanvasAsSvg } from '@/utils/export';
import { Header } from './Header';

interface AppShellProps {
  currentView?: 'journey' | 'sandbox';
  onSwitchView?: (view: 'journey' | 'sandbox') => void;
  onOpenCards?: () => void;
  overlay?: ReactNode;
}

export function AppShell({ currentView = 'sandbox', onSwitchView, onOpenCards, overlay }: AppShellProps) {
  const openGlossary = useKnowledgeStore((s) => s.openGlossary);
  const startChallenge = useChallengeStore((s) => s.startChallenge);
  const lastResult = useChallengeStore((s) => s.lastResult);
  const closeResults = useChallengeStore((s) => s.closeResults);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [tutorialsOpen, setTutorialsOpen] = useState(false);
  const [challengesOpen, setChallengesOpen] = useState(false);
  const [briefingChallengeId, setBriefingChallengeId] = useState<string | null>(null);
  const [interviewModeActive, setInterviewModeActive] = useState(false);
  const [leftWidth, setLeftWidth] = useState(() => {
    return parseInt(localStorage.getItem('nb-left-w') || '260');
  });
  const [rightWidth, setRightWidth] = useState(() => {
    return parseInt(localStorage.getItem('nb-right-w') || '320');
  });
  const importInputRef = useRef<HTMLInputElement>(null);

  const closeShortcutsModal = useCallback(() => setShortcutsOpen(false), []);
  useHotkeys(shortcutsOpen, closeShortcutsModal);

  const chromeValue = useMemo(
    () => ({
      openTemplates: () => setTemplatesOpen(true),
      requestImport: () => importInputRef.current?.click(),
    }),
    []
  );

  const handleResetCanvas = useCallback(() => {
    useChaosStore.getState().clearAllChaos();
    useSimStore.getState().stopSession();
    useHistoryStore.getState().clear();
    useFlowStore.getState().replaceGraph([], []);
    useToastStore.getState().push({ kind: 'success', message: 'Canvas cleared' });
  }, []);

  const handleExportJson = useCallback(() => {
    const { nodes, edges } = useFlowStore.getState();
    const name = nodes[0]?.data.label?.trim() || 'My Architecture';
    downloadDesignJson(serializeDesign(name, nodes, edges));
  }, []);

  const handleExportPng = useCallback(async () => {
    const ok = await exportCanvasAsPng();
    if (!ok) useToastStore.getState().push({ kind: 'error', message: 'Unable to export PNG' });
  }, []);

  const handleExportSvg = useCallback(async () => {
    const ok = await exportCanvasAsSvg();
    if (!ok) useToastStore.getState().push({ kind: 'error', message: 'Unable to export SVG' });
  }, []);

  const handleImportChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    let text: string;
    try {
      text = await file.text();
    } catch {
      useToastStore.getState().push({ kind: 'error', message: 'Invalid file format' });
      return;
    }

    let raw: unknown;
    try {
      raw = JSON.parse(text) as unknown;
    } catch {
      useToastStore.getState().push({ kind: 'error', message: 'Invalid file format' });
      return;
    }

    const validated = validateDesignFile(raw);
    if (!validated) {
      useToastStore.getState().push({ kind: 'error', message: 'Invalid file format' });
      return;
    }

    const { nodes, edges } = designToFlowGraph(validated);
    useChaosStore.getState().clearAllChaos();
    useSimStore.getState().stopSession();
    useHistoryStore.getState().clear();
    useFlowStore.getState().replaceGraph(nodes, edges);
    useToastStore.getState().push({
      kind: 'success',
      message: `Imported ${validated.name} — ${nodes.length} nodes, ${edges.length} connections`,
    });
  }, []);

  return (
    <AppChromeContext.Provider value={chromeValue}>
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={handleImportChange}
      />
      <TemplateSelector
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onReopen={() => setTemplatesOpen(true)}
      />
      <TutorialLauncher isOpen={tutorialsOpen} onClose={() => setTutorialsOpen(false)} />
      <ChallengeLauncher
        isOpen={challengesOpen}
        onClose={() => setChallengesOpen(false)}
        onSelectChallenge={(challenge) => {
          setBriefingChallengeId(challenge.id);
          setChallengesOpen(false);
        }}
      />
      <ChallengeBriefing
        challenge={briefingChallengeId ? getChallengeById(briefingChallengeId) ?? null : null}
        isOpen={briefingChallengeId !== null}
        onClose={() => setBriefingChallengeId(null)}
      />
      <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-[var(--bg)]">
        <Header
          currentView={currentView}
          onSwitchView={onSwitchView}
          onOpenCards={onOpenCards}
          shortcutsOpen={shortcutsOpen}
          onShortcutsOpenChange={setShortcutsOpen}
          onTemplates={() => setTemplatesOpen(true)}
          onTutorials={() => {
            if (interviewModeActive) {
              useToastStore.getState().push({ kind: 'warning', message: 'Tutorials disabled during Interview Mode' });
              return;
            }
            setTutorialsOpen(true);
          }}
          onChallenges={() => {
            if (interviewModeActive) {
              useToastStore.getState().push({ kind: 'warning', message: 'Challenges disabled during Interview Mode' });
              return;
            }
            setChallengesOpen(true);
          }}
          onExportJson={handleExportJson}
          onExportPng={handleExportPng}
          onExportSvg={handleExportSvg}
          onImportClick={() => importInputRef.current?.click()}
          onResetCanvas={handleResetCanvas}
          onOpenGlossary={openGlossary}
          interviewModeActive={interviewModeActive}
          extraActions={
            <>
              <CostEstimation />
              <ScorePanel />
              <InterviewTimer active={interviewModeActive} onActiveChange={setInterviewModeActive} />
            </>
          }
        />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0 flex-shrink-0 flex-col" style={{ width: leftWidth }}>
            <ComponentPalette />
          </div>
          <div
            className="w-1 hover:w-1 hover:bg-blue-500/40 cursor-col-resize 
    flex-shrink-0 transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startW = leftWidth;
              const move = (ev: MouseEvent) => {
                const w = Math.max(200, Math.min(450, startW + ev.clientX - startX));
                setLeftWidth(w);
                localStorage.setItem('nb-left-w', String(w));
              };
              const up = () => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
              };
              document.body.style.cursor = 'col-resize';
              document.body.style.userSelect = 'none';
              document.addEventListener('mousemove', move);
              document.addEventListener('mouseup', up);
            }}
          />
          <main
            className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
            aria-label="Design canvas"
          >
            <SimulationControls />
            <ChaosOverlay />
            <FlowCanvas />
            <MetricsDashboard />
            <KnowledgePanel />
            <TutorialOverlay />
            <ChallengeHUD />
            {overlay}
          </main>
          <PropertiesPanel
            panelWidth={rightWidth}
            onResizeStart={(startX) => {
              const startW = rightWidth;
              const move = (ev: MouseEvent) => {
                const w = Math.max(250, Math.min(500, startW - (ev.clientX - startX)));
                setRightWidth(w);
                localStorage.setItem('nb-right-w', String(w));
              };
              const up = () => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
              };
              document.body.style.cursor = 'col-resize';
              document.body.style.userSelect = 'none';
              document.addEventListener('mousemove', move);
              document.addEventListener('mouseup', up);
            }}
          />
        </div>
        <GlossaryModal />
        <ToastViewport />
        <ChallengeResults
          onRetry={() => {
            if (lastResult) startChallenge(lastResult.challengeId);
            closeResults();
          }}
          onNext={() => {
            setChallengesOpen(true);
            closeResults();
          }}
          onFreeBuild={closeResults}
        />
      </div>
    </AppChromeContext.Provider>
  );
}
