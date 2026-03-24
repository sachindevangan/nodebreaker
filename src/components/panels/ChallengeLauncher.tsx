import { AnimatePresence, motion } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CHALLENGES, type Challenge } from '@/constants/challenges';
import { useChallengeStore } from '@/store/useChallengeStore';

interface ChallengeLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChallenge: (challenge: Challenge) => void;
}

const ICONS: Record<string, LucideIcon> = {
  TrendingUp,
  ShieldCheck,
  Zap,
  Workflow,
  Users,
  ShieldAlert,
};

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard', 'expert'] as const;
const DIFFICULTY_BADGE: Record<string, string> = {
  easy: 'bg-emerald-950/70 text-emerald-200 border-emerald-800/70',
  medium: 'bg-amber-950/70 text-amber-200 border-amber-800/70',
  hard: 'bg-orange-950/70 text-orange-200 border-orange-800/70',
  expert: 'bg-red-950/70 text-red-200 border-red-800/70',
};

export function ChallengeLauncher({ isOpen, onClose, onSelectChallenge }: ChallengeLauncherProps) {
  const completedChallenges = useChallengeStore((s) => s.completedChallenges);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[115] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
                <Trophy className="h-5 w-5 text-amber-300" strokeWidth={2} />
                Guided Challenges
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                aria-label="Close challenges"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="max-h-[calc(90vh-5rem)] overflow-y-auto p-5">
              <div className="space-y-5">
                {DIFFICULTY_ORDER.map((difficulty) => {
                  const rows = CHALLENGES.filter((challenge) => challenge.difficulty === difficulty);
                  if (rows.length === 0) return null;
                  return (
                    <section key={difficulty}>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">{difficulty}</h3>
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        {rows.map((challenge) => {
                          const Icon = ICONS[challenge.icon] ?? Trophy;
                          const completed = completedChallenges.get(challenge.id);
                          return (
                            <button
                              key={challenge.id}
                              type="button"
                              onClick={() => onSelectChallenge(challenge)}
                              className="rounded-lg border border-zinc-700/90 bg-zinc-950/70 p-4 text-left transition-colors hover:border-amber-600/40 hover:bg-zinc-900/80"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="rounded-md p-2"
                                    style={{ backgroundColor: `${challenge.color}22`, color: challenge.color }}
                                  >
                                    <Icon className="h-5 w-5" strokeWidth={2} />
                                  </span>
                                  <div>
                                    <p className="text-sm font-semibold text-zinc-100">{challenge.title}</p>
                                    <p className="text-xs text-zinc-500">{challenge.description}</p>
                                  </div>
                                </div>
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${DIFFICULTY_BADGE[difficulty]}`}
                                >
                                  {difficulty}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-400">
                                <span className="rounded border border-zinc-700 px-1.5 py-0.5">{challenge.category}</span>
                                <span>{challenge.estimatedMinutes} min</span>
                              </div>
                              <div className="mt-2 flex items-center gap-1">
                                {[0, 1, 2].map((idx) => (
                                  <Star
                                    key={idx}
                                    className={`h-4 w-4 ${
                                      completed && idx < completed.stars
                                        ? 'fill-amber-300 text-amber-300'
                                        : 'text-zinc-600'
                                    }`}
                                    strokeWidth={2}
                                  />
                                ))}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
