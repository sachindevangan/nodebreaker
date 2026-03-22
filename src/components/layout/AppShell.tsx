import { useCallback, useState } from 'react';
import { FlowCanvas } from '@/components/canvas';
import { ChaosOverlay, MetricsDashboard, PropertiesPanel, SimulationControls } from '@/components/panels';
import { ComponentPalette } from '@/components/sidebar';
import { ToastViewport } from '@/components/ui/Toast';
import { useHotkeys } from '@/hooks/useHotkeys';
import { Header } from './Header';

export function AppShell() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const closeShortcutsModal = useCallback(() => setShortcutsOpen(false), []);
  useHotkeys(shortcutsOpen, closeShortcutsModal);

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-surface">
      <Header shortcutsOpen={shortcutsOpen} onShortcutsOpenChange={setShortcutsOpen} />
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
  );
}
