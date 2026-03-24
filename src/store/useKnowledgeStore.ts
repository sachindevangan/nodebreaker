import { create } from 'zustand';
import type { NodeBreakerNodeType } from '@/types';

export type KnowledgeTarget =
  | { kind: 'component'; componentType: NodeBreakerNodeType }
  | { kind: 'term'; term: string };

interface KnowledgeStore {
  activeTarget: KnowledgeTarget | null;
  glossaryOpen: boolean;
  openKnowledge: (target: KnowledgeTarget) => void;
  closeKnowledge: () => void;
  openGlossary: () => void;
  closeGlossary: () => void;
}

export const useKnowledgeStore = create<KnowledgeStore>((set) => ({
  activeTarget: null,
  glossaryOpen: false,
  openKnowledge: (target) => set({ activeTarget: target }),
  closeKnowledge: () => set({ activeTarget: null }),
  openGlossary: () => set({ glossaryOpen: true }),
  closeGlossary: () => set({ glossaryOpen: false }),
}));
