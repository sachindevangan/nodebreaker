import { ArrowLeft, CheckCircle2, Lightbulb } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { JourneyStage, LearnBlock } from '@/constants/journey';
import { useJourneyStore } from '@/store/useJourneyStore';

interface LearnViewProps {
  stage: JourneyStage;
  onBack: () => void;
  onTryInSandbox: (prompt: string) => void;
}

function renderMarkdown(content: string) {
  return content.split('\n').map((line, idx) => {
    if (line.startsWith('# ')) {
      return (
        <h2 key={idx} className="mt-8 text-2xl font-semibold text-zinc-100">
          {line.slice(2)}
        </h2>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={idx} className="mt-6 text-xl font-semibold text-zinc-100">
          {line.slice(3)}
        </h3>
      );
    }
    if (line.trim().startsWith('- ')) {
      return (
        <li key={idx} className="ml-6 list-disc text-lg leading-8 text-zinc-200">
          {line.replace(/^\-\s/, '')}
        </li>
      );
    }
    if (!line.trim()) {
      return <div key={idx} className="h-3" />;
    }
    const withCode = line.split(/(`[^`]+`)/g).map((part, i) =>
      part.startsWith('`') && part.endsWith('`') ? (
        <code key={i} className="rounded bg-zinc-800 px-1.5 py-0.5 text-base text-cyan-200">
          {part.slice(1, -1)}
        </code>
      ) : (
        part
      )
    );
    const nodes = withCode.flatMap((part, i) => {
      if (typeof part !== 'string') return [part];
      return part.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) =>
        chunk.startsWith('**') && chunk.endsWith('**') ? (
          <strong key={`${i}-${j}`} className="font-semibold text-zinc-100">
            {chunk.slice(2, -2)}
          </strong>
        ) : (
          <span key={`${i}-${j}`}>{chunk}</span>
        )
      );
    });
    return (
      <p key={idx} className="text-lg leading-8 text-zinc-200">
        {nodes}
      </p>
    );
  });
}

function DiagramBlock({ template }: { template?: string }) {
  const text = 'fill-zinc-300 text-[12px] font-medium';
  if (template === 'client-server-flow') {
    return (
      <svg viewBox="0 0 720 220" className="h-auto w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3">
        <rect x="50" y="60" width="160" height="90" rx="12" className="fill-blue-950 stroke-blue-500" />
        <text x="130" y="110" textAnchor="middle" className={text}>
          Client
        </text>
        <rect x="510" y="60" width="160" height="90" rx="12" className="fill-emerald-950 stroke-emerald-500" />
        <text x="590" y="110" textAnchor="middle" className={text}>
          Server
        </text>
        <path d="M220 92 L500 92" stroke="#60a5fa" strokeWidth="3" markerEnd="url(#a)" />
        <path d="M500 120 L220 120" stroke="#34d399" strokeWidth="3" markerEnd="url(#a)" />
        <text x="360" y="82" textAnchor="middle" className="fill-blue-300 text-[11px]">
          HTTP Request
        </text>
        <text x="360" y="142" textAnchor="middle" className="fill-emerald-300 text-[11px]">
          Response (JSON/HTML)
        </text>
        <defs>
          <marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#60a5fa" />
          </marker>
        </defs>
      </svg>
    );
  }
  if (template === 'performance-pillars') {
    return (
      <svg viewBox="0 0 720 260" className="h-auto w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3">
        <rect x="70" y="50" width="180" height="150" rx="12" className="fill-cyan-950 stroke-cyan-500" />
        <rect x="270" y="50" width="180" height="150" rx="12" className="fill-amber-950 stroke-amber-500" />
        <rect x="470" y="50" width="180" height="150" rx="12" className="fill-violet-950 stroke-violet-500" />
        <text x="160" y="95" textAnchor="middle" className={text}>Throughput</text>
        <text x="160" y="125" textAnchor="middle" className="fill-zinc-400 text-[11px]">requests / sec</text>
        <text x="360" y="95" textAnchor="middle" className={text}>Latency</text>
        <text x="360" y="125" textAnchor="middle" className="fill-zinc-400 text-[11px]">time / request</text>
        <text x="560" y="95" textAnchor="middle" className={text}>Capacity</text>
        <text x="560" y="125" textAnchor="middle" className="fill-zinc-400 text-[11px]">max concurrent load</text>
      </svg>
    );
  }
  if (template === 'database-bottleneck') {
    return (
      <svg viewBox="0 0 720 220" className="h-auto w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3">
        <rect x="70" y="70" width="180" height="80" rx="10" className="fill-sky-950 stroke-sky-500" />
        <text x="160" y="118" textAnchor="middle" className={text}>API Service</text>
        <rect x="470" y="50" width="180" height="120" rx="10" className="fill-rose-950 stroke-rose-500" />
        <text x="560" y="98" textAnchor="middle" className={text}>Database</text>
        <text x="560" y="124" textAnchor="middle" className="fill-red-300 text-[11px]">High utilization</text>
        <path d="M250 110 L460 110" stroke="#fda4af" strokeWidth="3" markerEnd="url(#b)" />
        <text x="360" y="95" textAnchor="middle" className="fill-zinc-400 text-[11px]">Queries pile up</text>
        <defs>
          <marker id="b" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#fda4af" />
          </marker>
        </defs>
      </svg>
    );
  }
  if (template === 'cache-aside') {
    return (
      <svg viewBox="0 0 720 260" className="h-auto w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3">
        <rect x="40" y="95" width="170" height="70" rx="10" className="fill-blue-950 stroke-blue-500" />
        <text x="125" y="135" textAnchor="middle" className={text}>Service</text>
        <rect x="280" y="45" width="170" height="70" rx="10" className="fill-emerald-950 stroke-emerald-500" />
        <text x="365" y="85" textAnchor="middle" className={text}>Cache (Redis)</text>
        <rect x="280" y="160" width="170" height="70" rx="10" className="fill-violet-950 stroke-violet-500" />
        <text x="365" y="200" textAnchor="middle" className={text}>Database</text>
        <path d="M210 120 L270 80" stroke="#34d399" strokeWidth="3" markerEnd="url(#c)" />
        <path d="M210 140 L270 195" stroke="#c084fc" strokeWidth="3" markerEnd="url(#c)" />
        <text x="520" y="85" className="fill-emerald-300 text-[11px]">Cache hit: fast</text>
        <text x="520" y="200" className="fill-violet-300 text-[11px]">Cache miss: query DB</text>
        <defs>
          <marker id="c" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#a3a3a3" />
          </marker>
        </defs>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 720 220" className="h-auto w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3">
      <rect x="60" y="75" width="140" height="70" rx="10" className="fill-cyan-950 stroke-cyan-500" />
      <rect x="290" y="45" width="140" height="70" rx="10" className="fill-cyan-950 stroke-cyan-500" />
      <rect x="290" y="145" width="140" height="70" rx="10" className="fill-cyan-950 stroke-cyan-500" />
      <rect x="520" y="95" width="140" height="70" rx="10" className="fill-cyan-950 stroke-cyan-500" />
      <text x="130" y="115" textAnchor="middle" className={text}>Load Balancer</text>
      <text x="360" y="85" textAnchor="middle" className={text}>Service A</text>
      <text x="360" y="185" textAnchor="middle" className={text}>Service B</text>
      <text x="590" y="135" textAnchor="middle" className={text}>Service C</text>
      <path d="M200 110 L280 80" stroke="#22d3ee" strokeWidth="3" />
      <path d="M200 110 L280 180" stroke="#22d3ee" strokeWidth="3" />
      <path d="M430 80 L510 120" stroke="#22d3ee" strokeWidth="3" />
      <path d="M430 180 L510 140" stroke="#22d3ee" strokeWidth="3" />
    </svg>
  );
}

function Block({
  stageId,
  block,
  index,
  onTryInSandbox,
}: {
  stageId: string;
  block: LearnBlock;
  index: number;
  onTryInSandbox: (prompt: string) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [skipped, setSkipped] = useState(false);
  const setQuizResult = useJourneyStore((s) => s.setQuizResult);

  if (block.type === 'analogy') {
    return (
      <div className="rounded-lg border-l-4 border-amber-400 bg-amber-950/30 p-5">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-300">
          <Lightbulb className="h-4 w-4" /> Analogy
        </p>
        <p className="mt-3 text-lg leading-8 text-zinc-100">{block.content}</p>
      </div>
    );
  }

  if (block.type === 'comparison' && block.comparison) {
    return (
      <div className="grid grid-cols-1 gap-4 rounded-lg border border-zinc-700 bg-zinc-900/50 p-5 md:grid-cols-2">
        <div>
          <h4 className="text-base font-semibold text-zinc-100">{block.comparison.left}</h4>
          <ul className="mt-2 list-disc pl-5 text-base text-zinc-300">
            {block.comparison.leftItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-base font-semibold text-zinc-100">{block.comparison.right}</h4>
          <ul className="mt-2 list-disc pl-5 text-base text-zinc-300">
            {block.comparison.rightItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (block.type === 'diagram') {
    return <DiagramBlock template={block.diagramTemplate} />;
  }

  if (block.type === 'quiz' && block.quiz) {
    const quiz = block.quiz;
    const isCorrect = selected === quiz.correctIndex;
    return (
      <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-5">
        <p className="text-lg font-semibold text-zinc-100">{quiz.question}</p>
        <div className="mt-3 space-y-2">
          {quiz.options.map((option, idx) => (
            <button
              key={option}
              type="button"
              className={`w-full rounded-md border px-3 py-2 text-left text-base transition ${
                selected === null
                  ? 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-zinc-600'
                    : idx === quiz.correctIndex
                    ? 'border-emerald-600 bg-emerald-950/30 text-emerald-200'
                    : idx === selected
                      ? 'border-red-600 bg-red-950/30 text-red-200'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400'
              }`}
              onClick={() => {
                setSelected(idx);
                setSkipped(false);
                setQuizResult(stageId, `${stageId}-quiz-${index}`, idx === quiz.correctIndex);
              }}
            >
              {option}
            </button>
          ))}
        </div>
        {selected !== null ? (
          <p className="mt-3 text-sm text-zinc-300">
            {isCorrect ? 'Correct. ' : 'Not quite. '}
            {quiz.explanation}
          </p>
        ) : null}
        <button
          type="button"
          className="mt-3 text-sm text-zinc-400 underline decoration-zinc-600 underline-offset-4 hover:text-zinc-200"
          onClick={() => {
            setSkipped(true);
            setSelected(null);
            setQuizResult(stageId, `${stageId}-quiz-${index}`, false);
          }}
        >
          Skip this question
        </button>
        {skipped ? <p className="mt-2 text-sm text-amber-300">Skipped. You can revisit later.</p> : null}
      </div>
    );
  }

  if (block.type === 'interactive') {
    return (
      <div className="rounded-lg border border-cyan-700/40 bg-cyan-950/20 p-5">
        <p className="text-lg text-zinc-100">{block.content}</p>
        <p className="mt-3 whitespace-pre-line text-base text-zinc-300">{block.interactivePrompt}</p>
        <button
          type="button"
          className="mt-4 rounded-md border border-cyan-700/60 bg-cyan-950/40 px-4 py-2 text-sm font-semibold text-cyan-200"
          onClick={() => onTryInSandbox(block.interactivePrompt ?? 'Try this concept in the sandbox.')}
        >
          Try it in Sandbox →
        </button>
      </div>
    );
  }

  return <div className="space-y-2">{renderMarkdown(block.content)}</div>;
}

export function LearnView({ stage, onBack, onTryInSandbox }: LearnViewProps) {
  const completeLearn = useJourneyStore((s) => s.completeLearn);
  const getQuizSummary = useJourneyStore((s) => s.getQuizSummary);
  const summary = useMemo(() => getQuizSummary(stage.id), [getQuizSummary, stage.id]);
  const scoreText = `${summary.correct}/${summary.total} quiz questions right`;

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      <div className="min-h-0 flex-1 overflow-auto px-4 pb-8">
        <section className="mx-auto flex w-full max-w-3xl flex-col">
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-1 py-4 backdrop-blur">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Journey
            </button>
            <p className="text-xs text-zinc-400">
              {stage.parts.learn.estimatedMinutes} min read • {scoreText}
            </p>
          </div>
          <div className="space-y-6 py-6">
            {stage.parts.learn.content.map((block, idx) => (
              <Block
                key={`${block.type}-${idx}`}
                stageId={stage.id}
                block={block}
                index={idx}
                onTryInSandbox={onTryInSandbox}
              />
            ))}
            <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-5">
              <p className="text-base text-zinc-200">You got {scoreText}.</p>
            </div>
          </div>
          <div className="border-t border-zinc-800 py-4">
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
        </section>
      </div>
    </div>
  );
}
