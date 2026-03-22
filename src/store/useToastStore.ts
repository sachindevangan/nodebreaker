import { create } from 'zustand';

export type ToastKind = 'success' | 'warning' | 'info' | 'error' | 'orange';

export interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (item: { kind: ToastKind; message: string }) => void;
  dismiss: (id: string) => void;
}

let toastSeq = 0;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  push: (item) => {
    const id = `toast-${++toastSeq}`;
    const next: ToastItem = { id, kind: item.kind, message: item.message };
    set({ toasts: [...get().toasts, next] });
    window.setTimeout(() => {
      get().dismiss(id);
    }, 3000);
  },

  dismiss: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));
