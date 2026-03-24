export type ThemeName = 'dark' | 'light';

export type ThemeTokens = {
  bg: string;
  surface: string;
  surfaceHover: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  canvasBg: string;
  canvasDots: string;
  nodeBg: string;
  nodeBorder: string;
  panelBg: string;
  headerBg: string;
};

export const themes: Record<ThemeName, ThemeTokens> = {
  dark: {
    bg: '#0f1117',
    surface: '#1a1b23',
    surfaceHover: '#252630',
    border: '#2e2f3a',
    text: '#e2e8f0',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    accent: '#3b82f6',
    canvasBg: '#0f1117',
    canvasDots: '#1e1f2a',
    nodeBg: '#1a1b23',
    nodeBorder: '#2e2f3a',
    panelBg: '#0f1117',
    headerBg: '#0f1117',
  },
  light: {
    bg: '#ffffff',
    surface: '#f8fafc',
    surfaceHover: '#f1f5f9',
    border: '#e2e8f0',
    text: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    accent: '#3b82f6',
    canvasBg: '#f8fafc',
    canvasDots: '#e2e8f0',
    nodeBg: '#ffffff',
    nodeBorder: '#e2e8f0',
    panelBg: '#ffffff',
    headerBg: '#ffffff',
  },
};
