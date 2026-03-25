import { useEffect, useMemo, useRef } from 'react';
import mermaid from 'mermaid';

export function DiagramBlock({
  title,
  diagramId,
  mermaidCode,
}: {
  title: string;
  diagramId: string;
  mermaidCode: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const stableId = useMemo(() => `nb-mermaid-${diagramId}`, [diagramId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!mermaidCode.trim()) {
      el.innerHTML = '';
      return;
    }

    let cancelled = false;
    try {
      mermaid.initialize({ startOnLoad: false, theme: 'dark' });
      const rendered = mermaid.render(stableId, mermaidCode);
      if (!cancelled) el.innerHTML = rendered.svg;
    } catch {
      if (!cancelled) el.innerText = 'Unable to render diagram.';
    }

    return () => {
      cancelled = true;
    };
  }, [mermaidCode, stableId]);

  return (
    <section className="my-5 max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text)]">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{title}</p>
      <div ref={containerRef} className="flex justify-center" />
    </section>
  );
}

