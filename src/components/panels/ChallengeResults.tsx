import { AnimatePresence, motion } from 'framer-motion';
import { Star, Trophy, X } from 'lucide-react';
import { CHALLENGES } from '@/constants/challenges';
import { useChallengeStore } from '@/store/useChallengeStore';

interface ChallengeResultsProps {
  onRetry: () => void;
  onNext: () => void;
  onFreeBuild: () => void;
}

export function ChallengeResults({ onRetry, onNext, onFreeBuild }: ChallengeResultsProps) {
  const lastResult = useChallengeStore((s) => s.lastResult);
  const closeResults = useChallengeStore((s) => s.closeResults);
  const challenge = CHALLENGES.find((c) => c.id === lastResult?.challengeId) ?? null;
  if (!lastResult || !challenge) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[125] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
            <h2 className="text-lg font-semibold text-zinc-100">Challenge Results</h2>
            <button
              type="button"
              onClick={closeResults}
              className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              aria-label="Close results"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <div className="max-h-[calc(90vh-5rem)] overflow-y-auto p-5">
            <div className="flex items-center gap-4">
              <Trophy className={`h-8 w-8 ${lastResult.passed ? 'text-amber-300' : 'text-zinc-500'}`} strokeWidth={2} />
              <div>
                <p className="text-xl font-semibold text-zinc-100">{lastResult.totalScore} / {lastResult.maxScore}</p>
                <p className="text-sm text-zinc-400">{lastResult.passed ? 'Passed' : 'Not passed'}</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                {[0, 1, 2].map((idx) => (
                  <Star
                    key={idx}
                    className={`h-6 w-6 ${idx < lastResult.stars ? 'fill-amber-300 text-amber-300' : 'text-zinc-600'}`}
                    strokeWidth={2}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {lastResult.requirementResults.map((row) => (
                <div
                  key={row.requirementId}
                  className={`rounded border px-3 py-2 text-sm ${row.passed ? 'border-emerald-800/70 bg-emerald-950/20 text-emerald-100' : 'border-red-800/70 bg-red-950/20 text-red-100'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span>{row.message}</span>
                    <span className="font-mono text-xs">{row.score} pts</span>
                  </div>
                </div>
              ))}
            </div>

            {lastResult.suggestions.length > 0 ? (
              <section className="mt-4 rounded border border-zinc-700 bg-zinc-950/70 p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Suggestions</h3>
                <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                  {lastResult.suggestions.map((suggestion) => (
                    <li key={suggestion}>- {suggestion}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="mt-4 rounded border border-zinc-700 bg-zinc-950/70 p-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Interview context</h3>
              <p className="mt-1 text-sm text-zinc-300">{challenge.interviewContext}</p>
            </section>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onRetry}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={onNext}
                className="rounded-md border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
              >
                Next Challenge
              </button>
              <button
                type="button"
                onClick={onFreeBuild}
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              >
                Free Build
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
