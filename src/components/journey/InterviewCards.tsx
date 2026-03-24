import { useMemo, useState } from 'react';
import { Layers, Shuffle } from 'lucide-react';
import { JOURNEY_STAGES } from '@/constants/journey';
import { useJourneyStore } from '@/store/useJourneyStore';

interface InterviewCardsProps {
  onClose: () => void;
}

export function InterviewCards({ onClose }: InterviewCardsProps) {
  const collected = useJourneyStore((s) => s.collectedInterviewCards);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const filtered = useMemo(() => {
    return JOURNEY_STAGES.filter((stage) => (selectedStage === 'all' ? true : stage.id === selectedStage));
  }, [selectedStage]);
  const practiceCard = useMemo(() => {
    if (!practiceMode) return null;
    const owned = filtered.filter((stage) => collected.includes(stage.id));
    if (owned.length === 0) return null;
    return owned[Math.floor(Math.random() * owned.length)];
  }, [practiceMode, filtered, collected]);

  return (
    <div className="fixed inset-0 z-[155] bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto flex h-full max-w-6xl flex-col rounded-xl border border-zinc-700 bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold text-zinc-100">
            <Layers className="h-4 w-4 text-violet-300" />
            Interview Cards
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-200"
            >
              <option value="all">All stages</option>
              {JOURNEY_STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  Stage {stage.number}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
              onClick={() => setPracticeMode((v) => !v)}
            >
              <Shuffle className="h-3.5 w-3.5" />
              Practice Mode
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {practiceMode ? (
            <div className="mx-auto max-w-2xl">
              {practiceCard ? (
                <button
                  type="button"
                  onClick={() => setFlippedId(flippedId === practiceCard.id ? null : practiceCard.id)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-6 text-left hover:border-zinc-600"
                >
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Stage {practiceCard.number}</p>
                  <p className="mt-2 text-lg font-semibold text-zinc-100">{practiceCard.parts.interviewCard.question}</p>
                  {flippedId === practiceCard.id ? (
                    <p className="mt-4 text-sm text-zinc-300">{practiceCard.parts.interviewCard.exampleAnswer}</p>
                  ) : (
                    <p className="mt-4 text-xs text-zinc-400">Click to flip</p>
                  )}
                </button>
              ) : (
                <p className="text-sm text-zinc-400">Collect at least one card to use Practice Mode.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((stage) => {
                const owned = collected.includes(stage.id);
                const flipped = flippedId === stage.id;
                return (
                  <button
                    type="button"
                    key={stage.id}
                    onClick={() => owned && setFlippedId(flipped ? null : stage.id)}
                    className={`rounded-lg border p-4 text-left ${
                      owned
                        ? 'border-zinc-700 bg-zinc-950 hover:border-zinc-600'
                        : 'cursor-not-allowed border-zinc-800 bg-zinc-950/50 opacity-60'
                    }`}
                  >
                    <p className="text-xs text-zinc-500">Stage {stage.number}</p>
                    {owned ? (
                      flipped ? (
                        <>
                          <p className="mt-2 text-sm text-zinc-200">{stage.parts.interviewCard.exampleAnswer}</p>
                          <ul className="mt-3 list-disc pl-4 text-xs text-zinc-400">
                            {stage.parts.interviewCard.keyPoints.map((point) => (
                              <li key={point}>{point}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="mt-2 text-sm font-semibold text-zinc-100">{stage.parts.interviewCard.question}</p>
                      )
                    ) : (
                      <p className="mt-2 text-sm font-semibold text-zinc-500">Locked card</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
