import { describe, expect, it } from 'vitest';
import HomePage from '@/components/sections/HomePage.astro';
import ServicePage from '@/components/sections/ServicePage.astro';
import { services } from '@/data/services';
import NotFound from '@/pages/404.astro';
import { parseHtml, renderToHtml, SITE } from './render-page';

const s3 = services.find((service) => service.id === 's3');
if (!s3) throw new Error('serviço s3 ausente em services.ts');

async function renderS3(locale: 'pt-br' | 'en') {
  const url = locale === 'en' ? '/en/s3/' : '/s3/';
  const html = await renderToHtml(ServicePage, {
    url,
    props: { service: s3, locale },
    params: { service: 's3' },
  });
  return parseHtml(html);
}

function readAlternates(document: Document): Record<string, string> {
  return Object.fromEntries(
    [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(
      (link): [string, string] => [
        link.getAttribute('hreflang') ?? '',
        link.getAttribute('href') ?? '',
      ],
    ),
  );
}

describe('BaseLayout', () => {
  it('põe o lang certo no <html>', async () => {
    expect((await renderS3('pt-br')).documentElement.lang).toBe('pt-BR');
    expect((await renderS3('en')).documentElement.lang).toBe('en');
  });

  it('aponta o canonical para a própria página', async () => {
    const canonical = (document: Document) =>
      document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    expect(canonical(await renderS3('pt-br'))).toBe(`${SITE}/s3/`);
    expect(canonical(await renderS3('en'))).toBe(`${SITE}/en/s3/`);
  });

  it('tem hreflang recíprocos entre os idiomas', async () => {
    const ptBr = readAlternates(await renderS3('pt-br'));
    const en = readAlternates(await renderS3('en'));
    expect(ptBr).toEqual(en);
    expect(ptBr).toEqual({
      'pt-BR': `${SITE}/s3/`,
      en: `${SITE}/en/s3/`,
      'x-default': `${SITE}/s3/`,
    });
  });

  it('prepara as metatags de Open Graph e Twitter', async () => {
    const document = await renderS3('en');
    const meta = (selector: string) => document.querySelector(selector)?.getAttribute('content');
    expect(meta('meta[property="og:url"]')).toBe(`${SITE}/en/s3/`);
    expect(meta('meta[property="og:locale"]')).toBe('en_US');
    expect(meta('meta[property="og:title"]')).toBe('Amazon S3 · Descomplica AWS');
    expect(meta('meta[name="twitter:card"]')).toBe('summary_large_image');
  });

  it.each([
    ['pt-br', `${SITE}/og/pt-br/s3.png`],
    ['en', `${SITE}/og/en/s3.png`],
  ] as const)('aponta OG e Twitter para o PNG do idioma (%s)', async (locale, png) => {
    const document = await renderS3(locale);
    const meta = (selector: string) => document.querySelector(selector)?.getAttribute('content');
    expect(meta('meta[property="og:image"]')).toBe(png);
    expect(meta('meta[name="twitter:image"]')).toBe(png);
    expect(meta('meta[property="og:image:width"]')).toBe('1200');
    expect(meta('meta[property="og:image:height"]')).toBe('630');
  });

  it('aponta a home para o PNG da home', async () => {
    const document = parseHtml(
      await renderToHtml(HomePage, { url: '/en/', props: { locale: 'en' } }),
    );
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      `${SITE}/og/en/home.png`,
    );
  });

  it('aplica o tema antes da primeira pintura, no <head>', async () => {
    const document = await renderS3('pt-br');
    const inline = [...document.head.querySelectorAll('script:not([src])')];
    expect(inline.some((script) => script.textContent?.includes('da:theme'))).toBe(true);
  });

  it('tem o link para pular ao conteúdo e o aviso de projeto independente', async () => {
    const document = parseHtml(
      await renderToHtml(HomePage, { url: '/', props: { locale: 'pt-br' } }),
    );
    expect(document.querySelector('a[href="#main"]')?.textContent?.trim()).toBe(
      'Pular para o conteúdo',
    );
    expect(document.getElementById('main')).not.toBeNull();
    expect(document.querySelector('footer')?.textContent).toContain('Projeto independente');
  });

  it('não indexa nem aponta canonical na 404', async () => {
    const document = parseHtml(await renderToHtml(NotFound, { url: '/404/' }));
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
    expect(document.querySelector('[lang="en"] h2')?.textContent).toBe('Page not found');
  });
});
