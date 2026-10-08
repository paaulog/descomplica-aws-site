import { describe, expect, it } from 'vitest';
import S3Island from '@/components/interactive/S3Island.astro';
import {
  getOtherLocale,
  islandMessages,
  locales,
  type IslandName,
  type Locale,
} from '@/lib/i18n/ui';
import { parseHtml, renderToHtml } from './render-page';

const pathFor = (locale: Locale) => (locale === 'en' ? '/en/s3/' : '/s3/');

async function renderIsland(name: IslandName, locale: Locale) {
  const html = await renderToHtml(S3Island, { url: pathFor(locale), props: { name } });
  return { html, document: parseHtml(html) };
}

// What the server must already show, before any JavaScript runs.
const initialContent: Record<IslandName, (locale: Locale) => string[]> = {
  keyExplorer: (locale) => [locale === 'en' ? 'photos/' : 'fotos/', '2026/'],
  uploadToBucket: (locale) => [islandMessages[locale].uploadToBucket.emptyBucket],
  storageClassSlider: () => ['S3 Standard', 'S3 Glacier Deep Archive'],
  costCalculator: (locale) => [locale === 'en' ? '$41.65' : 'US$ 41,65'],
  accessLock: (locale) => [
    islandMessages[locale].accessLock.allowed,
    islandMessages[locale].accessLock.denied,
  ],
  versionTimeline: (locale) => [islandMessages[locale].versionTimeline.currentLabel],
  lifecycleAnimation: (locale) => [locale === 'en' ? 'On day 0' : 'No dia 0'],
  flowDiagram: (locale) => [
    islandMessages[locale].flowDiagram.steps.user.name,
    islandMessages[locale].flowDiagram.steps.bucket.name,
  ],
};

const islandNames = Object.keys(initialContent) as IslandName[];

describe.each(locales)('SSR das ilhas em %s', (locale) => {
  it.each(islandNames)('%s mostra o estado inicial e hidrata ao ficar visível', async (name) => {
    const { document } = await renderIsland(name, locale);
    const island = document.querySelector('astro-island');
    expect(island?.getAttribute('client')).toBe('visible');
    const text = (island?.textContent ?? '').replace(/\s/g, ' ');
    expect(text).toContain(islandMessages[locale][name].title);
    for (const expected of initialContent[name](locale)) expect(text).toContain(expected);
  });

  it.each(islandNames)('%s recebe só as mensagens do próprio idioma', async (name) => {
    const { document } = await renderIsland(name, locale);
    const props = document.querySelector('astro-island')?.getAttribute('props') ?? '';
    const other = islandMessages[getOtherLocale(locale)][name].fallback;
    expect(props).toContain(JSON.stringify(locale));
    expect(props).not.toContain(other.slice(0, 40));
  });
});

describe('S3Island', () => {
  it('quebra o build com um nome de ilha desconhecido', async () => {
    await expect(renderToHtml(S3Island, { url: '/s3/', props: { name: 'quiz' } })).rejects.toThrow(
      '<S3Island name="quiz">',
    );
  });
});
