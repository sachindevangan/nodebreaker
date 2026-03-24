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
        className="inline-flex items-center justify-center w-4 h-4 
          rounded-full bg-gray-700 hover:bg-gray-600 text-gray-400 
          text-xs ml-1 cursor-help"
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
          className="bg-gray-800 rounded-lg p-3 shadow-2xl border 
            border-gray-700 text-sm text-gray-200"
        >
          <div className="font-semibold text-white mb-1">{title}</div>
          <div>{description}</div>
        </div>,
        document.body
      )}
    </>
  );
}
