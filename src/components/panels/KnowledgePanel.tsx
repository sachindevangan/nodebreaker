import { X } from 'lucide-react';
import { useEffect } from 'react';
import { getComponentConfig } from '@/constants/components';
import { GLOSSARY_BY_TERM } from '@/constants/glossary';
import { getComponentKnowledge } from '@/constants/knowledge';
import { getNodeIcon } from '@/components/canvas/nodes';
import { useKnowledgeStore } from '@/store/useKnowledgeStore';

export function KnowledgePanel() {
  const activeTarget = useKnowledgeStore((s) => s.activeTarget);
  const closeKnowledge = useKnowledgeStore((s) => s.closeKnowledge);
  const openKnowledge = useKnowledgeStore((s) => s.openKnowledge);

  useEffect(() => {
    if (!activeTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeKnowledge();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTarget, closeKnowledge]);

  if (!activeTarget) return null;

  if (activeTarget.kind === 'term') {
    const term = GLOSSARY_BY_TERM.get(activeTarget.term);
    if (!term) return null;
    return (
      <aside className="absolute right-0 top-0 z-[85] flex h-full w-[420px] flex-col border-l border-zinc-700 bg-zinc-950/95 shadow-2xl backdrop-blur-sm">
        <header className="flex items-start justify-between border-b border-zinc-800 px-4 py-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">{term.term}</h2>
            <p className="mt-1 text-xs text-zinc-400">{term.definition}</p>
          </div>
          <button type="button" onClick={closeKnowledge} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" aria-label="Close knowledge panel">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 text-sm text-zinc-200">
          <p className="whitespace-pre-line leading-relaxed">{term.explanation}</p>
          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
            <p className="text-xs uppercase tracking-wider text-zinc-500">Example</p>
            <p className="mt-1 text-sm text-zinc-200">{term.example}</p>
          </div>
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500">Related Terms</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {term.relatedTerms.map((t) => (
                <button key={t} type="button" onClick={() => openKnowledge({ kind: 'term', term: t })} className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:border-cyan-500/50 hover:text-cyan-200">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const knowledge = getComponentKnowledge(activeTarget.componentType);
  const cfg = getComponentConfig(activeTarget.componentType);
  if (!cfg) return null;
  const Icon = getNodeIcon(cfg.icon);

  return (
    <aside className="absolute right-0 top-0 z-[85] flex h-full w-[420px] flex-col border-l border-zinc-700 bg-zinc-950/95 shadow-2xl backdrop-blur-sm">
      <header className="flex items-start justify-between border-b border-zinc-800 px-4 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" style={{ color: cfg.color }} />
            <h2 className="truncate text-lg font-semibold text-zinc-100">{cfg.label}</h2>
          </div>
          <p className="mt-1 text-xs text-zinc-400">{knowledge.summary}</p>
        </div>
        <button type="button" onClick={closeKnowledge} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" aria-label="Close knowledge panel">
          <X className="h-4 w-4" />
        </button>
      </header>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 text-sm">
        <section>
          <h3 className="text-xs uppercase tracking-wider text-zinc-500">What it does</h3>
          <p className="mt-1 whitespace-pre-line leading-relaxed text-zinc-200">{knowledge.explanation}</p>
        </section>
        <section>
          <h3 className="text-xs uppercase tracking-wider text-zinc-500">Real World</h3>
          <p className="mt-1 text-zinc-200">{knowledge.realWorldExamples.join(', ')}</p>
        </section>
        <section>
          <h3 className="text-xs uppercase tracking-wider text-zinc-500">When to Use</h3>
          <ul className="mt-1 list-disc pl-4 text-zinc-200">{knowledge.whenToUse.map((s) => <li key={s}>{s}</li>)}</ul>
        </section>
        <section>
          <h3 className="text-xs uppercase tracking-wider text-zinc-500">When NOT to Use</h3>
          <ul className="mt-1 list-disc pl-4 text-zinc-200">{knowledge.whenNotToUse.map((s) => <li key={s}>{s}</li>)}</ul>
        </section>
        <section>
          <h3 className="text-xs uppercase tracking-wider text-zinc-500">Failure Modes</h3>
          <ul className="mt-1 list-disc pl-4 text-zinc-200">{knowledge.failureModes.map((s) => <li key={s}>{s}</li>)}</ul>
        </section>
        <section>
          <h3 className="text-xs uppercase tracking-wider text-zinc-500">Common Pairings</h3>
          <ul className="mt-1 list-disc pl-4 text-zinc-200">{knowledge.commonPairings.map((s) => <li key={s}>{s}</li>)}</ul>
        </section>
        <section>
          <h3 className="text-xs uppercase tracking-wider text-zinc-500">Realistic Numbers</h3>
          <div className="mt-1 space-y-2 text-zinc-200">
            <p><span className="font-semibold">Small:</span> {knowledge.realisticDefaults.small.throughput} req/s, {knowledge.realisticDefaults.small.latency} ms - {knowledge.realisticDefaults.small.description}</p>
            <p><span className="font-semibold">Medium:</span> {knowledge.realisticDefaults.medium.throughput} req/s, {knowledge.realisticDefaults.medium.latency} ms - {knowledge.realisticDefaults.medium.description}</p>
            <p><span className="font-semibold">Large:</span> {knowledge.realisticDefaults.large.throughput} req/s, {knowledge.realisticDefaults.large.latency} ms - {knowledge.realisticDefaults.large.description}</p>
          </div>
        </section>
        <section className="rounded-lg border border-cyan-700/40 bg-cyan-950/20 p-3">
          <h3 className="text-xs uppercase tracking-wider text-cyan-300">Interview Tip</h3>
          <p className="mt-1 text-sm text-cyan-100">{knowledge.interviewTip}</p>
        </section>
        <section>
          <h3 className="text-xs uppercase tracking-wider text-zinc-500">Related Concepts</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {knowledge.relatedConcepts.map((term) => (
              <button key={term} type="button" onClick={() => openKnowledge({ kind: 'term', term })} className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:border-cyan-500/50 hover:text-cyan-200">
                {term}
              </button>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
