import { FlowCanvas } from '@/components/canvas';
import { PropertiesPanel } from '@/components/panels';
import { ComponentPalette } from '@/components/sidebar';
import { Header } from './Header';

export function AppShell() {
  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-surface">
      <Header />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full min-h-0 w-[260px] shrink-0 flex-col">
          <ComponentPalette />
        </div>
        <main
          className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          aria-label="Design canvas"
        >
          <FlowCanvas />
        </main>
        <PropertiesPanel />
      </div>
    </div>
  );
}
