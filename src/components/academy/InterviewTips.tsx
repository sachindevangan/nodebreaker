import { Lock, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CURRICULUM, type Chapter } from '@/constants/curriculum';
import { useAcademyStore } from '@/store/useAcademyStore';

interface InterviewTipsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InterviewTips({ isOpen, onClose }: InterviewTipsProps) {
  const collected = useAcademyStore((s) => s.collectedInterviewTips);
  const [query, setQuery] = useState('');
  const [chapterFilter, setChapterFilter] = useState<string>('all');

  const tips = useMemo(() => {
    const rows: { chapter: Chapter; topicId: string; title: string; tip: string }[] = [];
    for (const ch of CURRICULUM) {
      for (const t of ch.topics) {
        if (t.interviewTip) {
          rows.push({ chapter: ch, topicId: t.id, title: t.title, tip: t.interviewTip });
        }
      }
    }
    return rows;
  }, []);

  const totalTips = tips.length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tips.filter((row) => {
      if (chapterFilter !== 'all' && row.chapter.id !== chapterFilter) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.tip.toLowerCase().includes(q) ||
        row.chapter.title.toLowerCase().includes(q)
      );
    });
  }, [tips, query, chapterFilter]);

  const collectedCount = collected.length;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[155] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interview-tips-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2 id="interview-tips-title" className="text-lg font-semibold text-[var(--text)]">
              Interview tips
            </h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {collectedCount} of {totalTips} tips collected
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-[var(--border)] px-5 py-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tips…"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] py-2 pl-8 pr-3 text-sm text-[var(--text)] placeholder:text-[var(--text-secondary)]"
            />
          </div>
          <select
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]"
          >
            <option value="all">All chapters</option>
            {CURRICULUM.map((ch) => (
              <option key={ch.id} value={ch.id}>
                Chapter {ch.number}: {ch.title}
              </option>
            ))}
          </select>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <ul className="grid gap-3 sm:grid-cols-1">
            {filtered.map((row) => {
              const unlocked = collected.includes(row.topicId);
              return (
                <li
                  key={row.topicId}
                  className={`rounded-lg border border-[var(--border)] p-4 ${
                    unlocked ? 'bg-[var(--bg)]' : 'bg-[var(--surface-hover)] opacity-70'
                  }`}
                >
                  <p className="text-xs font-medium text-[var(--text-secondary)]">
                    {row.chapter.title}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text)]">{row.title}</p>
                  {unlocked ? (
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{row.tip}</p>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <Lock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                      <span>Complete {row.title} to unlock</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--text-secondary)]">No tips match your filters.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
