import { Download, FileImage, FileJson, FileType2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ExportMenuProps {
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportJson: () => void;
  compact?: boolean;
}

export function ExportMenu({ onExportPng, onExportSvg, onExportJson, compact = false }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (e.target instanceof Node && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open]);

  const btnClass = compact
    ? 'inline-flex h-9 items-center gap-1 rounded-md border border-transparent px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700/80 hover:bg-zinc-800/60 hover:text-zinc-100'
    : 'inline-flex h-9 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700/80 hover:bg-zinc-800/60 hover:text-zinc-100';

  return (
    <div className="relative" ref={containerRef}>
      <button type="button" className={btnClass} onClick={() => setOpen((v) => !v)} title="Export design">
        <Download className="h-4 w-4 shrink-0" strokeWidth={2} />
        {!compact ? <span>Export</span> : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-10 z-[120] min-w-44 rounded-md border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-zinc-200 hover:bg-zinc-800"
            onClick={() => {
              onExportPng();
              setOpen(false);
            }}
          >
            <FileImage className="h-3.5 w-3.5" /> Export as PNG
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-zinc-200 hover:bg-zinc-800"
            onClick={() => {
              onExportSvg();
              setOpen(false);
            }}
          >
            <FileType2 className="h-3.5 w-3.5" /> Export as SVG
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-zinc-200 hover:bg-zinc-800"
            onClick={() => {
              onExportJson();
              setOpen(false);
            }}
          >
            <FileJson className="h-3.5 w-3.5" /> Export as JSON
          </button>
        </div>
      ) : null}
    </div>
  );
}

