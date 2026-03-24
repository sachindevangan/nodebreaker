import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeName } from '@/constants/themes';

type ThemeStore = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
};

function applyTheme(theme: ThemeName): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () =>
        set((state) => {
          const theme: ThemeName = state.theme === 'dark' ? 'light' : 'dark';
          applyTheme(theme);
          return { theme };
        }),
    }),
    {
      name: 'nb-theme',
      onRehydrateStorage: () => (state) => {
        applyTheme(state?.theme ?? 'dark');
      },
    }
  )
);
