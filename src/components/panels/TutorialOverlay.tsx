import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, ChevronUp, GraduationCap, Minimize2, X } from 'lucide-react';
import { useState } from 'react';
import { useTutorialDetection } from '@/hooks/useTutorialDetection';
import { useTutorialStore } from '@/store/useTutorialStore';

export function TutorialOverlay() {
  const activeTutorial = useTutorialStore((s) => s.activeTutorial);
  const currentStepIndex = useTutorialStore((s) => s.currentStepIndex);
  const nextStep = useTutorialStore((s) => s.nextStep);
  const prevStep = useTutorialStore((s) => s.prevStep);
  const skipStep = useTutorialStore((s) => s.skipStep);
  const exitTutorial = useTutorialStore((s) => s.exitTutorial);
  const isMinimized = useTutorialStore((s) => s.isMinimized);
  const toggleMinimize = useTutorialStore((s) => s.toggleMinimize);
  const step = activeTutorial?.steps[currentStepIndex] ?? null;
  const totalSteps = activeTutorial?.steps.length ?? 0;
  const { canProceed, isActionDetected, showDetectedPulse } = useTutorialDetection();
  const [whyOpen, setWhyOpen] = useState(true);

  if (!activeTutorial || !step) return null;

  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;
  const canBack = currentStepIndex > 0;

  return (
    <div className="pointer-events-none absolute bottom-16 left-3 z-[35]">
      <AnimatePresence mode="wait">
        <motion.section
          key={isMinimized ? 'minimized' : 'expanded'}
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="pointer-events-auto w-[400px] max-w-[calc(100vw-1.5rem)] rounded-xl border border-zinc-700 bg-zinc-900/95 shadow-2xl backdrop-blur-md"
          style={{ borderLeftWidth: 4, borderLeftColor: activeTutorial.color }}
        >
          <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {activeTutorial.title}
              </p>
              <p className="text-[11px] text-zinc-500">
                Step {currentStepIndex + 1} of {totalSteps}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                onClick={toggleMinimize}
                aria-label={isMinimized ? 'Expand tutorial panel' : 'Minimize tutorial panel'}
              >
                <Minimize2 className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                onClick={exitTutorial}
                aria-label="Exit tutorial"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          {isMinimized ? null : (
            <div className="max-h-[300px] overflow-y-auto p-3">
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: activeTutorial.color }}
                />
              </div>

              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold leading-tight text-zinc-100">{step.title}</h3>
                {showDetectedPulse ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 animate-pulse text-emerald-400" strokeWidth={2} />
                ) : null}
              </div>

              <p className="mt-2 text-sm leading-relaxed text-zinc-200">{step.instruction}</p>

              <button
                type="button"
                onClick={() => setWhyOpen((open) => !open)}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Why?
                {whyOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                )}
              </button>
              {whyOpen ? (
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">{step.explanation}</p>
              ) : null}

              {isActionDetected && step.tip ? (
                <div className="mt-3 rounded-lg border border-amber-800/70 bg-amber-950/30 p-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-200">
                    <GraduationCap className="h-3.5 w-3.5" strokeWidth={2} />
                    Interview tip
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-100/90">{step.tip}</p>
                </div>
              ) : null}

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={!canBack}
                  className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={skipStep}
                  className="rounded-md px-2 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                >
                  Skip
                </button>
              </div>

              <button
                type="button"
                onClick={exitTutorial}
                className="mt-3 text-[11px] text-zinc-500 underline decoration-zinc-700 underline-offset-2 hover:text-zinc-300"
              >
                Exit Tutorial
              </button>
            </div>
          )}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
