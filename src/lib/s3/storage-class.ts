import type { PricingTable } from './pricing-schema';

// The values of the x-amz-storage-class header; GLACIER is Glacier Flexible Retrieval.
export const storageClasses = [
  'STANDARD',
  'INTELLIGENT_TIERING',
  'STANDARD_IA',
  'GLACIER_IR',
  'GLACIER',
  'DEEP_ARCHIVE',
] as const;
export type StorageClass = (typeof storageClasses)[number];

// Ordered from most to least frequent, matching the slider stops.
export const accessFrequencies = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'rarely',
] as const;
export type AccessFrequency = (typeof accessFrequencies)[number];

export const retentionDaysOptions = [30, 90, 180, 365] as const;
export type RetentionDays = (typeof retentionDaysOptions)[number];

export interface AccessProfile {
  frequency: AccessFrequency | 'unknown';
  retentionDays: number;
}

export type StorageClassWarning =
  | { type: 'minDuration'; minDays: number }
  | { type: 'retrievalFee'; perGb: number }
  | { type: 'slowRetrieval' };

export interface StorageClassRecommendation {
  storageClass: StorageClass;
  warnings: StorageClassWarning[];
}

// Follows the access patterns AWS documents for each class on the storage classes page.
const CLASS_BY_FREQUENCY: Record<AccessProfile['frequency'], StorageClass> = {
  daily: 'STANDARD',
  weekly: 'STANDARD',
  monthly: 'STANDARD_IA',
  quarterly: 'GLACIER_IR',
  yearly: 'GLACIER',
  rarely: 'DEEP_ARCHIVE',
  unknown: 'INTELLIGENT_TIERING',
};

// Archived objects must be restored first, which takes minutes to hours.
const SLOW_RETRIEVAL_CLASSES: readonly StorageClass[] = ['GLACIER', 'DEEP_ARCHIVE'];

export function listStorageClassWarnings(
  storageClass: StorageClass,
  retentionDays: number,
  table: PricingTable,
): StorageClassWarning[] {
  const { minDays, retrievalPerGb } = table.storage[storageClass];
  const warnings: StorageClassWarning[] = [];
  const endsEarly = minDays !== undefined && retentionDays < minDays;
  if (endsEarly) warnings.push({ type: 'minDuration', minDays });
  if (retrievalPerGb) warnings.push({ type: 'retrievalFee', perGb: retrievalPerGb });
  if (SLOW_RETRIEVAL_CLASSES.includes(storageClass)) warnings.push({ type: 'slowRetrieval' });
  return warnings;
}

export function recommendStorageClass(
  profile: AccessProfile,
  table: PricingTable,
): StorageClassRecommendation {
  const storageClass = CLASS_BY_FREQUENCY[profile.frequency];
  return {
    storageClass,
    warnings: listStorageClassWarnings(storageClass, profile.retentionDays, table),
  };
}
