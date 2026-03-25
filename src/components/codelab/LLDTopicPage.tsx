import { Check, CheckCircle2, X, XCircle, BookOpen, GraduationCap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { QuizQuestion } from '@/constants/curriculumTypes';
import { useCodeLabStore } from '@/store/useCodeLabStore';
import { getLLDTopicContext } from '@/constants/lldCurriculum';
import type { CodeExample, UMLDiagram } from '@/constants/lldTypes';
import { CodeBlock } from './CodeBlock';
import { DiagramBlock } from './DiagramBlock';
import { ExerciseCard } from './ExerciseCard';
import { getTopicContext } from '@/constants/curriculum';
import type { LLDTopicProgress } from '@/store/useCodeLabStore';

type TabId = 'learn' | 'code' | 'practice' | 'quiz';

type CalloutKind = 'analogy' | 'important' | 'interview' | 'numbers';

type Block =
  | { kind: 'md'; text: string }
  | { kind: 'callout'; variant: CalloutKind; body: string }
  | { kind: 'diagram'; diagramId: string };

const cardBase = 'rounded-lg border border-[var(--border)] bg-[var(--surface)]';

function parseBlocks(raw: string): Block[] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  const mdBuf: string[] = [];

  const flushMd = () => {
    const t = mdBuf.join('\n').trim();
    if (t) blocks.push({ kind: 'md', text: t });
    mdBuf.length = 0;
  };

  const mapPrefix = (p: string): CalloutKind | null => {
    if (p === 'ANALOGY') return 'analogy';
    if (p === 'IMPORTANT') return 'important';
    if (p === 'INTERVIEW TIP') return 'interview';
    if (p === 'NUMBERS') return 'numbers';
    return null;
  };

  while (i < lines.length) {
    const line = lines[i] ?? '';

    const diagramMatch = line.match(/^> DIAGRAM:\s*(.+?)\s*$/);
    if (diagramMatch) {
      flushMd();
      blocks.push({ kind: 'diagram', diagramId: diagramMatch[1] ?? '' });
      i += 1;
      continue;
    }

    const m = line.match(/^> (ANALOGY|IMPORTANT|INTERVIEW TIP|NUMBERS):\s*(.*)$/);
    if (m) {
      flushMd();
      const variant = mapPrefix(m[1] ?? '');
      let body = (m[2] ?? '').trimEnd();
      i += 1;
      while (i < lines.length) {
        const next = lines[i] ?? '';
        if (next === '') break;
        if (/^> (ANALOGY|IMPORTANT|INTERVIEW TIP|NUMBERS):/.test(next)) break;
        if (/^> DIAGRAM:\s*(.+?)\s*$/.test(next)) break;
        body = body ? `${body}\n${next}` : next;
        i += 1;
      }
      if (variant && body.trim()) blocks.push({ kind: 'callout', variant, body: body.trim() });
      continue;
    }

    mdBuf.push(line);
    i += 1;
  }

  flushMd();
  return blocks;
}

function CalloutBox({ variant, body }: { variant: CalloutKind; body: string }) {
  const styles: Record<CalloutKind, { border: string; icon: JSX.Element }> = {
    analogy: {
      border: 'border-l-amber-500',
      icon: <BookOpen className="h-4 w-4 shrink-0 text-amber-400" strokeWidth={2} aria-hidden />,
    },
    important: {
      border: 'border-l-red-500',
      icon: <GraduationCap className="h-4 w-4 shrink-0 text-red-400" strokeWidth={2} aria-hidden />,
    },
    interview: {
      border: 'border-l-blue-500',
      icon: <GraduationCap className="h-4 w-4 shrink-0 text-blue-400" strokeWidth={2} aria-hidden />,
    },
    numbers: {
      border: 'border-l-emerald-500',
      icon: <Check className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={2} aria-hidden />,
    },
  };

  const s = styles[variant];
  const label =
    variant === 'analogy'
      ? 'Analogy'
      : variant === 'important'
        ? 'Important'
        : variant === 'interview'
          ? 'Interview tip'
          : 'Numbers';

  return (
    <aside className={`my-4 flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 ${s.border} border-l-4`}>
      {s.icon}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{label}</p>
        <div className="prose prose-invert mt-1 max-w-none text-sm text-[var(--text)] prose-p:my-1">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
        </div>
      </div>
    </aside>
  );
}

function childrenToString(children: unknown): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) {
    return children
      .map((c) => (typeof c === 'string' ? c : typeof c === 'number' ? String(c) : ''))
      .join('');
  }
  return '';
}

