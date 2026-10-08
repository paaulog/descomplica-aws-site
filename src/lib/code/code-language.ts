import { readPreference, writePreference } from '../storage';

export const CODE_LANGUAGE_STORAGE_KEY = 'da:code-lang';

export const codeLanguages = ['js', 'python'] as const;
export type CodeLanguage = (typeof codeLanguages)[number];

export const codeLanguageLabels: Record<CodeLanguage, string> = {
  js: 'JavaScript',
  python: 'Python',
};

export function isCodeLanguage(value: unknown): value is CodeLanguage {
  return codeLanguages.includes(value as CodeLanguage);
}

export function readStoredCodeLanguage(): CodeLanguage | null {
  const stored = readPreference(CODE_LANGUAGE_STORAGE_KEY);
  return isCodeLanguage(stored) ? stored : null;
}

export function saveCodeLanguage(language: CodeLanguage): void {
  writePreference(CODE_LANGUAGE_STORAGE_KEY, language);
}
