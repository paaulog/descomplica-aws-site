export const PRICING_MAX_AGE_DAYS = 90;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function countDaysSince(isoDate: string, now: Date): number {
  return Math.floor((now.getTime() - Date.parse(isoDate)) / MS_PER_DAY);
}

export function getPricingAgeWarning(verifiedAt: string, now: Date): string | null {
  const age = countDaysSince(verifiedAt, now);
  if (age <= PRICING_MAX_AGE_DAYS) return null;
  return `Os preços de src/data/pricing.ts foram conferidos há ${age} dias (verifiedAt: ${verifiedAt}). Confira de novo na página oficial da AWS e atualize verifiedAt.`;
}
