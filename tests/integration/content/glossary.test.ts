import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { getActiveServices } from '@/data/services';
import { checkGlossaryUsage, findTermIds } from '@/lib/content/glossary';
import {
  DEFINITION_MAX,
  glossarySchema,
  MAX_SECTION_ORDER,
  NAV_LABEL_MAX,
} from '@/lib/content/schemas';
import { locales, type Locale } from '@/lib/i18n/ui';
import { loadSections } from './load-sections';

const contentDir = fileURLToPath(new URL('../../../src/content', import.meta.url));
const sectionsDir = join(contentDir, 'sections');

function readGlossary(locale: Locale) {
  const source = readFileSync(join(contentDir, 'glossary', `${locale}.yaml`), 'utf8');
  return glossarySchema.parse(parse(source));
}

function readTermIds(locale: Locale): string[] {
  return getActiveServices().flatMap((service) => {
    const folder = join(sectionsDir, service.id, locale);
    return readdirSync(folder)
      .filter((file) => file.endsWith('.mdx'))
      .flatMap((file) => findTermIds(readFileSync(join(folder, file), 'utf8')));
  });
}

describe.each(locales)('glossário e seções (%s)', (locale) => {
  it('todo <Term id> existe no glossário do idioma', () => {
    expect(checkGlossaryUsage(readGlossary(locale), readTermIds(locale)).missing).toEqual([]);
  });

  it('avisa sobre termos do glossário que nenhuma seção usa', () => {
    const { unused } = checkGlossaryUsage(readGlossary(locale), readTermIds(locale));
    // Only a warning: a term may be kept ready for a section still being written.
    if (unused.length > 0) console.warn(`glossário ${locale} sem uso: ${unused.join(', ')}`);
  });

  it('mantém cada definition dentro do limite', () => {
    for (const [key, entry] of Object.entries(readGlossary(locale))) {
      expect(entry.definition.length, key).toBeLessThanOrEqual(DEFINITION_MAX);
    }
  });

  it('tem as 18 seções do S3, com order de 1 a 18 e navLabel curto', () => {
    const sections = loadSections(sectionsDir).filter(({ id }) => id.startsWith(`s3/${locale}/`));
    const orders = sections.map(({ data }) => data.order).toSorted((a, b) => a - b);
    expect(orders).toEqual(Array.from({ length: MAX_SECTION_ORDER }, (_, index) => index + 1));
    for (const { id, data } of sections) {
      expect(data.navLabel.length, id).toBeLessThanOrEqual(NAV_LABEL_MAX);
    }
  });
});

describe('glossário entre idiomas', () => {
  it('tem as mesmas keys nos dois idiomas', () => {
    const [reference, ...others] = locales;
    const referenceKeys = Object.keys(readGlossary(reference)).toSorted();
    for (const locale of others) {
      expect(Object.keys(readGlossary(locale)).toSorted(), locale).toEqual(referenceKeys);
    }
  });
});
