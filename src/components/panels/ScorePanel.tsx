import { Award, CheckCircle2, Lightbulb, RotateCcw, X, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { scoreArchitecture, type ArchitectureScore } from '@/simulation/scorer';
import { useFlowStore } from '@/store/useFlowStore';
import { useSimStore } from '@/store/useSimStore';

function gradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-emerald-300';
  if (grade.startsWith('B')) return 'text-sky-300';
  if (grade.startsWith('C')) return 'text-amber-300';
  return 'text-red-300';
}

export function ScorePanel() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const nodeMetrics = useSimStore((s) => s.nodeMetrics);
  const [open, setOpen] = useState(false);
  const [nonce, setNonce] = useState(0);

  const score = useMemo<ArchitectureScore>(() => scoreArchitecture(nodes, edges, nodeMetrics), [nodes, edges, nodeMetrics, nonce]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700/80 hover:bg-zinc-800/60 hover:text-zinc-100"
        title="Architecture score"
      >
        <Award className="h-4 w-4" />
        <span>Score</span>
      </button>
      {open ? (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/60 p-4">
          <div className="w-[min(760px,calc(100vw-2rem))] rounded-xl border border-zinc-700 bg-zinc-900 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">Architecture Grade</h3>
              <button type="button" className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <p className={`text-5xl font-bold ${gradeColor(score.overall)}`}>{score.overall}</p>
              <p className="text-sm text-zinc-300">{score.overallScore}/100</p>
            </div>
            <div className="mt-4 space-y-2">
              {Object.entries(score.categories).map(([name, cat]) => (
                <div key={name} className="rounded border border-zinc-800 bg-zinc-950/50 p-2">
                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <span className="capitalize">{name}</span>
                    <span>
                      {cat.score}% ({cat.grade})
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded bg-zinc-800">
                    <div className="h-full rounded bg-cyan-500" style={{ width: `${cat.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold text-emerald-300">Strengths</p>
                {score.strengths.map((s) => (
                  <p key={s} className="mt-1 inline-flex gap-1 text-xs text-zinc-300">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" /> {s}
                  </p>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-red-300">Weaknesses</p>
                {score.weaknesses.map((w) => (
                  <p key={w} className="mt-1 inline-flex gap-1 text-xs text-zinc-300">
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" /> {w}
                  </p>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-300">Suggestions</p>
                {score.suggestions.map((s) => (
                  <p key={s} className="mt-1 inline-flex gap-1 text-xs text-zinc-300">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" /> {s}
                  </p>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNonce((v) => v + 1)}
              className="mt-4 inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Re-score
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

