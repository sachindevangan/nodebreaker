import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Link2, X } from 'lucide-react';

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  nodeCount: number;
  edgeCount: number;
  copied: boolean;
  onCopy: () => void;
};

export function ShareModal({ isOpen, onClose, url, nodeCount, edgeCount, copied, onCopy }: ShareModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text)]">
                <Link2 className="h-5 w-5 text-cyan-300" />
                Share Design
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">Anyone with this link can view your design.</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {nodeCount} nodes, {edgeCount} connections
            </p>

            <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
              <p className="truncate text-xs text-[var(--text-secondary)]">{url}</p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
