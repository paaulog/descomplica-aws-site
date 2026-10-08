import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { getActiveServices, type Service, type ServiceId } from '../../data/services';
import type { Locale } from '../i18n/ui';
import { findGlossaryEntry, type GlossaryEntry } from './glossary';
import { findParityIssues, LocaleParityError, selectServiceSections } from './parity';

export type SectionEntry = CollectionEntry<'sections'>;

export interface ServicePath {
  params: { service: ServiceId };
  props: { service: Service };
}

export async function getServiceSections(
  service: ServiceId,
  locale: Locale,
): Promise<SectionEntry[]> {
  return selectServiceSections(await getCollection('sections'), service, locale);
}

export async function assertLocaleParity(service: ServiceId): Promise<void> {
  const entries = await getCollection('sections');
  const issues = findParityIssues(service, entries);
  if (issues.length > 0) throw new LocaleParityError(service, issues);
}

// Not memoized: in `astro dev` a cached result would hide parity errors after content edits.
export async function getActiveServicePaths(): Promise<ServicePath[]> {
  const active = getActiveServices();
  for (const service of active) await assertLocaleParity(service.id);
  return active.map((service) => ({ params: { service: service.id }, props: { service } }));
}

export async function getGlossaryEntry(id: string, locale: Locale): Promise<GlossaryEntry> {
  const glossary = await getEntry('glossary', locale);
  return findGlossaryEntry(glossary?.data ?? {}, id, locale);
}
