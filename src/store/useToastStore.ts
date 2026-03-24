import { create } from 'zustand';
import type { NodeBreakerNodeType } from '@/types';

export type ToastKind = 'success' | 'warning' | 'info' | 'error' | 'orange';

export interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
  durationMs: number;
  learnMore?: { kind: 'component'; componentType: NodeBreakerNodeType } | { kind: 'term'; term: string };
}

interface ToastStore {
  toasts: ToastItem[];
  push: (item: {
    kind: ToastKind;
    message: string;
    durationMs?: number;
    learnMore?: { kind: 'component'; componentType: NodeBreakerNodeType } | { kind: 'term'; term: string };
  }) => void;
  dismiss: (id: string) => void;
}

let toastSeq = 0;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  push: (item) => {
    const id = `toast-${++toastSeq}`;
    const next: ToastItem = {
      id,
      kind: item.kind,
      message: item.message,
      durationMs: item.durationMs ?? 3000,
      learnMore: item.learnMore,
    };
    set({ toasts: [...get().toasts, next] });
    window.setTimeout(() => {
      get().dismiss(id);
    }, next.durationMs);
  },

  dismiss: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));
