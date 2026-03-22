import { ComponentPalette } from '@/components/sidebar';
import { FlowCanvas } from '@/components/canvas';
import { Header } from './Header';

export function AppShell() {
  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-surface">
      <Header />
      <div className="flex min-h-0 flex-1">
        <ComponentPalette />
        <main className="relative min-h-0 min-w-0 flex-1" aria-label="Design canvas">
          <FlowCanvas />
        </main>
      </div>
    </div>
  );
}
