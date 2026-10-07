import { getCollection, type CollectionEntry } from 'astro:content';
import { getActiveServices, type ServiceId } from '../../data/services';
import type { Locale } from '../i18n/ui';
import { findParityIssues, LocaleParityError, parseSectionId } from './parity';

export type SectionEntry = CollectionEntry<'sections'>;

/** Seções de um serviço num idioma, ordenadas por `order`. */
export async function getServiceSections(
  service: ServiceId,
  locale: Locale,
): Promise<SectionEntry[]> {
  const sections = await getCollection('sections', ({ id }) => {
    const folder = parseSectionId(id);
    return folder.service === service && folder.locale === locale;
  });
  return sections.sort((a, b) => a.data.order - b.data.order);
}

/** Lança `LocaleParityError` se o conteúdo do serviço não estiver em paridade entre os idiomas. */
export async function assertLocaleParity(service: ServiceId): Promise<void> {
  const entries = await getCollection('sections');
  const issues = findParityIssues(service, entries);
  if (issues.length > 0) throw new LocaleParityError(service, issues);
}

/**
 * `getStaticPaths` das páginas de serviço: só os serviços ativos, e só depois de validar a
 * paridade de cada um. Um serviço ativo sem conteúdo quebra o build.
 */
export async function getActiveServicePaths() {
  const active = getActiveServices();
  for (const service of active) await assertLocaleParity(service.id);
  return active.map((service) => ({ params: { service: service.id }, props: { service } }));
}
