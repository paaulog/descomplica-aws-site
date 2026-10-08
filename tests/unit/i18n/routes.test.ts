import { describe, expect, it } from 'vitest';
import { getAlternates, localizedPath, splitLocale } from '@/lib/i18n/routes';

describe('localizedPath', () => {
  it('não prefixa o pt-BR', () => {
    expect(localizedPath('pt-br', '/')).toBe('/');
    expect(localizedPath('pt-br', '/s3/')).toBe('/s3/');
  });

  it('prefixa o en com /en', () => {
    expect(localizedPath('en', '/')).toBe('/en/');
    expect(localizedPath('en', '/s3/')).toBe('/en/s3/');
  });

  it('normaliza barras inicial, final e duplicadas', () => {
    expect(localizedPath('pt-br', 's3')).toBe('/s3/');
    expect(localizedPath('en', 's3')).toBe('/en/s3/');
    expect(localizedPath('en', '//s3//')).toBe('/en/s3/');
    expect(localizedPath('pt-br', '')).toBe('/');
  });

  it('preserva hash e query', () => {
    expect(localizedPath('en', '/s3#storage-classes')).toBe('/en/s3/#storage-classes');
    expect(localizedPath('pt-br', '/s3/?a=1#x')).toBe('/s3/?a=1#x');
  });
});

describe('splitLocale', () => {
  it('separa idioma e caminho neutro', () => {
    expect(splitLocale('/en/s3/')).toEqual({ locale: 'en', path: '/s3/' });
    expect(splitLocale('/en/')).toEqual({ locale: 'en', path: '/' });
    expect(splitLocale('/en')).toEqual({ locale: 'en', path: '/' });
    expect(splitLocale('/s3/')).toEqual({ locale: 'pt-br', path: '/s3/' });
    expect(splitLocale('/')).toEqual({ locale: 'pt-br', path: '/' });
  });

  it('não confunde caminhos que só começam com "en"', () => {
    expect(splitLocale('/encontro/')).toEqual({ locale: 'pt-br', path: '/encontro/' });
  });

  it('remove o prefixo explícito do idioma padrão', () => {
    expect(splitLocale('/pt-br/s3/')).toEqual({ locale: 'pt-br', path: '/s3/' });
  });

  it('faz o caminho de volta com localizedPath', () => {
    for (const pathname of ['/', '/s3/', '/en/', '/en/s3/']) {
      const { locale, path } = splitLocale(pathname);
      expect(localizedPath(locale, path)).toBe(pathname);
    }
  });
});

describe('getAlternates', () => {
  const site = 'https://descomplica-aws.vercel.app';

  it('gera um link absoluto por idioma e o x-default', () => {
    expect(getAlternates('/s3/', site)).toEqual([
      { hreflang: 'pt-BR', href: `${site}/s3/` },
      { hreflang: 'en', href: `${site}/en/s3/` },
      { hreflang: 'x-default', href: `${site}/s3/` },
    ]);
  });

  it('funciona na home', () => {
    expect(getAlternates('/', new URL(site)).map((a) => a.href)).toEqual([
      `${site}/`,
      `${site}/en/`,
      `${site}/`,
    ]);
  });
});
