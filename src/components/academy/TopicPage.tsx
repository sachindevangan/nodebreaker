import { Check, CheckCircle2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  CURRICULUM_TOPIC_MAP,
  getPrevNextTopic,
  type QuizQuestion,
  type SimulatorDemo,
} from '@/constants/curriculum';
import { useAcademyStore } from '@/store/useAcademyStore';
import { ReadContent } from './ReadContent';

type TabId = 'read' | 'see' | 'prove';

function shuffleIndices(length: number, seed: number): number[] {
  const out = Array.from({ length }, (_, i) => i);
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

interface TopicPageProps {
  topicId: string;
  onBack: () => void;
  onNavigateTopic: (topicId: string) => void;
  onGoSandbox: (opts: { topicId: string; instruction: string; demo?: SimulatorDemo }) => void;
}

export function TopicPage({ topicId, onBack, onNavigateTopic, onGoSandbox }: TopicPageProps) {
  const ctx = CURRICULUM_TOPIC_MAP.get(topicId);
  const markReadComplete = useAcademyStore((s) => s.markReadComplete);
  const getTopicProgress = useAcademyStore((s) => s.getTopicProgress);

  const [tab, setTab] = useState<TabId>('read');

  const p = getTopicProgress(topicId);
  const topic = ctx?.topic;
  const chapter = ctx?.chapter;
  const topicIndex = ctx?.topicIndex ?? 0;

  const readScrollRef = useRef<HTMLDivElement>(null);
  const [readScrolledToEnd, setReadScrolledToEnd] = useState(false);

  const checkScroll = useCallback(() => {
    const el = readScrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setReadScrolledToEnd(scrollTop + clientHeight >= scrollHeight - 32);
  }, []);

  useEffect(() => {
    const el = readScrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll, topicId, tab]);

  useEffect(() => {
    setReadScrolledToEnd(false);
    setTab('read');
  }, [topicId]);

  const { prev, next } = useMemo(() => getPrevNextTopic(topicId), [topicId]);

  if (!topic || !chapter) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-8 text-[var(--text)]">
        <p>Topic not found.</p>
        <button type="button" className="mt-4 text-cyan-400 underline" onClick={onBack}>
          Back to Academy
        </button>
      </div>
    );
  }

  const totalInChapter = chapter.topics.length;
  const tabBtn = (id: TabId, label: string, done: boolean) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`relative pb-2 text-sm font-medium transition-colors ${
        tab === id ? 'text-[var(--text)]' : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        {label}
        {done ? <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} aria-label="Complete" /> : null}
      </span>
      {tab === id ? <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" /> : null}
    </button>
  );

  const isFirstInChapter = !prev || prev.chapter.id !== chapter.id;
  const isLastInChapter = !next || next.chapter.id !== chapter.id;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[var(--border)] bg-[var(--header-bg)] px-4 py-3">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-left text-sm font-medium text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Academy
          </button>
          <p className="text-center text-sm font-medium text-[var(--text)]">
            Chapter {chapter.number}: {chapter.title}
          </p>
          <p className="text-right text-xs text-[var(--text-secondary)] sm:min-w-[7rem]">
            Topic {topicIndex + 1} of {totalInChapter}
          </p>
        </div>
        <div className="mx-auto mt-4 flex max-w-4xl gap-6 border-b border-transparent">
          {tabBtn('read', '📖 Read', p.readCompleted)}
          {tabBtn('see', '👁️ See', p.demoCompleted)}
          {tabBtn('prove', '✅ Prove', p.completed)}
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {tab === 'read' ? (
          <ReadTab
            content={topic.readContent}
            scrollRef={readScrollRef}
            readScrolledToEnd={readScrolledToEnd}
            readDone={p.readCompleted}
            onMarkRead={() => markReadComplete(topicId)}
          />
        ) : null}
        {tab === 'see' ? (
          <SeeTab
            demo={topic.simulatorDemo}
            demoDone={p.demoCompleted}
            onOpenSandbox={() =>
              onGoSandbox({
                topicId,
                instruction:
                  topic.simulatorDemo?.instruction ??
                  'Explore the sandbox freely. Add components from the palette and run the simulation.',
                demo: topic.simulatorDemo,
              })
            }
          />
        ) : null}
        {tab === 'prove' ? (
          <ProveTab
            topicId={topicId}
            questions={topic.quizQuestions}
            interviewTip={topic.interviewTip}
            quizAttempts={p.quizAttempts}
            onNavigateNext={() => (next ? onNavigateTopic(next.topic.id) : undefined)}
            nextTopicId={next?.topic.id ?? null}
          />
        ) : null}
      </main>

      <footer className="border-t border-[var(--border)] px-4 py-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 text-sm">
          {!isFirstInChapter && prev ? (
            <button
              type="button"
              onClick={() => onNavigateTopic(prev.topic.id)}
              className="text-cyan-400 hover:text-cyan-300"
            >
              ← Previous Topic
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button
              type="button"
              onClick={() => onNavigateTopic(next.topic.id)}
              className="text-cyan-400 hover:text-cyan-300"
            >
              {isLastInChapter ? `Next: Chapter ${chapter.number + 1} →` : 'Next Topic →'}
            </button>
          ) : null}
        </div>
      </footer>
    </div>
  );
}

function ReadTab({
  content,
  scrollRef,
  readScrolledToEnd,
  readDone,
  onMarkRead,
}: {
  content: string;
  scrollRef: RefObject<HTMLDivElement>;
  readScrolledToEnd: boolean;
  readDone: boolean;
  onMarkRead: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div ref={scrollRef} className="max-h-[min(70vh,560px)] overflow-y-auto pr-1">
        <ReadContent content={content} />
      </div>
      <div className="mt-8 flex justify-center border-t border-[var(--border)] pt-6">
        {readDone ? (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400">
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
            Read Complete
          </span>
        ) : (
          <button
            type="button"
            disabled={!readScrolledToEnd}
            onClick={onMarkRead}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark as Read ✓
          </button>
        )}
      </div>
    </div>
  );
}

function SeeTab({
  demo,
  demoDone,
  onOpenSandbox,
}: {
  demo?: SimulatorDemo;
  demoDone: boolean;
  onOpenSandbox: () => void;
}) {
  if (demo) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{demo.description}</p>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-relaxed text-[var(--text)]">
          {demo.instruction}
        </div>
        <button
          type="button"
          onClick={onOpenSandbox}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
        >
          Open in Simulator →
        </button>
        {demoDone ? (
          <p className="text-sm text-emerald-400">Demo marked complete.</p>
        ) : (
          <p className="text-xs text-[var(--text-secondary)]">
            Use the floating card in the sandbox to mark this demo complete.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 text-center">
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
        This is a theory topic. The concepts here apply across many components — head to the Sandbox to experiment
        freely.
      </p>
      <button
        type="button"
        onClick={onOpenSandbox}
        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-hover)]"
      >
        Open Sandbox →
      </button>
    </div>
  );
}

interface ProveTabProps {
  topicId: string;
  questions: QuizQuestion[];
  interviewTip?: string;
  quizAttempts: number;
  onNavigateNext: () => void;
  nextTopicId: string | null;
}

function ProveTab({ topicId, questions, interviewTip, quizAttempts, onNavigateNext, nextTopicId }: ProveTabProps) {
  const submitQuiz = useAcademyStore((s) => s.submitQuiz);
  const collectInterviewTip = useAcademyStore((s) => s.collectInterviewTip);

  const [roundKey, setRoundKey] = useState(0);
  const order = useMemo(
    () => shuffleIndices(questions.length, quizAttempts * 997 + topicId.length + roundKey),
    [questions.length, quizAttempts, topicId, roundKey]
  );

  const [qi, setQi] = useState(0);
  const [wrongIds, setWrongIds] = useState<Set<string>>(() => new Set());
  const wrongRef = useRef(wrongIds);
  wrongRef.current = wrongIds;

  const [phase, setPhase] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setQi(0);
    setWrongIds(new Set());
    setPhase('idle');
    setSelected(null);
    setFinished(false);
  }, [topicId, roundKey, questions.length]);

  useEffect(() => {
    if (phase !== 'correct') return;
    const t = window.setTimeout(() => {
      if (qi + 1 >= questions.length) {
        const w = wrongRef.current;
        const total = questions.length;
        const pct = total === 0 ? 0 : Math.round(((total - w.size) / total) * 100);
        submitQuiz(topicId, pct);
        setFinished(true);
      } else {
        setQi((q) => q + 1);
        setPhase('idle');
        setSelected(null);
      }
    }, 1500);
    return () => window.clearTimeout(t);
  }, [phase, qi, questions.length, submitQuiz, topicId]);

  const finishRound = () => {
    const w = wrongRef.current;
    const total = questions.length;
    const pct = total === 0 ? 0 : Math.round(((total - w.size) / total) * 100);
    submitQuiz(topicId, pct);
    setFinished(true);
  };

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-xl text-center text-sm text-[var(--text-secondary)]">
        Quiz questions coming soon for this topic.
      </div>
    );
  }

  if (finished) {
    const total = questions.length;
    const wrong = wrongIds.size;
    const correct = total - wrong;
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
    const perfect = pct === 100;

    return (
      <div className="mx-auto max-w-xl space-y-6">
        <p className="text-center text-lg font-medium">
          {correct}/{total} correct ({pct}%)
        </p>
        {perfect ? (
          <div className="space-y-4 text-center">
            <p className="text-emerald-400">Perfect Score! Topic Complete ✓</p>
            {interviewTip ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-left text-sm">
                <p className="font-medium text-[var(--text)]">Interview tip</p>
                <p className="mt-2 text-[var(--text-secondary)]">{interviewTip}</p>
                <button
                  type="button"
                  onClick={() => collectInterviewTip(topicId)}
                  className="mt-3 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500"
                >
                  Add to Collection
                </button>
              </div>
            ) : null}
            {nextTopicId ? (
              <button type="button" onClick={onNavigateNext} className="text-cyan-400 hover:text-cyan-300">
                Next Topic →
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-sm text-amber-200/90">You need 100% to complete this topic.</p>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              {questions
                .filter((qq) => wrongIds.has(qq.id))
                .map((qq) => (
                  <li key={qq.id} className="rounded border border-[var(--border)] p-3">
                    <p className="font-medium text-[var(--text)]">{qq.question}</p>
                    <p className="mt-1 text-xs">{qq.explanation}</p>
                  </li>
                ))}
            </ul>
            <p className="text-center text-xs text-[var(--text-secondary)]">Attempt {quizAttempts + 1}</p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setRoundKey((k) => k + 1);
                  setFinished(false);
                }}
                className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600"
              >
                Retry Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const qIndex = order[qi] ?? 0;
  const q = questions[qIndex]!;
  const progressPct = ((qi + (phase !== 'idle' ? 0.5 : 0)) / questions.length) * 100;

  const pick = (optionIndex: number) => {
    if (phase !== 'idle') return;
    setSelected(optionIndex);
    const ok = optionIndex === q.correctIndex;
    if (ok) {
      setPhase('correct');
    } else {
      setPhase('wrong');
      setWrongIds((w) => new Set(w).add(q.id));
    }
  };

  const gotIt = () => {
    if (qi + 1 >= questions.length) {
      finishRound();
    } else {
      setQi((x) => x + 1);
      setPhase('idle');
      setSelected(null);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <div className="mb-2 flex justify-between text-xs text-[var(--text-secondary)]">
          <span>
            Question {qi + 1} of {questions.length}
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
          <div className="h-full rounded-full bg-cyan-600/80 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
      <p className="text-lg font-medium text-[var(--text)]">{q.question}</p>
      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          let cls =
            'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left text-sm text-[var(--text)] hover:bg-[var(--surface-hover)]';
          if (phase !== 'idle') {
            if (i === q.correctIndex) cls = `${cls} border-emerald-600 bg-emerald-950/40`;
            else if (i === selected && phase === 'wrong') cls = `${cls} border-red-600 bg-red-950/40`;
          }
          return (
            <button
              key={i}
              type="button"
              disabled={phase !== 'idle'}
              onClick={() => pick(i)}
              className={cls}
            >
              <span className="inline-flex w-full items-center justify-between gap-2">
                {opt}
                {phase !== 'idle' && i === q.correctIndex ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={2} />
                ) : null}
                {phase === 'wrong' && i === selected ? (
                  <X className="h-4 w-4 shrink-0 text-red-400" strokeWidth={2} />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      {phase !== 'idle' ? <p className="text-sm text-[var(--text-secondary)]">{q.explanation}</p> : null}
      {phase === 'wrong' ? (
        <button type="button" onClick={gotIt} className="rounded-lg bg-zinc-700 px-4 py-2 text-sm text-white">
          Got it
        </button>
      ) : null}
    </div>
  );
}
