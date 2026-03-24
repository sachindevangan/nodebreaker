import { useAcademyStore } from '@/store/useAcademyStore';

interface AcademyDemoOverlayProps {
  topicId: string;
  instruction: string;
  onBackToTopic: () => void;
}

export function AcademyDemoOverlay({ topicId, instruction, onBackToTopic }: AcademyDemoOverlayProps) {
  const demoDone = useAcademyStore((s) => s.getTopicProgress(topicId).demoCompleted);
  const markDemoComplete = useAcademyStore((s) => s.markDemoComplete);

  return (
    <div className="pointer-events-none fixed inset-0 z-[160]">
      <div className="pointer-events-auto absolute left-4 top-4 max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl">
        <button
          type="button"
          onClick={onBackToTopic}
          className="rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-hover)]"
        >
          Back to Topic
        </button>
        <h3 className="mt-3 text-sm font-semibold text-[var(--text)]">What to observe</h3>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">{instruction}</p>
        {!demoDone ? (
          <button
            type="button"
            onClick={() => markDemoComplete(topicId)}
            className="mt-4 w-full rounded-lg bg-cyan-600 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
          >
            Mark Demo Complete ✓
          </button>
        ) : (
          <p className="mt-3 text-xs font-medium text-emerald-400">Demo complete</p>
        )}
      </div>
    </div>
  );
}
