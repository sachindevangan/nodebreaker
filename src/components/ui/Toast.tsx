import { X } from 'lucide-react';
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
  const styles = KIND_STYLES[item.kind];

  return (
    <div
      role="status"
      className={`pointer-events-auto flex max-w-sm items-start gap-2 rounded-lg border px-3 py-2.5 shadow-lg backdrop-blur-sm ${styles.border} ${styles.bg}`}
    >
      <p className={`min-w-0 flex-1 text-xs leading-snug ${styles.text}`}>{item.message}</p>
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
