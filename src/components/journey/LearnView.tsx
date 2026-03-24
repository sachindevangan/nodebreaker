import { Lightbulb, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { JourneyStage, LearnBlock } from '@/constants/journey';
import { useJourneyStore } from '@/store/useJourneyStore';

interface LearnViewProps {
  stage: JourneyStage;
  onBack: () => void;
}

function Block({ block, onQuizAnswered }: { block: LearnBlock; onQuizAnswered: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);

  if (block.type === 'analogy') {
    return (
      <div className="rounded-lg border border-amber-700/50 bg-amber-950/30 p-4">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-300">
          <Lightbulb className="h-3.5 w-3.5" /> Analogy
        </p>
        <p className="mt-2 text-sm text-zinc-200">{block.content}</p>
      </div>
    );
  }

  if (block.type === 'comparison' && block.comparison) {
    return (
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-zinc-100">{block.comparison.left}</h4>
          <ul className="mt-2 list-disc pl-4 text-sm text-zinc-300">
            {block.comparison.leftItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-100">{block.comparison.right}</h4>
          <ul className="mt-2 list-disc pl-4 text-sm text-zinc-300">
            {block.comparison.rightItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (block.type === 'quiz' && block.quiz) {
    return (
      <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
        <p className="text-sm font-semibold text-zinc-100">{block.quiz.question}</p>
        <div className="mt-3 space-y-2">
          {block.quiz.options.map((option, idx) => (
            <button
              key={option}
              type="button"
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-left text-sm text-zinc-200 hover:border-zinc-600"
              onClick={() => {
                setSelected(idx);
                onQuizAnswered();
              }}
            >
              {option}
            </button>
          ))}
        </div>
        {selected !== null ? (
          <p className="mt-3 text-xs text-zinc-300">
            {selected === block.quiz.correctIndex ? 'Correct. ' : 'Not quite. '}
            {block.quiz.explanation}
          </p>
        ) : null}
      </div>
    );
  }

  if (block.type === 'interactive') {
    return (
      <div className="rounded-lg border border-cyan-700/40 bg-cyan-950/20 p-4">
        <p className="text-sm text-zinc-100">{block.content}</p>
        <button
          type="button"
          className="mt-3 rounded-md border border-cyan-700/60 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-200"
        >
          Try it →
        </button>
      </div>
    );
  }

  return <div className="prose prose-invert max-w-none text-sm text-zinc-200 whitespace-pre-line">{block.content}</div>;
}

export function LearnView({ stage, onBack }: LearnViewProps) {
  const completeLearn = useJourneyStore((s) => s.completeLearn);
  const [quizCount, setQuizCount] = useState(0);
  const quizzes = useMemo(
    () => stage.parts.learn.content.filter((block) => block.type === 'quiz').length,
    [stage.parts.learn.content]
  );
  const canComplete = quizzes === 0 || quizCount >= quizzes;
  const progress = Math.round((quizCount / Math.max(1, quizzes)) * 100);

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      <div className="h-1 w-full bg-zinc-800">
        <div className="h-full bg-cyan-500 transition-all" style={{ width: `${canComplete ? 100 : progress}%` }} />
      </div>
      <div className="flex min-h-0 flex-1">
        <section className="flex w-3/5 min-w-0 flex-col border-r border-zinc-800">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Journey
            </button>
            <p className="text-xs text-zinc-400">{stage.parts.learn.estimatedMinutes} min read</p>
          </div>
          <div className="min-h-0 space-y-4 overflow-auto px-4 pb-6">
            {stage.parts.learn.content.map((block, idx) => (
              <Block key={`${block.type}-${idx}`} block={block} onQuizAnswered={() => setQuizCount((c) => c + 1)} />
            ))}
          </div>
          {canComplete ? (
            <div className="border-t border-zinc-800 p-4">
              <button
                type="button"
                onClick={() => {
                  completeLearn(stage.id);
                  onBack();
                }}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark as Complete
              </button>
            </div>
          ) : null}
        </section>
        <aside className="flex w-2/5 flex-col">
          <div className="border-b border-zinc-800 p-4">
            <h3 className="text-sm font-semibold text-zinc-100">Interactive Canvas</h3>
            <p className="text-xs text-zinc-400">Mini playground to test ideas from this stage.</p>
          </div>
          <div className="m-4 flex min-h-0 flex-1 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 text-center">
            <p className="text-sm text-zinc-400">
              Mini canvas placeholder. Full interactive template wiring can plug into diagramTemplate IDs next.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
