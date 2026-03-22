export function Header() {
  return (
    <header className="flex h-12 shrink-0 items-center border-b border-border px-4 bg-surface-elevated">
      <h1 className="text-sm font-semibold tracking-tight text-zinc-100">NodeBreaker</h1>
      <span className="ml-3 hidden text-xs text-zinc-500 sm:inline">
        Design canvas · drag from the palette to place nodes
      </span>
    </header>
  );
}
