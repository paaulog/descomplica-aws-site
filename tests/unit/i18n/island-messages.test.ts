import { describe, expect, it } from 'vitest';
import { formatDateTime, formatUsd } from '@/lib/i18n/format';
import { getIslandMessages, islandMessages, locales } from '@/lib/i18n/ui';

// Flattens nested messages into "path: value" pairs, so both locales compare key by key.
function flatten(value: unknown, path = ''): [string, unknown][] {
  if (typeof value !== 'object' || value === null) return [[path, value]];
  return Object.entries(value).flatMap(([key, child]) =>
    flatten(child, path ? `${path}.${key}` : key),
  );
}

const plain = (value: string) => value.replace(/\s/g, ' ');

describe('mensagens das ilhas', () => {
  it('têm exatamente as mesmas chaves nos dois idiomas', () => {
    const [reference, ...others] = locales.map((locale) =>
      flatten(islandMessages[locale]).map(([path]) => path),
    );
    for (const paths of others) expect(paths).toEqual(reference);
  });

  it('não têm textos vazios', () => {
    for (const locale of locales) {
      for (const [path, value] of flatten(islandMessages[locale])) {
        expect(typeof value === 'string' && value.trim() !== '', `${locale}: ${path}`).toBe(true);
      }
    }
  });

  it('usam os mesmos marcadores nos dois idiomas', () => {
    const placeholders = (value: unknown) =>
      String(value)
        .match(/\{\w+\}/g)
        ?.toSorted()
        .join(',') ?? '';
    const ptBr = new Map(flatten(islandMessages['pt-br']));
    for (const [path, value] of flatten(islandMessages.en)) {
      expect(placeholders(value), path).toBe(placeholders(ptBr.get(path)));
    }
  });

  it('entregam só o recorte de uma ilha num idioma', () => {
    expect(getIslandMessages('pt-br', 'keyExplorer').title).toBe('Simulador de chave');
    expect(getIslandMessages('en', 'keyExplorer').title).toBe('Key simulator');
  });
});

describe('formatUsd', () => {
  it('usa centavos para valores a partir de 1 centavo', () => {
    expect(formatUsd(11.39, 'en')).toBe('$11.39');
    expect(plain(formatUsd(2.3, 'pt-br'))).toBe('US$ 2,30');
  });

  it('mostra até 4 casas abaixo de 1 centavo, para não parecer de graça', () => {
    expect(formatUsd(0.0004, 'en')).toBe('$0.0004');
    expect(plain(formatUsd(0.0025, 'pt-br'))).toBe('US$ 0,0025');
  });

  it('mostra zero com centavos', () => {
    expect(formatUsd(0, 'en')).toBe('$0.00');
  });
});

describe('formatDateTime', () => {
  it('formata no padrão de cada idioma, no fuso pedido', () => {
    const options: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeZone: 'UTC' };
    expect(formatDateTime('2026-10-07', 'pt-br', options)).toBe('7 de outubro de 2026');
    expect(formatDateTime('2026-10-07', 'en', options)).toBe('October 7, 2026');
  });
});
