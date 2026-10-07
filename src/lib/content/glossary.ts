import type { Locale } from '../i18n/ui';
import type { GlossaryData } from './schemas';

export type GlossaryEntry = GlossaryData[string];

export class GlossaryTermError extends Error {
  constructor(id: string, locale: Locale) {
    super(
      `<Term id="${id}">: o termo não existe no glossário ${locale} (src/content/glossary/${locale}.yaml)`,
    );
    this.name = 'GlossaryTermError';
  }
}

export function findGlossaryEntry(
  glossary: GlossaryData,
  id: string,
  locale: Locale,
): GlossaryEntry {
  const entry = Object.hasOwn(glossary, id) ? glossary[id] : undefined;
  if (entry === undefined) throw new GlossaryTermError(id, locale);
  return entry;
}

const TERM_ID_PATTERN = /<Term\s+id="([^"]+)"/g;

export function findTermIds(mdxSource: string): string[] {
  return [...mdxSource.matchAll(TERM_ID_PATTERN)].map(([, id = '']) => id);
}

export interface GlossaryUsage {
  missing: string[];
  unused: string[];
}

export function checkGlossaryUsage(
  glossary: GlossaryData,
  usedIds: readonly string[],
): GlossaryUsage {
  const used = new Set(usedIds);
  return {
    missing: [...used].filter((id) => !Object.hasOwn(glossary, id)),
    unused: Object.keys(glossary).filter((id) => !used.has(id)),
  };
}
