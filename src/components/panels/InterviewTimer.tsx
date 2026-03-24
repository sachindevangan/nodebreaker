import { GripVertical, Minus, Pause, Play, Square, Timer, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { scoreArchitecture } from '@/simulation/scorer';
import { useFlowStore } from '@/store/useFlowStore';
import { useSimStore } from '@/store/useSimStore';
import { useToastStore } from '@/store/useToastStore';

type SessionSummary = {
  date: string;
  duration: number;
  timeUsedSec: number;
  grade: string;
  score: number;
  componentCount: number;
  connectionCount: number;
  categories: {
    reliability: string;
    performance: string;
    scalability: string;
    costEfficiency: string;
  };
  strengths: string[];
  weaknesses: string[];
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

type InterviewPhase = {
  label: string;
  shortLabel: string;
  startMin: number;
  endMin: number;
};

const PHASES: InterviewPhase[] = [
  { label: 'Requirements & Estimation', shortLabel: 'Requirements', startMin: 0, endMin: 5 },
  { label: 'High-Level Design', shortLabel: 'High-Level', startMin: 5, endMin: 20 },
  { label: 'Deep Dive', shortLabel: 'Deep Dive', startMin: 20, endMin: 35 },
  { label: 'Bottlenecks & Trade-offs', shortLabel: 'Trade-offs', startMin: 35, endMin: 45 },
];

const DEFAULT_DURATION_MIN = 45;

function formatMmSs(totalSec: number): string {
  return `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, '0')}`;
}

export function InterviewTimer({ active, onActiveChange }: InterviewTimerProps) {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const nodeMetrics = useSimStore((s) => s.nodeMetrics);

  const [open, setOpen] = useState(false);
  const [durationMin, setDurationMin] = useState(DEFAULT_DURATION_MIN);
  const [remainingSec, setRemainingSec] = useState(DEFAULT_DURATION_MIN * 60);
  const [paused, setPaused] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [confirmStopOpen, setConfirmStopOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [history, setHistory] = useState<SessionSummary[]>(() => readHistory());
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  const pillRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const hasUserMovedRef = useRef(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const elapsedSec = durationMin * 60 - remainingSec;
  const pctRemaining = useMemo(() => remainingSec / Math.max(1, durationMin * 60), [remainingSec, durationMin]);
  const currentPhaseIndex = useMemo(() => {
    const elapsedMin = elapsedSec / 60;
    const hit = PHASES.findIndex((phase) => elapsedMin >= phase.startMin && elapsedMin < phase.endMin);
    return hit >= 0 ? hit : PHASES.length - 1;
  }, [elapsedSec]);
  const currentPhase: InterviewPhase = PHASES[currentPhaseIndex] ?? PHASES[0]!;
  const timeToneClass = pctRemaining > 0.5 ? 'text-[#22c55e]' : pctRemaining > 0.25 ? 'text-[#f59e0b]' : 'text-[#ef4444]';
  const pulseClass = remainingSec <= 5 * 60 ? 'animate-pulse' : '';

  const placeDefaultPosition = useCallback(() => {
    const targetWidth = pillRef.current?.offsetWidth ?? 280;
    const x = Math.max(8, Math.round(window.innerWidth / 2 - targetWidth / 2));
    setPosition({ x, y: 8 });
  }, []);

  const constrainPosition = useCallback((nextX: number, nextY: number) => {
    const rect = pillRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 280;
    const height = rect?.height ?? 36;
    return {
      x: Math.max(0, Math.min(nextX, window.innerWidth - width)),
      y: Math.max(0, Math.min(nextY, window.innerHeight - height)),
    };
  }, []);

  const finalizeInterview = useCallback(
    (timeUsedSec: number) => {
      const scored = scoreArchitecture(nodes, edges, nodeMetrics);
      const result: SessionSummary = {
        date: new Date().toISOString(),
        duration: durationMin,
        timeUsedSec,
        grade: scored.overall,
        score: scored.overallScore,
        componentCount: nodes.length,
        connectionCount: edges.length,
        categories: {
          reliability: scored.categories.reliability.grade,
          performance: scored.categories.performance.grade,
          scalability: scored.categories.scalability.grade,
          costEfficiency: scored.categories.costEfficiency.grade,
        },
        strengths: scored.strengths,
        weaknesses: scored.weaknesses,
      };
      const next = [result, ...history].slice(0, 20);
      setHistory(next);
      writeHistory(next);
      setSummary(result);
      setPaused(false);
      setMinimized(false);
      setHovered(false);
      onActiveChange(false);
    },
    [nodes, edges, nodeMetrics, durationMin, history, onActiveChange]
  );

  useEffect(() => {
    if (!active || paused || confirmStopOpen) return;
    const id = window.setInterval(() => {
      setRemainingSec((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [active, paused, confirmStopOpen]);

  useEffect(() => {
    if (!active || remainingSec > 0) return;
    finalizeInterview(durationMin * 60);
  }, [active, remainingSec, durationMin, finalizeInterview]);

  useEffect(() => {
    if (!active) return;
    if (!position || !hasUserMovedRef.current) {
      placeDefaultPosition();
    }
  }, [active, position, placeDefaultPosition]);

  useEffect(() => {
    if (!active) return;
    const onResize = () => {
      if (!position) return;
      const next = constrainPosition(position.x, position.y);
      setPosition(next);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active, constrainPosition, position]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'm') {
        e.preventDefault();
        setMinimized((v) => !v);
      } else if (key === 'p') {
        e.preventDefault();
        setPaused((v) => !v);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setPaused(true);
        setConfirmStopOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  const startDrag = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (!pillRef.current || !position) return;
    e.preventDefault();
    const rect = pillRef.current.getBoundingClientRect();
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!dragging) return;
    const onMouseMove = (e: MouseEvent) => {
      const next = constrainPosition(e.clientX - dragOffsetRef.current.x, e.clientY - dragOffsetRef.current.y);
      hasUserMovedRef.current = true;
      setPosition(next);
    };
    const onMouseUp = () => {
      setDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, constrainPosition]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  return (
    <>
      <ConfirmDialog
        isOpen={confirmStopOpen}
        title="End interview early?"
        message="Your progress will be scored."
        confirmLabel="End Interview"
        cancelLabel="Continue"
        onConfirm={() => {
          setConfirmStopOpen(false);
          finalizeInterview(durationMin * 60 - remainingSec);
        }}
        onCancel={() => {
          setConfirmStopOpen(false);
          setPaused(false);
        }}
      />
      <ConfirmDialog
        isOpen={confirmCloseOpen}
        title="Close timer?"
        message="The interview session will end without scoring."
        confirmLabel="Close Timer"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmCloseOpen(false);
          setPaused(false);
          setMinimized(false);
          setHovered(false);
          setSummary(null);
          setRemainingSec(durationMin * 60);
          onActiveChange(false);
          useToastStore.getState().push({ kind: 'info', message: 'Interview ended' });
        }}
        onCancel={() => {
          setConfirmCloseOpen(false);
        }}
      />
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

      {active && minimized ? (
        <div className="fixed right-4 top-4 z-[9999]">
          <button
            type="button"
            className={`group relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700/70 bg-zinc-900/80 backdrop-blur-sm transition-transform hover:scale-105 ${
              pctRemaining > 0.5 ? 'text-[#22c55e]' : pctRemaining > 0.25 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
            } ${pulseClass}`}
            style={{
              backgroundColor:
                pctRemaining > 0.5
                  ? 'rgba(34,197,94,0.15)'
                  : pctRemaining > 0.25
                    ? 'rgba(245,158,11,0.15)'
                    : 'rgba(239,68,68,0.18)',
            }}
            onClick={() => setMinimized(false)}
            title="Restore interview timer (M)"
            aria-label="Restore interview timer"
          >
            <span className="text-xs font-semibold">{formatMmSs(remainingSec)}</span>
            <span className="pointer-events-none absolute left-1/2 top-11 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-[11px] text-zinc-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Click to restore
            </span>
          </button>
        </div>
      ) : null}

      {active && !minimized && position ? (
        <div
          ref={pillRef}
          className="group fixed z-[9999]"
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="flex h-9 items-center gap-1 rounded-full border border-zinc-700/80 bg-gray-900/80 px-2 text-zinc-100 shadow-xl backdrop-blur-sm transition-[width,padding] duration-150">
            <button
              type="button"
              onMouseDown={startDrag}
              className={`rounded-full p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 ${hovered ? 'opacity-100' : 'pointer-events-none w-0 opacity-0'}`}
              aria-label="Drag interview timer"
              title="Drag timer"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              className={`rounded-full p-1 text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100 ${hovered ? 'opacity-100' : 'pointer-events-none w-0 opacity-0'}`}
              aria-label={paused ? 'Resume timer' : 'Pause timer'}
              title={paused ? 'Resume (P)' : 'Pause (P)'}
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>

            <div className="inline-flex items-center gap-1.5 px-1">
              <span className="text-zinc-300">⏱</span>
              <span className={`text-sm font-semibold tabular-nums ${timeToneClass} ${pulseClass}`}>
                {formatMmSs(remainingSec)}
              </span>
              <span className="text-zinc-500">|</span>
              <span className={`text-xs ${paused ? 'animate-pulse text-zinc-300' : 'text-zinc-400'}`}>
                {paused ? 'PAUSED' : currentPhase.shortLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMinimized(true)}
              className={`rounded-full p-1 text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100 ${hovered ? 'opacity-100' : 'pointer-events-none w-0 opacity-0'}`}
              aria-label="Minimize timer"
              title="Minimize (M)"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setPaused(true);
                setConfirmStopOpen(true);
              }}
              className={`rounded-full p-1 text-zinc-300 transition hover:bg-red-900/40 hover:text-red-200 ${hovered ? 'opacity-100' : 'pointer-events-none w-0 opacity-0'}`}
              aria-label="End interview"
              title="End interview (Esc)"
            >
              <Square className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmCloseOpen(true)}
              className={`rounded-full p-1 text-gray-400 transition hover:bg-zinc-800 hover:text-white ${hovered ? 'opacity-100' : 'pointer-events-none w-0 opacity-0'}`}
              aria-label="Close timer"
              title="Close timer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {hovered ? (
            <div className="absolute left-1/2 top-11 w-[290px] -translate-x-1/2 rounded-lg border border-zinc-700 bg-gray-800 p-3 text-xs shadow-xl">
              {PHASES.map((phase, idx) => {
                const complete = idx < currentPhaseIndex;
                const current = idx === currentPhaseIndex;
                return (
                  <div key={phase.label} className={`mt-1 first:mt-0 ${current ? 'font-semibold text-zinc-100' : complete ? 'text-[#22c55e]' : 'text-zinc-400'}`}>
                    <span className="mr-1">{complete ? '✓' : current ? '→' : '○'}</span>
                    <span>{phase.label}</span>
                    <span className="ml-1 text-zinc-500">
                      ({phase.startMin}-{phase.endMin} min)
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {summary ? (
        <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-[min(760px,calc(100vw-2rem))] rounded-xl border border-zinc-700 bg-zinc-900 p-6">
            <h3 className="text-3xl font-bold text-zinc-100">Time&apos;s Up!</h3>
            <p className="mt-2 text-sm text-zinc-300">Interview summary</p>
            <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-zinc-300 sm:grid-cols-2">
              <li>Time used: {formatMmSs(summary.timeUsedSec)}</li>
              <li>Components placed: {summary.componentCount}</li>
              <li>Connections made: {summary.connectionCount}</li>
              <li>
                Architecture Grade: <span className="font-semibold text-cyan-300">{summary.grade}</span> ({summary.score}/100)
              </li>
            </ul>
            <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-950/50 p-3 text-sm">
              <p className="mb-2 text-zinc-200">Category breakdown</p>
              <div className="grid grid-cols-2 gap-2 text-zinc-300 sm:grid-cols-4">
                <p>Reliability: {summary.categories.reliability}</p>
                <p>Performance: {summary.categories.performance}</p>
                <p>Scalability: {summary.categories.scalability}</p>
                <p>Cost: {summary.categories.costEfficiency}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3">
                <p className="text-sm font-semibold text-emerald-300">Strengths</p>
                <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                  {(summary.strengths.length > 0 ? summary.strengths : ['No key strengths detected']).slice(0, 4).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-3">
                <p className="text-sm font-semibold text-red-300">Weaknesses</p>
                <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                  {(summary.weaknesses.length > 0 ? summary.weaknesses : ['No critical weaknesses detected']).slice(0, 4).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" className="rounded-md border border-zinc-600 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-800" onClick={() => setSummary(null)}>
                Review Design
              </button>
              <button
                type="button"
                className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
                onClick={() => {
                  setSummary(null);
                  setRemainingSec(durationMin * 60);
                  setPaused(false);
                  setMinimized(false);
                  setHovered(false);
                  onActiveChange(true);
                }}
              >
                Try Again
              </button>
              <button
                type="button"
                className="rounded-md border border-red-900/50 bg-red-950/60 px-3 py-2 text-sm text-red-100 hover:bg-red-900/70"
                onClick={() => {
                  setSummary(null);
                  setPaused(false);
                  setMinimized(false);
                  setHovered(false);
                  setRemainingSec(durationMin * 60);
                  onActiveChange(false);
                }}
              >
                Exit Interview
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
              <button type="button" className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200" onClick={() => setOpen(false)}>
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
                setPaused(false);
                setMinimized(false);
                setHovered(false);
                onActiveChange(true);
                setOpen(false);
              }}
            >
              Start Interview
            </button>
            <div className="mt-3 rounded border border-zinc-700 bg-zinc-950/50 p-3 text-xs text-zinc-400">
              <p className="font-semibold text-zinc-200">Interview shortcuts</p>
              <p className="mt-1">P: Pause/Resume • M: Minimize/Restore • Esc: End interview</p>
            </div>
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

