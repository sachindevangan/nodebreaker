import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { JourneyStage } from '@/constants/journey';

interface InterviewCardModalProps {
  stage: JourneyStage | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InterviewCardModal({ stage, isOpen, onClose }: InterviewCardModalProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && stage ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 12, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.97 }}
            className="w-full max-w-xl rounded-xl border border-zinc-700 bg-zinc-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-700/60 bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              New Interview Card Collected!
            </p>
            <button
              type="button"
              onClick={() => setFlipped((prev) => !prev)}
              className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-5 text-left hover:border-zinc-600"
            >
              {!flipped ? (
                <>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Question</p>
                  <p className="mt-2 text-base font-semibold text-zinc-100">{stage.parts.interviewCard.question}</p>
                  <p className="mt-4 text-xs text-zinc-400">Click to flip</p>
                </>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Model Answer</p>
                  <p className="mt-2 text-sm text-zinc-200">{stage.parts.interviewCard.exampleAnswer}</p>
                </>
              )}
            </button>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Add to Collection
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
