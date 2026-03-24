import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { FlowCanvas } from '@/components/canvas';
import {
  ChaosOverlay,
  MetricsDashboard,
  PropertiesPanel,
  SimulationControls,
  TemplateSelector,
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
import {
  designToFlowGraph,
  downloadDesignJson,
  serializeDesign,
  validateDesignFile,
} from '@/utils/serialization';
import { Header } from './Header';

export function AppShell() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
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

  const handleExport = useCallback(() => {
    const { nodes, edges } = useFlowStore.getState();
    const name = nodes[0]?.data.label?.trim() || 'My Architecture';
    downloadDesignJson(serializeDesign(name, nodes, edges));
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
      <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-surface">
        <Header
          shortcutsOpen={shortcutsOpen}
          onShortcutsOpenChange={setShortcutsOpen}
          onTemplates={() => setTemplatesOpen(true)}
          onExport={handleExport}
          onImportClick={() => importInputRef.current?.click()}
          onResetCanvas={handleResetCanvas}
        />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0 w-[260px] shrink-0 flex-col">
            <ComponentPalette />
          </div>
          <main
            className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
            aria-label="Design canvas"
          >
            <SimulationControls />
            <ChaosOverlay />
            <FlowCanvas />
            <MetricsDashboard />
          </main>
          <PropertiesPanel />
        </div>
        <ToastViewport />
      </div>
    </AppChromeContext.Provider>
  );
}
