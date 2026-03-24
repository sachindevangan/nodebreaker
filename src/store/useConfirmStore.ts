import { create } from 'zustand';

type ConfirmPayload = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

interface ConfirmStore extends ConfirmPayload {
  isOpen: boolean;
  open: (payload: ConfirmPayload) => void;
  close: () => void;
  confirm: () => void;
  cancel: () => void;
}

const initialState: Omit<ConfirmStore, 'open' | 'close' | 'confirm' | 'cancel'> = {
  isOpen: false,
  title: '',
  message: '',
  confirmLabel: 'Continue',
  cancelLabel: 'Cancel',
  onConfirm: undefined,
  onCancel: undefined,
};

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  ...initialState,
  open: (payload) => {
    set({
      isOpen: true,
      title: payload.title,
      message: payload.message,
      confirmLabel: payload.confirmLabel ?? 'Continue',
      cancelLabel: payload.cancelLabel ?? 'Cancel',
      onConfirm: payload.onConfirm,
      onCancel: payload.onCancel,
    });
  },
  close: () => set({ ...initialState }),
  confirm: () => {
    const cb = get().onConfirm;
    get().close();
    cb?.();
  },
  cancel: () => {
    const cb = get().onCancel;
    get().close();
    cb?.();
  },
}));

