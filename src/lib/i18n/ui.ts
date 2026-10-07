export const locales = ['pt-br', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pt-br';

/** Código BCP 47 usado em `<html lang>`, `hreflang` e `Intl`. */
export const htmlLang: Record<Locale, string> = {
  'pt-br': 'pt-BR',
  en: 'en',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

const ptBr = {
  'site.title': 'Descomplica AWS',
  'site.description':
    'Os serviços principais da AWS explicados de um jeito visual, amigável e prático.',
  'home.servicesHeading': 'Serviços',
  'service.status.soon': 'Em breve',
} as const;

export type UiKey = keyof typeof ptBr;

/** O tipo obriga o inglês a ter exatamente as mesmas chaves do pt-BR. */
const en: Record<UiKey, string> = {
  'site.title': 'Descomplica AWS',
  'site.description': 'The core AWS services explained in a visual, friendly and practical way.',
  'home.servicesHeading': 'Services',
  'service.status.soon': 'Coming soon',
};

export const ui: Record<Locale, Record<UiKey, string>> = {
  'pt-br': ptBr,
  en,
};

export function useTranslations(locale: Locale) {
  return (key: UiKey): string => ui[locale][key];
}
