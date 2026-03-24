import { Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useKnowledgeStore, type KnowledgeTarget } from '@/store/useKnowledgeStore';

interface InfoTooltipProps {
  text: string;
  target?: KnowledgeTarget;
  className?: string;
}

export function InfoTooltip({ text, target, className = '' }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const openKnowledge = useKnowledgeStore((s) => s.openKnowledge);
  const label = useMemo(() => (target ? 'Learn more' : 'Info'), [target]);

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (target) openKnowledge(target);
        }}
      >
        <Info className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      {open ? (
        <span className="pointer-events-none absolute left-1/2 top-full z-[95] mt-1 w-64 -translate-x-1/2 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-left text-[11px] leading-snug text-zinc-100 shadow-lg">
          {text}
          {target ? <span className="mt-1 block text-[10px] text-cyan-300">Click to learn more</span> : null}
        </span>
      ) : null}
    </span>
  );
}
