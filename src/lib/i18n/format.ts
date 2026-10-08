import { htmlLang, type Locale } from './ui';

export type Currency = 'USD' | 'BRL';

export interface CurrencyFormat {
  currency: Currency;
  maximumFractionDigits?: number;
}

const CENTS_DIGITS = 2;
const BYTES_PER_UNIT = 1024;
const BYTE_FRACTION_DIGITS = 2;
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

const roundToByteFraction = (value: number): number => Number(value.toFixed(BYTE_FRACTION_DIGITS));

// AWS unit prices carry sub-cent fractions (US$ 0.023/GB): raise maximumFractionDigits to keep them.
export function formatCurrency(amount: number, locale: Locale, format: CurrencyFormat): string {
  const { currency, maximumFractionDigits = CENTS_DIGITS } = format;
  return new Intl.NumberFormat(htmlLang[locale], {
    style: 'currency',
    currency,
    minimumFractionDigits: CENTS_DIGITS,
    maximumFractionDigits: Math.max(CENTS_DIGITS, maximumFractionDigits),
  }).format(amount);
}

const SUB_CENT_DIGITS = 4;
const ONE_CENT = 0.01;

// Amounts under one cent keep four decimals, so a US$ 0.0004 request bill does not read as zero.
export function formatUsd(amount: number, locale: Locale): string {
  const isSubCent = amount > 0 && amount < ONE_CENT;
  return formatCurrency(amount, locale, {
    currency: 'USD',
    maximumFractionDigits: isSubCent ? SUB_CENT_DIGITS : CENTS_DIGITS,
  });
}

export function formatDateTime(
  isoDate: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(htmlLang[locale], options).format(new Date(isoDate));
}

export function formatBytes(bytes: number, locale: Locale): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new RangeError(`Tamanho inválido: ${bytes}`);
  }
  let value = bytes;
  let unit = 0;
  // Rounds before comparing so 1023.999 KB becomes "1 MB", not "1,024 KB".
  while (roundToByteFraction(value) >= BYTES_PER_UNIT && unit < BYTE_UNITS.length - 1) {
    value /= BYTES_PER_UNIT;
    unit += 1;
  }
  const number = new Intl.NumberFormat(htmlLang[locale], {
    maximumFractionDigits: unit === 0 ? 0 : BYTE_FRACTION_DIGITS,
  }).format(value);
  return `${number} ${BYTE_UNITS[unit]}`;
}

// A YYYY-MM-DD calendar date; UTC keeps it from shifting a day in western time zones.
export function formatCalendarDate(isoDate: string, locale: Locale): string {
  return formatDateTime(isoDate, locale, { dateStyle: 'long', timeZone: 'UTC' });
}
