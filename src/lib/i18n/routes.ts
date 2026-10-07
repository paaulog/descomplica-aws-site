import { defaultLocale, htmlLang, isLocale, locales, type Locale } from './ui';

export interface Alternate {
  hreflang: string;
  href: string;
}

// '' at the domain root, '/descomplica-aws-site' on GitHub Pages.
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function normalizePath(path: string): string {
  const match = /^([^?#]*)(.*)$/.exec(path);
  const pathname = match?.[1] ?? '';
  const suffix = match?.[2] ?? '';
  const segments = pathname.split('/').filter(Boolean);
  const clean = segments.length === 0 ? '/' : `/${segments.join('/')}/`;
  return clean + suffix;
}

export function localizedPath(locale: Locale, path: string): string {
  const normalized = normalizePath(path);
  if (locale === defaultLocale) return basePath + normalized;
  return basePath + (normalized === '/' ? `/${locale}/` : `/${locale}${normalized}`);
}

export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const withoutBase =
    basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
  const normalized = normalizePath(withoutBase);
  const first = normalized.split('/')[1] ?? '';
  // Also strips an explicit `/pt-br/` so the neutral path never carries a locale prefix.
  if (isLocale(first)) {
    return { locale: first, path: normalizePath(normalized.slice(first.length + 1)) };
  }
  return { locale: defaultLocale, path: normalized };
}

export function getAlternates(path: string, site: URL | string): Alternate[] {
  const toHref = (locale: Locale) => new URL(localizedPath(locale, path), site).href;
  return [
    ...locales.map((locale) => ({ hreflang: htmlLang[locale], href: toHref(locale) })),
    { hreflang: 'x-default', href: toHref(defaultLocale) },
  ];
}
