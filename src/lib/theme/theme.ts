import { readPreference, writePreference } from '../storage';

// The inline script in BaseLayout.astro mirrors this logic, because it must run before first paint.
export const THEME_STORAGE_KEY = 'da:theme';
export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export const themes = ['light', 'dark'] as const;
export type Theme = (typeof themes)[number];

export function isTheme(value: unknown): value is Theme {
  return themes.includes(value as Theme);
}

export function readStoredTheme(): Theme | null {
  const stored = readPreference(THEME_STORAGE_KEY);
  return isTheme(stored) ? stored : null;
}

export function getSystemTheme(): Theme {
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light';
}

export function getPreferredTheme(): Theme {
  return readStoredTheme() ?? getSystemTheme();
}

// Reads what is on screen, so toggling still works when storage is blocked and nothing was saved.
export function readAppliedTheme(): Theme {
  const applied = document.documentElement.dataset.theme;
  return isTheme(applied) ? applied : getSystemTheme();
}

export function getNextTheme(): Theme {
  return getOppositeTheme(readAppliedTheme());
}

export function getOppositeTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

export function saveTheme(theme: Theme): void {
  writePreference(THEME_STORAGE_KEY, theme);
}
