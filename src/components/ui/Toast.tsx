import { Lightbulb, X } from 'lucide-react';
import { useKnowledgeStore } from '@/store/useKnowledgeStore';
import { useToastStore, type ToastItem as ToastItemType } from '@/store/useToastStore';

const KIND_STYLES: Record<
  ToastItemType['kind'],
  { border: string; bg: string; text: string }
> = {
  success: {
    border: 'border-emerald-600/70',
    bg: 'bg-emerald-950/90',
    text: 'text-emerald-100',
  },
  warning: {
    border: 'border-amber-600/70',
    bg: 'bg-amber-950/90',
    text: 'text-amber-100',
  },
  info: {
    border: 'border-sky-600/70',
    bg: 'bg-sky-950/90',
    text: 'text-sky-100',
  },
  error: {
    border: 'border-red-600/70',
    bg: 'bg-red-950/90',
    text: 'text-red-100',
  },
  orange: {
    border: 'border-orange-600/70',
    bg: 'bg-orange-950/90',
    text: 'text-orange-100',
  },
};

function ToastItemView({ item }: { item: ToastItemType }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const openKnowledge = useKnowledgeStore((s) => s.openKnowledge);
  const styles = KIND_STYLES[item.kind];
  const isInsight = item.learnMore !== undefined;

  return (
    <div
      role="status"
      className={`pointer-events-auto flex max-w-sm items-start gap-2 rounded-lg border px-3 py-2.5 shadow-lg backdrop-blur-sm ${
        isInsight
          ? 'border-violet-500/60 bg-gradient-to-r from-indigo-950/95 to-violet-950/95'
          : `${styles.border} ${styles.bg}`
      }`}
    >
      {isInsight ? <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-violet-200" /> : null}
      <div className="min-w-0 flex-1">
        <p className={`text-xs leading-snug ${isInsight ? 'text-violet-100' : styles.text}`}>{item.message}</p>
        {item.learnMore ? (
          <button
            type="button"
            onClick={() => {
              if (item.learnMore) openKnowledge(item.learnMore);
            }}
            className="mt-1 text-[11px] font-medium text-cyan-300 hover:text-cyan-200"
          >
            Learn More
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        className="shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-4 z-[80] flex flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((t) => (
        <ToastItemView key={t.id} item={t} />
      ))}
    </div>
  );
}
