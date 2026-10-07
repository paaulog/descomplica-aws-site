import { describe, expect, it, vi } from 'vitest';
import { pricing } from '@/data/pricing';
import { pricingFreshness } from '@/integrations/pricing-freshness';
import {
  countDaysSince,
  getPricingAgeWarning,
  PRICING_MAX_AGE_DAYS,
} from '@/lib/s3/pricing-freshness';
import { pricingTableSchema } from '@/lib/s3/pricing-schema';
import { storageClasses } from '@/lib/s3/storage-class';

const daysAfter = (isoDate: string, days: number) =>
  new Date(Date.parse(isoDate) + days * 24 * 60 * 60 * 1000);

describe('pricing.ts', () => {
  it('passa no schema', () => {
    expect(pricingTableSchema.safeParse(pricing).success).toBe(true);
  });

  it('tem preço de armazenamento e de requisições para todas as classes', () => {
    for (const storageClass of storageClasses) {
      expect(pricing.storage[storageClass].perGbMonth).toBeGreaterThan(0);
      expect(pricing.requests[storageClass].putPer1k).toBeGreaterThan(0);
    }
  });

  it('reflete o Free Plan em vigor desde 15/07/2025', () => {
    expect(pricing.freePlan).toEqual({
      startedAt: '2025-07-15',
      creditsUsd: 100,
      extraCreditsUsd: 100,
      months: 6,
    });
  });

  it('cita fontes oficiais da AWS', () => {
    for (const source of pricing.sources) expect(new URL(source).hostname).toMatch(/amazon/);
  });
});

describe('pricingTableSchema', () => {
  it('recusa preço negativo, data inválida e classe faltando', () => {
    expect(
      pricingTableSchema.safeParse({
        ...pricing,
        storage: { ...pricing.storage, STANDARD: { perGbMonth: -1 } },
      }).success,
    ).toBe(false);
    expect(pricingTableSchema.safeParse({ ...pricing, verifiedAt: '07/10/2026' }).success).toBe(
      false,
    );
    const partial: Partial<typeof pricing.storage> = { ...pricing.storage };
    delete partial.DEEP_ARCHIVE;
    expect(pricingTableSchema.safeParse({ ...pricing, storage: partial }).success).toBe(false);
  });
});

describe('aviso de preços vencidos', () => {
  it(`não avisa até ${PRICING_MAX_AGE_DAYS} dias`, () => {
    expect(getPricingAgeWarning('2026-01-01', daysAfter('2026-01-01', 0))).toBeNull();
    expect(
      getPricingAgeWarning('2026-01-01', daysAfter('2026-01-01', PRICING_MAX_AGE_DAYS)),
    ).toBeNull();
  });

  it(`avisa com ${PRICING_MAX_AGE_DAYS + 1} dias ou mais`, () => {
    const warning = getPricingAgeWarning(
      '2026-01-01',
      daysAfter('2026-01-01', PRICING_MAX_AGE_DAYS + 1),
    );
    expect(warning).toContain('91 dias');
    expect(warning).toContain('2026-01-01');
  });

  it('conta dias inteiros', () => {
    expect(countDaysSince('2026-01-01', new Date('2026-01-02T23:59:00Z'))).toBe(1);
  });

  it('a integração escreve o aviso no log do build só quando os preços venceram', () => {
    const run = (now: Date) => {
      const warn = vi.fn();
      const hook = pricingFreshness(() => now).hooks['astro:build:start'];
      // Only the logger is used by the hook.
      void hook?.({ logger: { warn } } as unknown as Parameters<NonNullable<typeof hook>>[0]);
      return warn;
    };
    expect(run(daysAfter(pricing.verifiedAt, 1))).not.toHaveBeenCalled();
    expect(run(daysAfter(pricing.verifiedAt, PRICING_MAX_AGE_DAYS + 1))).toHaveBeenCalledOnce();
  });
});
