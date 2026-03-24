import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface InfoTooltipProps {
  title: string;
  description: string;
  side?: 'left' | 'right';
}

export function InfoTooltip({ title, description, side = 'right' }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLButtonElement>(null);

  const show = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (side === 'right') {
      setPos({ x: rect.right + 8, y: rect.top + rect.height / 2 });
    } else {
      setPos({ x: rect.left - 8, y: rect.top + rect.height / 2 });
    }
    setVisible(true);
  };

  return (
    <>
      <button
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        className="ml-1 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-[var(--surface-hover)] text-xs text-[var(--text-secondary)] hover:brightness-110"
      >
        i
      </button>
      {visible && createPortal(
        <div
          style={{
            position: 'fixed',
            left: side === 'right' ? pos.x : undefined,
            right: side === 'left' ? window.innerWidth - pos.x : undefined,
            top: pos.y,
            transform: 'translateY(-50%)',
            zIndex: 99999,
            maxWidth: 300,
            pointerEvents: 'none',
          }}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] shadow-2xl"
        >
          <div className="mb-1 font-semibold text-[var(--text)]">{title}</div>
          <div>{description}</div>
        </div>,
        document.body
      )}
    </>
  );
}
