import { useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';

export function CodeBlock({
  code,
  highlightLines,
  copyLabel = 'Copy Code',
}: {
  code: string;
  highlightLines?: number[];
  copyLabel?: string;
}) {
  const toast = useToastStore((s) => s.push);
  const [copying, setCopying] = useState(false);

  const lines = useMemo(() => code.replace(/\r\n/g, '\n').split('\n'), [code]);
  const highlightSet = useMemo(() => new Set((highlightLines ?? []).filter((n) => n > 0)), [highlightLines]);

  const onCopy = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(code);
      toast({ kind: 'success', message: 'Copied to clipboard' });
    } catch {
      toast({ kind: 'error', message: 'Could not copy to clipboard' });
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-gray-950">
      <div className="flex items-center justify-end gap-2 border-b border-[var(--border)]/60 px-3 py-2">
        <button
          type="button"
          onClick={onCopy}
          disabled={copying}
          className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-1 text-xs font-semibold text-gray-200 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Copy className="h-3.5 w-3.5" strokeWidth={2} />
          {copyLabel}
        </button>
      </div>
      <pre className="max-h-[60vh] overflow-auto p-3 text-sm text-gray-200">
        <code>
          {lines.map((line, idx) => {
            const lineNo = idx + 1;
            const hl = highlightSet.has(lineNo);
            return (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                className={`block whitespace-pre ${hl ? 'bg-blue-900/20' : ''}`}
              >
                {line || ' '}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

