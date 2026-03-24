import {
  AlertTriangle,
  GraduationCap,
  Hash,
  Lightbulb,
} from 'lucide-react';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type CalloutKind = 'analogy' | 'important' | 'interview' | 'numbers';

type Block =
  | { kind: 'md'; text: string }
  | { kind: 'callout'; variant: CalloutKind; body: string };

function parseBlocks(raw: string): Block[] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  const flushMd = (buf: string[]) => {
    const t = buf.join('\n').trim();
    if (t) blocks.push({ kind: 'md', text: t });
    buf.length = 0;
  };

  const mdBuf: string[] = [];

  const mapPrefix = (p: string): CalloutKind | null => {
    if (p === 'ANALOGY') return 'analogy';
    if (p === 'IMPORTANT') return 'important';
    if (p === 'INTERVIEW TIP') return 'interview';
    if (p === 'NUMBERS') return 'numbers';
    return null;
  };

  while (i < lines.length) {
    const line = lines[i] ?? '';
    const m = line.match(/^> (ANALOGY|IMPORTANT|INTERVIEW TIP|NUMBERS):\s*(.*)$/);
    if (m) {
      flushMd(mdBuf);
      const variant = mapPrefix(m[1] ?? '');
      let body = (m[2] ?? '').trimEnd();
      i += 1;
      while (i < lines.length) {
        const next = lines[i] ?? '';
        if (next === '' || /^> (ANALOGY|IMPORTANT|INTERVIEW TIP|NUMBERS):/.test(next)) break;
        body = body ? `${body}\n${next}` : next;
        i += 1;
      }
      if (variant && body.trim()) {
        blocks.push({ kind: 'callout', variant, body: body.trim() });
      }
      continue;
    }
    mdBuf.push(line);
    i += 1;
  }
  flushMd(mdBuf);
  return blocks;
}

function CalloutBox({ variant, body }: { variant: CalloutKind; body: string }) {
  const styles: Record<CalloutKind, { border: string; icon: ReactNode }> = {
    analogy: {
      border: 'border-l-amber-500',
      icon: <Lightbulb className="h-4 w-4 shrink-0 text-amber-400" strokeWidth={2} aria-hidden />,
    },
    important: {
      border: 'border-l-red-500',
      icon: <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" strokeWidth={2} aria-hidden />,
    },
    interview: {
      border: 'border-l-blue-500',
      icon: <GraduationCap className="h-4 w-4 shrink-0 text-blue-400" strokeWidth={2} aria-hidden />,
    },
    numbers: {
      border: 'border-l-emerald-500',
      icon: <Hash className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={2} aria-hidden />,
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
    <aside
      className={`my-4 flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 ${s.border} border-l-4`}
    >
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

export function ReadContent({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-4 text-[var(--text)]">
      {blocks.map((b, idx) => {
        if (b.kind === 'callout') {
          return <CalloutBox key={`c-${idx}`} variant={b.variant} body={b.body} />;
        }
        return (
          <div
            key={`m-${idx}`}
            className="prose prose-invert max-w-none text-base leading-relaxed text-[var(--text)] prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-3 prose-li:my-1 prose-code:rounded prose-code:bg-[var(--surface-hover)] prose-code:px-1 prose-code:py-0.5 prose-pre:bg-[var(--surface)] prose-pre:border prose-pre:border-[var(--border)] prose-table:text-sm"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h2 className="mt-8 text-xl font-semibold text-[var(--text)]">{children}</h2>,
                h2: ({ children }) => <h3 className="mt-6 text-lg font-semibold text-[var(--text)]">{children}</h3>,
              }}
            >
              {b.text}
            </ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
}
