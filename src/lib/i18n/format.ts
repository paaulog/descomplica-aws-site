import { htmlLang, type Locale } from './ui';

export type Currency = 'USD' | 'BRL';

/**
 * Formata um valor monetário no padrão do idioma. A moeda é explícita: não há conversão.
 * Preços unitários da AWS têm frações de centavo (US$ 0,023/GB): passe `maximumFractionDigits`
 * para não arredondá-los.
 */
export function formatCurrency(
  amount: number,
  locale: Locale,
  currency: Currency,
  { maximumFractionDigits = 2 }: { maximumFractionDigits?: number } = {},
): string {
  return new Intl.NumberFormat(htmlLang[locale], {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.max(2, maximumFractionDigits),
  }).format(amount);
}

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/** Formata bytes em base 1024 (B, KB, MB, GB, TB), com até 2 casas decimais. */
export function formatBytes(bytes: number, locale: Locale): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new RangeError(`Tamanho inválido: ${bytes}`);
  }
  let value = bytes;
  let unit = 0;
  // Compara já arredondado, para 1023,999 KB virar "1 MB" e não "1.024 KB".
  while (Math.round(value * 100) / 100 >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const number = new Intl.NumberFormat(htmlLang[locale], {
    maximumFractionDigits: unit === 0 ? 0 : 2,
  }).format(value);
  return `${number} ${BYTE_UNITS[unit]}`;
}
