import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock3,
  GraduationCap,
  Link,
  Rocket,
  ShieldAlert,
  TrendingUp,
  X,
  DatabaseZap,
} from 'lucide-react';
import { TUTORIALS } from '@/constants/tutorials';
import { useTutorialStore } from '@/store/useTutorialStore';
import type { LucideIcon } from 'lucide-react';

interface TutorialLauncherProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIFFICULTY_CLASS: Record<string, string> = {
  beginner: 'bg-emerald-950/80 text-emerald-200 border-emerald-700/60',
  intermediate: 'bg-amber-950/80 text-amber-200 border-amber-700/60',
  advanced: 'bg-red-950/80 text-red-200 border-red-700/60',
};

const ICONS: Record<string, LucideIcon> = {
  Rocket,
  DatabaseZap,
  ShieldAlert,
  TrendingUp,
  Link,
};

function orderedTutorials() {
  const rank = { beginner: 0, intermediate: 1, advanced: 2 } as const;
  return [...TUTORIALS].sort((a, b) => rank[a.difficulty] - rank[b.difficulty]);
}

export function TutorialLauncher({ isOpen, onClose }: TutorialLauncherProps) {
  const startTutorial = useTutorialStore((s) => s.startTutorial);
  const completedTutorials = useTutorialStore((s) => s.completedTutorials);
  const showCompletionModal = useTutorialStore((s) => s.showCompletionModal);
  const lastCompletedTutorialId = useTutorialStore((s) => s.lastCompletedTutorialId);
  const closeCompletionModal = useTutorialStore((s) => s.closeCompletionModal);
  const tutorials = orderedTutorials();
  const completedTutorial = tutorials.find((tutorial) => tutorial.id === lastCompletedTutorialId) ?? null;

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nb-tutorials-title"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                <h2 id="nb-tutorials-title" className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
                  <GraduationCap className="h-5 w-5 text-cyan-300" strokeWidth={2} />
                  Interactive Tutorials
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                  aria-label="Close tutorials"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
              <div className="max-h-[calc(90vh-5rem)] overflow-y-auto p-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {tutorials.map((tutorial) => {
                    const Icon = ICONS[tutorial.icon] ?? GraduationCap;
                    const isCompleted = completedTutorials.includes(tutorial.id);
                    return (
                      <button
                        key={tutorial.id}
                        type="button"
                        onClick={() => {
                          startTutorial(tutorial.id);
                          onClose();
                        }}
                        className="rounded-lg border border-zinc-700/90 bg-zinc-950/70 p-4 text-left transition-colors hover:border-cyan-600/40 hover:bg-zinc-900/80"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="rounded-md p-2"
                              style={{ backgroundColor: `${tutorial.color}22`, color: tutorial.color }}
                            >
                              <Icon className="h-5 w-5" strokeWidth={2} />
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-zinc-100">{tutorial.title}</p>
                              <p className="mt-1 text-xs text-zinc-500">{tutorial.description}</p>
                            </div>
                          </div>
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" strokeWidth={2} />
                          ) : null}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${DIFFICULTY_CLASS[tutorial.difficulty]}`}
                          >
                            {tutorial.difficulty}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                            <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
                            {tutorial.estimatedMinutes} min
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {tutorial.concepts.map((concept) => (
                            <span
                              key={concept}
                              className="rounded-full border border-zinc-700 bg-zinc-900/80 px-2 py-0.5 text-[10px] text-zinc-300"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showCompletionModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" strokeWidth={2} />
                <div>
                  <h3 className="text-xl font-semibold text-zinc-100">Tutorial Complete!</h3>
                  <p className="text-sm text-zinc-400">Great job - you unlocked another architecture pattern.</p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
                {completedTutorial ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Concepts learned</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {completedTutorial.concepts.map((concept) => (
                        <span
                          key={concept}
                          className="rounded-full border border-zinc-700 bg-zinc-900/80 px-2 py-0.5 text-[10px] text-zinc-300"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </>
                ) : null}
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">What to try next</p>
                <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                  <li>Try the next tutorial difficulty level.</li>
                  <li>Experiment with chaos events on your design.</li>
                  <li>Build a variation in Free Build mode.</li>
                </ul>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closeCompletionModal();
                    onClose();
                  }}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Next Tutorial
                </button>
                <button
                  type="button"
                  onClick={closeCompletionModal}
                  className="rounded-md border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
                >
                  Free Build
                </button>
                <button
                  type="button"
                  onClick={closeCompletionModal}
                  className="rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
