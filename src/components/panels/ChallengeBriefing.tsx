import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Challenge } from '@/constants/challenges';
import { useChallengeStore } from '@/store/useChallengeStore';

interface ChallengeBriefingProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ChallengeBriefing({ challenge, isOpen, onClose }: ChallengeBriefingProps) {
  const startChallenge = useChallengeStore((s) => s.startChallenge);
  if (!challenge) return null;
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[116] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <h2 className="text-lg font-semibold text-zinc-100">{challenge.title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                aria-label="Close challenge briefing"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="max-h-[calc(90vh-5rem)] space-y-5 overflow-y-auto p-5">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Briefing</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-200">{challenge.briefing}</p>
              </section>
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Constraints</h3>
                <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                  {challenge.constraints.map((constraint) => (
                    <li key={constraint}>- {constraint}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Requirements</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-zinc-300">
                  {challenge.requirements.map((req) => (
                    <li key={req.id} className="flex items-start justify-between gap-2 rounded border border-zinc-800 bg-zinc-950/70 px-2.5 py-2">
                      <span>{req.description}</span>
                      <span className="shrink-0 text-xs font-semibold text-amber-300">{req.weight} pts</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Why this matters</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{challenge.interviewContext}</p>
              </section>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    startChallenge(challenge.id);
                    onClose();
                  }}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Start Challenge
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