function highlightJava(code: string): ReactNode[] {
  const keywords = [
    'public',
    'private',
    'protected',
    'class',
    'interface',
    'extends',
    'implements',
    'static',
    'final',
    'void',
    'int',
    'long',
    'double',
    'boolean',
    'char',
    'byte',
    'short',
    'String',
    'new',
    'return',
    'if',
    'else',
    'for',
    'while',
    'switch',
    'case',
    'break',
    'continue',
    'try',
    'catch',
    'finally',
    'throw',
    'throws',
    'this',
    'super',
    'package',
    'import',
    'enum',
    'abstract',
  ];
  const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
  const parts: ReactNode[] = [];
  let lastIdx = 0;
  for (const m of code.matchAll(keywordRegex)) {
    const idx = m.index ?? 0;
    const kw = m[0];
    if (idx > lastIdx) parts.push(code.slice(lastIdx, idx));
    parts.push(
      <span key={`${idx}-${kw}`} className="text-cyan-300 font-semibold">
        {kw}
      </span>
    );
    lastIdx = idx + kw.length;
  }
  if (lastIdx < code.length) parts.push(code.slice(lastIdx));
  return parts;
}

export function LLDTopicPage({
  topicId,
  onBack,
  onGoToHldTopic,
}: {
  topicId: string;
  onBack: () => void;
  onGoToHldTopic: (hldTopicId: string) => void;
}) {
  const ctx = getLLDTopicContext(topicId);
  const markReadComplete = useCodeLabStore((s) => s.markReadComplete);
  const markExerciseComplete = useCodeLabStore((s) => s.markExerciseComplete);
  const revealSolution = useCodeLabStore((s) => s.revealSolution);
  const submitQuiz = useCodeLabStore((s) => s.submitQuiz);

  const p = useCodeLabStore((s) => s.progress.get(topicId));
  const topicProgress: LLDTopicProgress =
    p ?? {
    readCompleted: false,
    exercisesCompleted: [],
    quizScore: 0,
    quizAttempts: 0,
    completed: false,
    solutionRevealed: [],
  };

  const [tab, setTab] = useState<TabId>('learn');

  const [readScrolledToEnd, setReadScrolledToEnd] = useState(false);
  const readScrollRef = useRef<HTMLDivElement | null>(null);

  const checkScroll = useCallback(() => {
    const el = readScrollRef.current;
    if (!el) return;
    setReadScrolledToEnd(el.scrollTop + el.clientHeight >= el.scrollHeight - 32);
  }, []);

  useEffect(() => {
    setReadScrolledToEnd(false);
    setTab('learn');
  }, [topicId]);

  useEffect(() => {
    const el = readScrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll, topicId, tab]);

  const topic = ctx?.topic;
  const chapter = ctx?.chapter;
  const topicIndex = ctx?.topicIndex ?? 0;

  const blocks = useMemo(() => parseBlocks(topic?.readContent ?? ''), [topic?.readContent]);
  const diagramsById = useMemo(() => {
    const map = new Map<string, UMLDiagram>();
    for (const d of topic?.diagrams ?? []) map.set(d.id, d);
    return map;
  }, [topic?.diagrams]);

  const connectedHldTopics = useMemo(() => {
    const ids = topic?.connectedHLDTopics ?? [];
    const out: { id: string; label: string }[] = [];
    for (const id of ids) {
      const hld = getTopicContext(id);
      if (!hld) continue;
      out.push({
        id,
        label: `Chapter ${hld.chapter.number}: ${hld.chapter.title} — ${hld.topic.title}`,
      });
    }
    return out;
  }, [topic?.connectedHLDTopics]);

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

  const quizQuestions: QuizQuestion[] = topic?.quizQuestions ?? [];

  const codeExamples: CodeExample[] = topic?.codeExamples ?? [];
  const exercises = topic?.exercises ?? [];

  const solutionRevealed = topicProgress.solutionRevealed ?? [];

  const submitQuizScore = (score: number) => {
    if (!topic) return;
    submitQuiz(topic.id, score);
  };

  const quizAttempts = topicProgress.quizAttempts ?? 0;

  const shuffleIndices = (length: number, seed: number): number[] => {
    const out = Array.from({ length }, (_, i) => i);
    let s = seed;
    for (let i = out.length - 1; i > 0; i--) {
      s = (s * 1103515245 + 12345) >>> 0;
      const j = s % (i + 1);
      [out[i], out[j]] = [out[j]!, out[i]!];
    }
    return out;
  };

  const [roundKey, setRoundKey] = useState(0);
  const order = useMemo(
    () => shuffleIndices(quizQuestions.length, quizAttempts * 997 + topicId.length + roundKey),
    [quizQuestions.length, quizAttempts, topicId, roundKey]
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
  }, [topicId, roundKey, quizQuestions.length]);

  useEffect(() => {
    if (phase !== 'correct') return;
    const t = window.setTimeout(() => {
      if (qi + 1 >= quizQuestions.length) {
        const w = wrongRef.current;
        const total = quizQuestions.length;
        const pct = total === 0 ? 0 : Math.round(((total - w.size) / total) * 100);
        submitQuizScore(pct);
        setFinished(true);
      } else {
        setQi((q) => q + 1);
        setPhase('idle');
        setSelected(null);
      }
    }, 1500);
    return () => window.clearTimeout(t);
  }, [phase, qi, quizQuestions.length, submitQuizScore]);

  const finishRound = () => {
    const w = wrongRef.current;
    const total = quizQuestions.length;
    const pct = total === 0 ? 0 : Math.round(((total - w.size) / total) * 100);
    submitQuizScore(pct);
    setFinished(true);
  };

  if (!topic || !chapter) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-8 text-[var(--text)]">
        <p>Topic not found.</p>
        <button type="button" className="mt-4 text-cyan-400 underline" onClick={onBack}>
          Back to Code Lab
        </button>
      </div>
    );
  }

  const totalInChapter = chapter.topics.length;

  const qIndex = order[qi] ?? 0;
  const q = quizQuestions[qIndex]!;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[var(--border)] bg-[var(--header-bg)] px-4 py-3">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-left text-sm font-medium text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Code Lab
          </button>
          <p className="text-center text-sm font-medium text-[var(--text)]">
            Chapter {chapter.id}: {chapter.title}
          </p>
          <p className="text-right text-xs text-[var(--text-secondary)] sm:min-w-[7rem]">
            Topic {topicIndex + 1} of {totalInChapter}
          </p>
        </div>
        <div className="mx-auto mt-4 flex max-w-4xl gap-6 border-b border-transparent">
          {tabBtn('learn', '📖 Learn', topicProgress.readCompleted)}
          {tabBtn('code', '💻 Code', codeExamples.length > 0)}
          {tabBtn('practice', '🏋️ Practice', exercises.length > 0 && exercises.every((e) => topicProgress.exercisesCompleted.includes(e.id)))}
          {tabBtn('quiz', '✅ Quiz', topicProgress.completed)}
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {tab === 'learn' ? (
          <div className="mx-auto max-w-3xl">
            <div ref={readScrollRef} className="max-h-[min(70vh,560px)] overflow-y-auto pr-1">
              <div className="space-y-4 text-[var(--text)]">
                {blocks.map((b, idx) => {
                  if (b.kind === 'diagram') {
                    const d = diagramsById.get(b.diagramId);
                    if (!d) {
                      return (
                        <div key={`d-${idx}`} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-secondary)]">
                          Diagram not found: {b.diagramId}
                        </div>
                      );
                    }
                    return <DiagramBlock key={d.id} title={d.title} diagramId={d.id} mermaidCode={d.mermaidCode} />;
                  }

                  if (b.kind === 'callout') {
                    return <CalloutBox key={`c-${idx}`} variant={b.variant} body={b.body} />;
                  }

                  return (
                    <div
                      key={`m-${idx}`}
                      className="prose prose-invert max-w-none text-base leading-relaxed text-[var(--text)] prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-1 prose-code:rounded prose-code:bg-[var(--surface-hover)] prose-code:px-1 prose-code:py-0.5 prose-pre:bg-[var(--surface)] prose-pre:border prose-pre:border-[var(--border)] prose-table:text-sm"
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h2 className="mt-8 text-xl font-semibold text-[var(--text)]">{children}</h2>,
                          h2: ({ children }) => <h3 className="mt-6 text-lg font-semibold text-[var(--text)]">{children}</h3>,
                          pre: ({ children }) => (
                            <pre className="rounded-lg bg-gray-950 p-3 font-mono text-sm leading-relaxed text-gray-200">
                              {children}
                            </pre>
                          ),
                          code: ({ inline, className, children: c }: { inline?: boolean; className?: string; children?: ReactNode }) => {
                            const raw = childrenToString(c);
                            const isJava = Boolean(className && className.toLowerCase().includes('java'));
                            if (inline) {
                              return (
                                <code className="rounded bg-[var(--surface-hover)] px-1 py-0.5 font-mono text-[var(--text-secondary)]">
                                  {raw}
                                </code>
                              );
                            }
                            const highlighted = isJava ? highlightJava(raw) : raw;
                            return (
                              <code>{highlighted}</code>
                            );
                          },
                        }}
                      >
                        {b.text}
                      </ReactMarkdown>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 space-y-4 border-t border-[var(--border)] pt-6">
              {connectedHldTopics.length > 0 ? (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">This concept connects to HLD:</p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {connectedHldTopics.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onGoToHldTopic(t.id)}
                        className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {topicProgress.readCompleted ? (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                  Read Complete
                </span>
              ) : (
                <button
                  type="button"
                  disabled={!readScrolledToEnd}
                  onClick={() => markReadComplete(topic.id)}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Mark as Read ✓
                </button>
              )}
            </div>
          </div>
        ) : null}

        {tab === 'code' ? (
          <div className="mx-auto max-w-3xl">
            {codeExamples.length === 0 ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-secondary)]">
                Code examples coming soon for this topic.
              </div>
            ) : (
              <div className="space-y-4">
                {codeExamples.map((ex) => (
                  <div key={ex.id} className={`${cardBase} p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--text)]">{ex.title}</p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">{ex.language}</p>
                      </div>
                      <div className="shrink-0">
                        {ex.isGood ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" strokeWidth={2} />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" strokeWidth={2} />
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <CodeBlock code={ex.code} highlightLines={ex.highlightLines} copyLabel="Copy Code" />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{ex.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {tab === 'practice' ? (
          <div className="mx-auto max-w-3xl">
            {exercises.length === 0 ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-secondary)]">
                Practice exercises coming soon for this topic.
              </div>
            ) : (
              <div className="space-y-4">
                {exercises.map((ex, idx) => {
                  const completed = topicProgress.exercisesCompleted.includes(ex.id);
                  const sol = Boolean(solutionRevealed[idx]);
                  return (
                    <ExerciseCard
                      key={ex.id}
                      topicId={topic.id}
                      exerciseIndex={idx}
                      exercise={ex}
                      completed={completed}
                      solutionRevealed={sol}
                      connectedHldTopics={connectedHldTopics}
                      onGoToHldTopic={onGoToHldTopic}
                      onMarkComplete={(topicIdArg, exerciseId) => markExerciseComplete(topicIdArg, exerciseId)}
                      onRevealSolution={(topicIdArg, exerciseIndex) => revealSolution(topicIdArg, exerciseIndex)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {tab === 'quiz' ? (
          <div className="mx-auto max-w-xl">
            {quizQuestions.length === 0 ? (
              <div className="text-center text-sm text-[var(--text-secondary)]">
                Quiz questions coming soon for this topic.
              </div>
            ) : finished ? (
              (() => {
                const total = quizQuestions.length;
                const wrong = wrongIds.size;
                const correct = total - wrong;
                const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
                const perfect = pct === 100;
                return perfect ? (
                  <div className="space-y-6">
                    <p className="text-center text-lg font-medium">
                      {correct}/{total} correct ({pct}%)
                    </p>
                    <div className="space-y-4 text-center">
                      <p className="text-emerald-400">Perfect Score! Topic Complete ✓</p>
                      {topic.interviewTip ? (
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-left text-sm">
                          <p className="font-medium text-[var(--text)]">Interview tip</p>
                          <p className="mt-2 text-[var(--text-secondary)]">{topic.interviewTip}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-center text-sm text-amber-200/90">You need 100% to complete this topic.</p>
                    <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                      {quizQuestions
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
                );
              })()
            ) : (
              <>
                <div className="space-y-6">
                  <div>
                    <div className="mb-2 flex justify-between text-xs text-[var(--text-secondary)]">
                      <span>
                        Question {qi + 1} of {quizQuestions.length}
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
                      <div
                        className="h-full rounded-full bg-cyan-600/80 transition-all"
                        style={{
                          width: `${((qi + (phase !== 'idle' ? 0.5 : 0)) / quizQuestions.length) * 100}%`,
                        }}
                      />
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
                          onClick={() => {
                            if (phase !== 'idle') return;
                            setSelected(i);
                            const ok = i === q.correctIndex;
                            if (ok) setPhase('correct');
                            else {
                              setPhase('wrong');
                              setWrongIds((w) => new Set(w).add(q.id));
                            }
                          }}
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
                    <button type="button" onClick={finishRound} className="rounded-lg bg-zinc-700 px-4 py-2 text-sm text-white">
                      Got it
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

