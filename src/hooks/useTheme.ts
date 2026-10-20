import { useState, useEffect, useLayoutEffect, useCallback, createContext, useContext } from 'react';
import { flushSync } from 'react-dom';
import { getAQIColor, getAQIColorLight } from '../utils/formatters';

export type Theme = 'dark' | 'light';

export const ThemeContext = createContext<Theme>('light');

/** AQI category colour with enough contrast for the active theme. */
export function useAqiColor(): (aqi: number | null | undefined) => string {
  return useContext(ThemeContext) === 'dark' ? getAQIColorLight : getAQIColor;
}

const STORAGE_KEY = 'urbanbreathe_theme';

function readStored(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null; // storage blocked (private mode, policies)
  }
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = readStored();
  if (stored) return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [chosen, setThemeState] = useState<Theme>(getInitialTheme);
  // Paper is white: print with the light palette whatever the screen theme is.
  const [printing, setPrinting] = useState(false);
  const theme: Theme = printing ? 'light' : chosen;

  useEffect(() => {
    const before = () => flushSync(() => setPrinting(true));
    const after = () => setPrinting(false);
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);

  // Layout effect: applied in the same commit, before the print layout runs.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light');
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* not persisted */ }
      return next;
    });
  }, []);

  return { theme, toggleTheme, isDark: theme === 'dark' };
}
