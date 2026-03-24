import { BookOpen, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { GLOSSARY_TERMS } from '@/constants/glossary';
import { useKnowledgeStore } from '@/store/useKnowledgeStore';

export function GlossaryModal() {
  const glossaryOpen = useKnowledgeStore((s) => s.glossaryOpen);
  const closeGlossary = useKnowledgeStore((s) => s.closeGlossary);
  const openKnowledge = useKnowledgeStore((s) => s.openKnowledge);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = q
      ? GLOSSARY_TERMS.filter((t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q))
      : GLOSSARY_TERMS;
    return [...items].sort((a, b) => a.term.localeCompare(b.term));
  }, [query]);

  if (!glossaryOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={closeGlossary}>
      <div className="mx-auto flex h-full max-w-5xl flex-col rounded-xl border border-zinc-700 bg-zinc-950 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-zinc-100">System Design Glossary</h2>
          </div>
          <button type="button" onClick={closeGlossary} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" aria-label="Close glossary">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="border-b border-zinc-800 px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search terms..." className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3">
            {filtered.map((term) => (
              <article key={term.term} className="rounded-lg border border-zinc-800 bg-zinc-900/40">
                <button type="button" onClick={() => setExpanded((prev) => (prev === term.term ? null : term.term))} className="w-full px-4 py-3 text-left">
                  <h3 className="text-base font-semibold text-zinc-100">{term.term}</h3>
                  <p className="mt-0.5 text-sm text-zinc-400">{term.definition}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {term.relatedTerms.map((related) => (
                      <button key={related} type="button" onClick={(e) => { e.stopPropagation(); openKnowledge({ kind: 'term', term: related }); }} className="rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-300 hover:border-cyan-500/50 hover:text-cyan-200">
                        {related}
                      </button>
                    ))}
                  </div>
                </button>
                {expanded === term.term ? (
                  <div className="border-t border-zinc-800 px-4 py-3 text-sm text-zinc-200">
                    <p className="whitespace-pre-line leading-relaxed">{term.explanation}</p>
                    <p className="mt-2 text-xs text-zinc-400">Example: {term.example}</p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
