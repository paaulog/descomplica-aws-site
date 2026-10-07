import type { PricingTable } from '@/lib/s3/pricing-schema';
import { storageClasses } from '@/lib/s3/storage-class';

// Round, made-up prices: a result that matches them can only have come from this table.
export function createTestPricing(): PricingTable {
  const flat = Object.fromEntries(storageClasses.map((name) => [name, { perGbMonth: 1 }]));
  const requests = Object.fromEntries(
    storageClasses.map((name) => [name, { putPer1k: 10, getPer1k: 1 }]),
  );
  return {
    region: 'us-east-1',
    currency: 'USD',
    verifiedAt: '2026-01-01',
    sources: ['https://example.com/pricing'],
    storage: {
      ...flat,
      INTELLIGENT_TIERING: { perGbMonth: 1, monitoringPer1kObjects: 2 },
      STANDARD_IA: { perGbMonth: 0.5, minDays: 30, retrievalPerGb: 3 },
      DEEP_ARCHIVE: { perGbMonth: 0.1, minDays: 180, retrievalPerGb: 5 },
    } as PricingTable['storage'],
    requests: requests as PricingTable['requests'],
    transferOut: { freeGb: 100, perGb: 2 },
    freePlan: { startedAt: '2025-07-15', creditsUsd: 100, extraCreditsUsd: 100, months: 6 },
  };
}
