import { describe, expect, it } from 'vitest';
import { isLocale, locales, ui, useTranslations } from '../../../src/lib/i18n/ui';

describe('ui', () => {
  it('tem exatamente as mesmas chaves nos dois idiomas', () => {
    const [reference, ...others] = locales.map((locale) => Object.keys(ui[locale]).sort());
    for (const keys of others) expect(keys).toEqual(reference);
  });

  it('não tem textos vazios', () => {
    for (const locale of locales) {
      for (const value of Object.values(ui[locale])) expect(value.trim()).not.toBe('');
    }
  });

  it('traduz pelo idioma', () => {
    expect(useTranslations('pt-br')('service.status.soon')).toBe('Em breve');
    expect(useTranslations('en')('service.status.soon')).toBe('Coming soon');
  });

  it('reconhece só os idiomas suportados', () => {
    expect(isLocale('pt-br')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('es')).toBe(false);
    expect(isLocale('pt-BR')).toBe(false);
  });
});
