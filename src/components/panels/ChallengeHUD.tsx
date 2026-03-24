import { CheckCircle2, Circle, Lightbulb, Minimize2, Trophy, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useChallengeStore } from '@/store/useChallengeStore';
import { useFlowStore } from '@/store/useFlowStore';

function isStaticReq(checkType: string): boolean {
  return (
    checkType === 'has_component' ||
    checkType === 'has_redundancy' ||
    checkType === 'no_single_point_of_failure' ||
    checkType === 'max_component_count'
  );
}

function evaluateStatic(check: { type: string; [k: string]: unknown }, nodes: ReturnType<typeof useFlowStore.getState>['nodes'], edges: ReturnType<typeof useFlowStore.getState>['edges']): boolean {
  switch (check.type) {
    case 'has_component': {
      const minCount = typeof check.minCount === 'number' ? check.minCount : 1;
      return nodes.filter((node) => node.type === check.componentType).length >= minCount;
    }
    case 'has_redundancy':
      return nodes.filter((node) => node.type === check.componentType).length >= 2;
    case 'max_component_count':
      return nodes.length <= Number(check.value);
    case 'no_single_point_of_failure': {
      const incoming = new Map<string, number>();
      const outgoing = new Map<string, number>();
      for (const edge of edges) {
        incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
        outgoing.set(edge.source, (outgoing.get(edge.source) ?? 0) + 1);
      }
      return nodes.every((node) => {
        const inCount = incoming.get(node.id) ?? 0;
        const outCount = outgoing.get(node.id) ?? 0;
        const sameTypeCount = nodes.filter((candidate) => candidate.type === node.type).length;
        return !(inCount > 0 && outCount > 0 && sameTypeCount < 2);
      });
    }
    default:
      return false;
  }
}

export function ChallengeHUD() {
  const activeChallenge = useChallengeStore((s) => s.activeChallenge);
  const requirementStatuses = useChallengeStore((s) => s.requirementStatuses);
  const hintsRevealed = useChallengeStore((s) => s.hintsRevealed);
  const revealedHintMessages = useChallengeStore((s) => s.revealedHintMessages);
  const startTime = useChallengeStore((s) => s.startTime);
  const submitDesign = useChallengeStore((s) => s.submitDesign);
  const revealHint = useChallengeStore((s) => s.revealHint);
  const exitChallenge = useChallengeStore((s) => s.exitChallenge);
  const updateRequirementStatus = useChallengeStore((s) => s.updateRequirementStatus);
  const isEvaluating = useChallengeStore((s) => s.isEvaluating);
  const isHudMinimized = useChallengeStore((s) => s.isHudMinimized);
  const toggleHudMinimize = useChallengeStore((s) => s.toggleHudMinimize);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!activeChallenge) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [activeChallenge]);

  useEffect(() => {
    if (!activeChallenge) return;
    const id = window.setInterval(() => {
      const { nodes, edges } = useFlowStore.getState();
      for (const req of activeChallenge.requirements) {
        if (!isStaticReq(req.check.type)) continue;
        const passed = evaluateStatic(req.check as unknown as { type: string; [k: string]: unknown }, nodes, edges);
        updateRequirementStatus(req.id, passed);
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [activeChallenge, updateRequirementStatus]);

  const elapsedText = useMemo(() => {
    if (!startTime) return '0:00';
    const elapsed = Math.max(0, Math.floor((now - startTime) / 1000));
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    return `${min}:${String(sec).padStart(2, '0')}`;
  }, [now, startTime]);
  const liveScore = useMemo(() => {
    if (!activeChallenge) return 0;
    let score = 0;
    for (const req of activeChallenge.requirements) {
      if (!isStaticReq(req.check.type)) continue;
      if (requirementStatuses.get(req.id)) score += req.weight;
    }
    return Math.max(0, score - hintsRevealed * 5);
  }, [activeChallenge, hintsRevealed, requirementStatuses]);

  if (!activeChallenge) return null;

  return (
    <div className="pointer-events-none absolute right-3 top-14 z-[36] w-[420px] max-w-[calc(100vw-1.5rem)]">
      <section className="pointer-events-auto rounded-xl border border-zinc-700 bg-zinc-900/95 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
          <div>
            <p className="text-sm font-semibold text-zinc-100">{activeChallenge.title}</p>
            <p className="text-[11px] text-zinc-500">{elapsedText}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-300">
              <Trophy className="h-3.5 w-3.5 text-amber-300" strokeWidth={2} />
              {liveScore} / {activeChallenge.totalPoints}
            </span>
            <button type="button" onClick={toggleHudMinimize} className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300" aria-label="Minimize challenge HUD">
              <Minimize2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {isHudMinimized ? null : (
          <div className="max-h-[420px] overflow-y-auto p-3">
            <div className="space-y-2">
              {activeChallenge.requirements.map((req) => {
                const status = requirementStatuses.get(req.id);
                const icon =
                  status === true ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" strokeWidth={2} />
                  ) : status === false && isStaticReq(req.check.type) ? (
                    <XCircle className="h-4 w-4 text-red-400" strokeWidth={2} />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-500" strokeWidth={2} />
                  );
                const earned = status ? req.weight : 0;
                return (
                  <div key={req.id} className="rounded border border-zinc-800 bg-zinc-950/70 px-2.5 py-2">
                    <p className="flex items-start justify-between gap-2 text-xs text-zinc-200">
                      <span className="inline-flex items-start gap-1.5">
                        {icon}
                        {req.description}
                      </span>
                      <span className="shrink-0 font-mono text-zinc-400">{earned}/{req.weight}</span>
                    </p>
                  </div>
                );
              })}
            </div>

            {revealedHintMessages.length > 0 ? (
              <div className="mt-3 rounded border border-amber-800/60 bg-amber-950/30 p-2">
                {revealedHintMessages.map((hint, idx) => (
                  <p key={hint} className="text-xs text-amber-100/90">
                    Hint {idx + 1}: {hint}
                  </p>
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={revealHint}
                className="inline-flex items-center gap-1 rounded-md border border-amber-800/60 bg-amber-950/30 px-2.5 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-950/50"
              >
                <Lightbulb className="h-3.5 w-3.5" strokeWidth={2} />
                Hint (-5)
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                void submitDesign();
              }}
              className="mt-3 w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-zinc-700"
              disabled={isEvaluating}
            >
              {isEvaluating ? 'Evaluating your design...' : 'Submit Design'}
            </button>
            <button
              type="button"
              onClick={exitChallenge}
              className="mt-2 text-[11px] text-zinc-500 underline decoration-zinc-700 underline-offset-2 hover:text-zinc-300"
            >
              Give Up
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
