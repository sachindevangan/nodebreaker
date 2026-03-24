import { Timer, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { scoreArchitecture } from '@/simulation/scorer';
import { useFlowStore } from '@/store/useFlowStore';
import { useSimStore } from '@/store/useSimStore';

type SessionSummary = {
  date: string;
  duration: number;
  grade: string;
  score: number;
  componentCount: number;
};

const STORAGE_KEY = 'nb-interview-history-v1';

function readHistory(): SessionSummary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SessionSummary[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(items: SessionSummary[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 20)));
}

interface InterviewTimerProps {
  active: boolean;
  onActiveChange: (active: boolean) => void;
}

export function InterviewTimer({ active, onActiveChange }: InterviewTimerProps) {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const nodeMetrics = useSimStore((s) => s.nodeMetrics);
  const [open, setOpen] = useState(false);
  const [durationMin, setDurationMin] = useState(45);
  const [remainingSec, setRemainingSec] = useState(45 * 60);
  const [history, setHistory] = useState<SessionSummary[]>(() => readHistory());
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setRemainingSec((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (!active || remainingSec > 0) return;
    const scored = scoreArchitecture(nodes, edges, nodeMetrics);
    const result: SessionSummary = {
      date: new Date().toISOString(),
      duration: durationMin,
      grade: scored.overall,
      score: scored.overallScore,
      componentCount: nodes.length,
    };
    const next = [result, ...history];
    setHistory(next);
    writeHistory(next);
    setSummary(result);
    onActiveChange(false);
  }, [active, remainingSec, nodes, edges, nodeMetrics, durationMin, history]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'i') {
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const pct = useMemo(() => remainingSec / Math.max(1, durationMin * 60), [remainingSec, durationMin]);
  const timerClass = pct > 0.5 ? 'text-emerald-300' : pct > 0.25 ? 'text-amber-300' : 'text-red-300 animate-pulse';
  const fmt = `${Math.floor(remainingSec / 60)}:${String(remainingSec % 60).padStart(2, '0')}`;
  const elapsed = durationMin * 60 - remainingSec;
  const phase = elapsed < 5 * 60 ? '📋 Requirements & Estimation' : elapsed < 20 * 60 ? '🏗️ High-Level Design' : elapsed < 35 * 60 ? '🔍 Deep Dive' : '⚡ Bottlenecks & Trade-offs';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors ${
          active ? 'border-cyan-600 bg-cyan-900/40 text-cyan-100' : 'border-transparent text-zinc-400 hover:border-zinc-700/80 hover:bg-zinc-800/60 hover:text-zinc-100'
        }`}
      >
        <Timer className="h-4 w-4" />
        <span>Interview Mode</span>
      </button>
      {active ? (
        <div className="pointer-events-none absolute left-1/2 top-3 z-[90] -translate-x-1/2 rounded-lg border border-zinc-700 bg-zinc-900/90 px-4 py-2 text-center shadow-xl">
          <p className={`text-2xl font-bold ${timerClass}`}>{fmt}</p>
          <p className="mt-0.5 text-xs text-zinc-300">{phase}</p>
        </div>
      ) : null}
      {summary ? (
        <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/65 p-4">
          <div className="w-[min(560px,calc(100vw-2rem))] rounded-xl border border-zinc-700 bg-zinc-900 p-5">
            <h3 className="text-lg font-semibold text-zinc-100">Time&apos;s Up!</h3>
            <p className="mt-2 text-sm text-zinc-300">Interview Summary</p>
            <ul className="mt-2 space-y-1 text-sm text-zinc-300">
              <li>Components used: {summary.componentCount}</li>
              <li>Time spent: {summary.duration}:00</li>
              <li>Architecture grade: {summary.grade}</li>
              <li>Score: {summary.score}/100</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <button type="button" className="rounded-md bg-cyan-600 px-3 py-2 text-sm text-white" onClick={() => setSummary(null)}>
                Save Result
              </button>
              <button
                type="button"
                className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200"
                onClick={() => {
                  setSummary(null);
                  setRemainingSec(durationMin * 60);
                  onActiveChange(true);
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {open ? (
        <div className="fixed inset-0 z-[185] flex items-center justify-center bg-black/65 p-4" onClick={() => setOpen(false)}>
          <div className="w-[min(640px,calc(100vw-2rem))] rounded-xl border border-zinc-700 bg-zinc-900 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">System Design Interview Mode</h3>
              <button className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-zinc-300">Practice designing under time pressure, just like a real interview.</p>
            <div className="mt-3 flex gap-2">
              {[30, 45, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMin(m)}
                  className={`rounded-md px-3 py-1 text-xs ${durationMin === m ? 'bg-cyan-700 text-white' : 'bg-zinc-800 text-zinc-300'}`}
                >
                  {m} min
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-4 rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
              onClick={() => {
                setRemainingSec(durationMin * 60);
                onActiveChange(true);
                setOpen(false);
              }}
            >
              Start Interview
            </button>
            <div className="mt-4 rounded border border-zinc-700 bg-zinc-950/40 p-3">
              <p className="text-xs font-semibold text-zinc-200">History</p>
              {history.length === 0 ? <p className="mt-1 text-xs text-zinc-500">No sessions yet.</p> : null}
              {history.slice(0, 5).map((h) => (
                <p key={`${h.date}-${h.score}`} className="mt-1 text-xs text-zinc-400">
                  {new Date(h.date).toLocaleDateString()} • {h.duration}m • {h.grade} ({h.score}) • {h.componentCount} components
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

