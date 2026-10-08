import { describe, expect, it } from 'vitest';
import HomePage from '@/components/sections/HomePage.astro';
import { services } from '@/data/services';
import { parseHtml, renderToHtml } from './render-page';

describe('HomePage', () => {
  it('mostra um cartão por serviço', async () => {
    const document = parseHtml(
      await renderToHtml(HomePage, { url: '/', props: { locale: 'pt-br' } }),
    );
    expect(document.querySelectorAll('article[data-service]')).toHaveLength(services.length);
  });

  it('o cartão S3 é link e os cartões "em breve" não são', async () => {
    const document = parseHtml(
      await renderToHtml(HomePage, { url: '/en/', props: { locale: 'en' } }),
    );
    const card = (id: string) => document.querySelector(`article[data-service="${id}"]`);
    expect(card('s3')?.querySelector('a')?.getAttribute('href')).toBe('/en/s3/');
    for (const service of services.filter(({ status }) => status === 'soon')) {
      expect(card(service.id)?.querySelector('a'), service.id).toBeNull();
      expect(card(service.id)?.textContent).toContain('Coming soon');
    }
  });
});
