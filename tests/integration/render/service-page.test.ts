import { describe, expect, it } from 'vitest';
import ServicePage from '@/components/sections/ServicePage.astro';
import { services } from '@/data/services';
import { getServiceSections } from '@/lib/content';
import { locales } from '@/lib/i18n/ui';
import { parseHtml, renderToHtml } from './render-page';

const s3 = services.find((service) => service.id === 's3');

describe.each(locales)('ServicePage (%s)', (locale) => {
  const renderS3 = async () => {
    if (!s3) throw new Error('services vazio');
    const url = locale === 'en' ? '/en/s3/' : '/s3/';
    const html = await renderToHtml(ServicePage, {
      url,
      props: { service: s3, locale },
      params: { service: 's3' },
    });
    return parseHtml(html);
  };

  it('renderiza as <section> na ordem de order, com id igual à âncora', async () => {
    const document = await renderS3();
    const expected = (await getServiceSections('s3', locale)).map((section) => section.data.anchor);
    const ids = [...document.querySelectorAll('article > section')].map((section) => section.id);
    expect(ids).toEqual(expected);
  });

  it('dá a cada seção um aria-labelledby que aponta para o título dela', async () => {
    const document = await renderS3();
    for (const section of document.querySelectorAll('article > section')) {
      const headingId = section.getAttribute('aria-labelledby') ?? '';
      const heading = document.getElementById(headingId);
      expect(heading, section.id).not.toBeNull();
      expect(section.contains(heading)).toBe(true);
    }
  });

  it('usa um único h1, no título da primeira seção', async () => {
    const document = await renderS3();
    const headings = document.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0]?.closest('section')).toBe(document.querySelector('article > section'));
  });

  it('tem um link âncora por seção e um traço do nav para cada uma', async () => {
    const document = await renderS3();
    const anchors = [...document.querySelectorAll('article > section')].map((s) => `#${s.id}`);
    const copyLinks = [...document.querySelectorAll('[data-copy-link]')];
    const dashes = [...document.querySelectorAll('[data-section-nav] a')];
    expect(copyLinks.map((link) => link.getAttribute('href'))).toEqual(anchors);
    expect(dashes.map((link) => link.getAttribute('href'))).toEqual(anchors);
  });

  it('não hidrata nenhum componente de framework', async () => {
    const document = await renderS3();
    expect(document.querySelector('astro-island')).toBeNull();
  });
});
