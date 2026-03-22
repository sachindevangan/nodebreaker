import { createContext, useContext } from 'react';

export type AppChromeContextValue = {
  openTemplates: () => void;
  requestImport: () => void;
};

export const AppChromeContext = createContext<AppChromeContextValue | null>(null);

export function useAppChrome(): AppChromeContextValue | null {
  return useContext(AppChromeContext);
}
