import type { ServiceId } from '../../data/services';
import { isLocale, locales, type Locale } from '../i18n/ui';
import type { SectionData } from './schemas';

/** Uma seção como vem da coleção: id `<service>/<locale>/<arquivo>` e o frontmatter. */
export interface SectionLike {
  id: string;
  data: SectionData;
}

/** Lê serviço e idioma do id da entrada (`s3/pt-br/01-hero`). */
export function parseSectionId(id: string): { service: string; locale: string } {
  const [service = '', locale = ''] = id.split('/');
  return { service, locale };
}

function duplicates(values: readonly (string | number)[]): (string | number)[] {
  const seen = new Set<string | number>();
  const repeated = new Set<string | number>();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

/**
 * Lista os problemas de paridade das seções de um serviço. Lista vazia significa conteúdo válido.
 * Regras: todo idioma tem conteúdo; `order` e `anchor` são únicos por idioma; o conjunto de `key`
 * e o `order` de cada `key` são iguais em todos os idiomas; o `service` bate com a pasta.
 */
export function findParityIssues(service: ServiceId, entries: readonly SectionLike[]): string[] {
  const issues: string[] = [];
  const byLocale = new Map<Locale, SectionLike[]>(locales.map((locale) => [locale, []]));

  for (const entry of entries) {
    const folder = parseSectionId(entry.id);
    // Considera também arquivos que se dizem deste serviço mas estão em outra pasta (ex.: `S3/`).
    if (folder.service !== service && entry.data.service !== service) continue;
    if (folder.service !== entry.data.service) {
      issues.push(
        `${entry.id}: service "${entry.data.service}" difere da pasta "${folder.service}"`,
      );
      continue;
    }
    if (!isLocale(folder.locale)) {
      issues.push(`${entry.id}: pasta de idioma desconhecida "${folder.locale}"`);
      continue;
    }
    byLocale.get(folder.locale)?.push(entry);
  }

  for (const [locale, sections] of byLocale) {
    if (sections.length === 0) {
      issues.push(`${service}/${locale}: nenhuma seção encontrada`);
      continue;
    }
    for (const field of ['key', 'order', 'anchor'] as const) {
      for (const value of duplicates(sections.map((section) => section.data[field]))) {
        issues.push(`${service}/${locale}: ${field} "${value}" repetido`);
      }
    }
  }

  const [reference, ...others] = locales;
  const referenceOrder = new Map(
    (byLocale.get(reference) ?? []).map((section) => [section.data.key, section.data.order]),
  );
  for (const locale of others) {
    const order = new Map(
      (byLocale.get(locale) ?? []).map((section) => [section.data.key, section.data.order]),
    );
    for (const [key, expected] of referenceOrder) {
      const actual = order.get(key);
      if (actual === undefined) {
        issues.push(`${service}/${locale}: falta a seção "${key}" que existe em ${reference}`);
      } else if (actual !== expected) {
        issues.push(
          `${service}/${locale}: seção "${key}" tem order ${actual}, mas ${expected} em ${reference}`,
        );
      }
    }
    for (const key of order.keys()) {
      if (!referenceOrder.has(key)) {
        issues.push(`${service}/${locale}: seção "${key}" não existe em ${reference}`);
      }
    }
  }

  return issues;
}

export class LocaleParityError extends Error {
  constructor(service: ServiceId, issues: readonly string[]) {
    super(
      `Conteúdo de "${service}" inválido entre idiomas:\n${issues.map((i) => `  - ${i}`).join('\n')}`,
    );
    this.name = 'LocaleParityError';
  }
}
