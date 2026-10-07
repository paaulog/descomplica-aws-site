import type { ServiceId } from '../../data/services';
import { isLocale, locales, type Locale } from '../i18n/ui';
import type { SectionData } from './schemas';

export interface SectionLike {
  id: string;
  data: SectionData;
}

type SectionsByLocale = Map<Locale, SectionLike[]>;

const UNIQUE_FIELDS = ['key', 'order', 'anchor'] as const;

export function parseSectionId(id: string): { service: string; locale: string } {
  const [service = '', locale = ''] = id.split('/');
  return { service, locale };
}

export function selectServiceSections<T extends SectionLike>(
  entries: readonly T[],
  service: ServiceId,
  locale: Locale,
): T[] {
  return entries
    .filter(({ id }) => {
      const folder = parseSectionId(id);
      return folder.service === service && folder.locale === locale;
    })
    .toSorted((first, second) => first.data.order - second.data.order);
}

function findRepeatedValues(values: readonly (string | number)[]): (string | number)[] {
  const seen = new Set<string | number>();
  const repeated = new Set<string | number>();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

function groupSectionsByLocale(
  service: ServiceId,
  entries: readonly SectionLike[],
): { sectionsByLocale: SectionsByLocale; folderIssues: string[] } {
  const sectionsByLocale: SectionsByLocale = new Map(locales.map((locale) => [locale, []]));
  const folderIssues: string[] = [];
  // Entries claiming this service from another folder (e.g. `S3/`) are kept so they get reported.
  const ownEntries = entries.filter(
    (entry) => parseSectionId(entry.id).service === service || entry.data.service === service,
  );
  for (const entry of ownEntries) {
    const folder = parseSectionId(entry.id);
    if (folder.service !== entry.data.service) {
      folderIssues.push(
        `${entry.id}: service "${entry.data.service}" difere da pasta "${folder.service}"`,
      );
    } else if (!isLocale(folder.locale)) {
      folderIssues.push(`${entry.id}: pasta de idioma desconhecida "${folder.locale}"`);
    } else {
      sectionsByLocale.get(folder.locale)?.push(entry);
    }
  }
  return { sectionsByLocale, folderIssues };
}

function findDuplicateIssues(service: ServiceId, sectionsByLocale: SectionsByLocale): string[] {
  return [...sectionsByLocale].flatMap(([locale, sections]) =>
    sections.length === 0
      ? [`${service}/${locale}: nenhuma seção encontrada`]
      : UNIQUE_FIELDS.flatMap((field) =>
          findRepeatedValues(sections.map((section) => section.data[field])).map(
            (value) => `${service}/${locale}: ${field} "${value}" repetido`,
          ),
        ),
  );
}

function mapOrderByKey(sections: readonly SectionLike[] = []): Map<string, number> {
  return new Map(sections.map((section) => [section.data.key, section.data.order]));
}

function compareLocaleOrder(
  expectedOrder: ReadonlyMap<string, number>,
  actualOrder: ReadonlyMap<string, number>,
  prefix: string,
): string[] {
  const reference = locales[0];
  const missingOrMoved = [...expectedOrder].flatMap(([key, expected]) => {
    const actual = actualOrder.get(key);
    if (actual === undefined)
      return [`${prefix}: falta a seção "${key}" que existe em ${reference}`];
    if (actual !== expected) {
      return [`${prefix}: seção "${key}" tem order ${actual}, mas ${expected} em ${reference}`];
    }
    return [];
  });
  const extra = [...actualOrder.keys()]
    .filter((key) => !expectedOrder.has(key))
    .map((key) => `${prefix}: seção "${key}" não existe em ${reference}`);
  return [...missingOrMoved, ...extra];
}

function findCrossLocaleIssues(service: ServiceId, sectionsByLocale: SectionsByLocale): string[] {
  const [reference, ...others] = locales;
  const referenceOrder = mapOrderByKey(sectionsByLocale.get(reference));
  return others.flatMap((locale) =>
    compareLocaleOrder(
      referenceOrder,
      mapOrderByKey(sectionsByLocale.get(locale)),
      `${service}/${locale}`,
    ),
  );
}

export function findParityIssues(service: ServiceId, entries: readonly SectionLike[]): string[] {
  const { sectionsByLocale, folderIssues } = groupSectionsByLocale(service, entries);
  return [
    ...folderIssues,
    ...findDuplicateIssues(service, sectionsByLocale),
    ...findCrossLocaleIssues(service, sectionsByLocale),
  ];
}

export class LocaleParityError extends Error {
  constructor(service: ServiceId, issues: readonly string[]) {
    super(
      `Conteúdo de "${service}" inválido entre idiomas:\n${issues.map((i) => `  - ${i}`).join('\n')}`,
    );
    this.name = 'LocaleParityError';
  }
}
