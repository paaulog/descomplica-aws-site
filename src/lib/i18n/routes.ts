import { defaultLocale, htmlLang, isLocale, locales, type Locale } from './ui';

export interface Alternate {
  hreflang: string;
  href: string;
}

/** Garante barra inicial e final, sem barras duplicadas. Preserva `?query` e `#hash`. */
function normalize(path: string): string {
  const match = /^([^?#]*)(.*)$/.exec(path);
  const pathname = match?.[1] ?? '';
  const suffix = match?.[2] ?? '';
  const segments = pathname.split('/').filter(Boolean);
  const clean = segments.length === 0 ? '/' : `/${segments.join('/')}/`;
  return clean + suffix;
}

/**
 * Converte um caminho neutro (sem idioma) no caminho do idioma.
 * pt-BR não tem prefixo; en fica sob `/en`.
 */
export function localizedPath(locale: Locale, path: string): string {
  const normalized = normalize(path);
  if (locale === defaultLocale) return normalized;
  return normalized === '/' ? `/${locale}/` : `/${locale}${normalized}`;
}

/** Remove o prefixo de idioma de um pathname e devolve o caminho neutro e o idioma. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const normalized = normalize(pathname);
  const first = normalized.split('/')[1] ?? '';
  // Aceita também `/pt-br/...` explícito, para o caminho neutro nunca carregar o prefixo.
  if (isLocale(first)) {
    return { locale: first, path: normalize(normalized.slice(first.length + 1)) };
  }
  return { locale: defaultLocale, path: normalized };
}

/** Links `hreflang` de um caminho neutro, um por idioma, mais o `x-default`. */
export function getAlternates(path: string, site: URL | string): Alternate[] {
  const toHref = (locale: Locale) => new URL(localizedPath(locale, path), site).href;
  return [
    ...locales.map((locale) => ({ hreflang: htmlLang[locale], href: toHref(locale) })),
    { hreflang: 'x-default', href: toHref(defaultLocale) },
  ];
}
