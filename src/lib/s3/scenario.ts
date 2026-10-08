import { estimateMonthlyCost, type CostBreakdown } from './cost';
import type { PricingTable } from './pricing-schema';
import { storageClasses, type AccessFrequency, type StorageClass } from './storage-class';

/*
 * The fixed example the storage class slider prices: 100 GB in 10,000 objects of 10 MB, and each
 * read brings the whole set back. With full reads the recommended class is the cheapest of the
 * classes at least as fast as it at every slider stop, so the chart never contradicts the advice.
 */
export const SAMPLE_SCENARIO = {
  storageGb: 100,
  objectCount: 10_000,
  gbPerRead: 100,
  objectsPerRead: 10_000,
} as const;

const MONTHS_PER_QUARTER = 3;
const MONTHS_PER_YEAR = 12;
const DAYS_PER_MONTH = 30;
const WEEKS_PER_MONTH = 4;
const YEARS_BETWEEN_RARE_READS = 2;

export const READS_PER_MONTH: Record<AccessFrequency, number> = {
  daily: DAYS_PER_MONTH,
  weekly: WEEKS_PER_MONTH,
  monthly: 1,
  quarterly: 1 / MONTHS_PER_QUARTER,
  yearly: 1 / MONTHS_PER_YEAR,
  rarely: 1 / (MONTHS_PER_YEAR * YEARS_BETWEEN_RARE_READS),
};

export interface ClassCost {
  storageClass: StorageClass;
  cost: CostBreakdown;
}

export function estimateScenarioCost(
  storageClass: StorageClass,
  frequency: AccessFrequency,
  table: PricingTable,
): CostBreakdown {
  const reads = READS_PER_MONTH[frequency];
  return estimateMonthlyCost(
    {
      storageClass,
      storageGb: SAMPLE_SCENARIO.storageGb,
      objectCount: SAMPLE_SCENARIO.objectCount,
      putRequests: 0,
      getRequests: reads * SAMPLE_SCENARIO.objectsPerRead,
      retrievalGb: reads * SAMPLE_SCENARIO.gbPerRead,
      transferOutGb: 0,
    },
    table,
  );
}

export function compareScenarioCosts(frequency: AccessFrequency, table: PricingTable): ClassCost[] {
  return storageClasses.map((storageClass) => ({
    storageClass,
    cost: estimateScenarioCost(storageClass, frequency, table),
  }));
}
