import { ArrowLeft, ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { useState } from 'react';
import type { JourneyStage } from '@/constants/journey';
import { useJourneyStore } from '@/store/useJourneyStore';

interface BuildViewProps {
  stage: JourneyStage;
  onBackToJourney: () => void;
}

export function BuildView({ stage, onBackToJourney }: BuildViewProps) {
  const [hintOpen, setHintOpen] = useState(false);
  const completeBuild = useJourneyStore((s) => s.completeBuild);

  return (
    <div className="pointer-events-none fixed inset-0 z-[150]">
      <div className="pointer-events-auto absolute left-4 top-4">
        <button
          type="button"
          onClick={onBackToJourney}
          className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900/90 px-2 py-1.5 text-xs text-zinc-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Journey
        </button>
      </div>
      <div className="pointer-events-auto absolute bottom-4 left-4 w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900/95 p-4">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          <Wrench className="h-3.5 w-3.5" />
          Build Exercise
        </p>
        <h3 className="mt-2 text-base font-semibold text-zinc-100">{stage.parts.build.title}</h3>
        <p className="mt-2 text-sm text-zinc-300">{stage.parts.build.instruction}</p>
        <p className="mt-2 text-xs text-zinc-400">Success: {stage.parts.build.successCriteria}</p>
        <button
          type="button"
          onClick={() => setHintOpen((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 text-xs text-amber-300"
        >
          {hintOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          Hint
        </button>
        {hintOpen ? <p className="mt-1 text-xs text-zinc-400">{stage.parts.build.hint}</p> : null}
        <button
          type="button"
          className="mt-4 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          onClick={() => {
            completeBuild(stage.id);
            onBackToJourney();
          }}
        >
          Mark Complete
        </button>
      </div>
    </div>
  );
}
