import { Header } from './Header';

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />
      <div className="flex min-h-0 flex-1">
        <aside
          className="w-56 shrink-0 border-r border-border bg-surface-elevated p-3"
          aria-label="Component palette placeholder"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Palette</p>
          <p className="mt-2 text-sm text-zinc-400">Drag components here in a later phase.</p>
        </aside>
        <main
          className="min-h-0 flex-1 bg-surface-muted/30 p-4"
          aria-label="Canvas area"
        >
          <div className="flex h-full min-h-[320px] items-center justify-center rounded-lg border border-dashed border-border bg-surface-elevated/50">
            <p className="text-sm text-zinc-500">Canvas</p>
          </div>
        </main>
      </div>
    </div>
  );
}
