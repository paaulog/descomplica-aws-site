import type { CostInput } from './cost';

export const costFields = ['storageGb', 'putRequests', 'getRequests', 'transferOutGb'] as const;
export type CostField = (typeof costFields)[number];
export type CostFieldValues = Record<CostField, number>;

export const costPresetNames = ['personalSite', 'photoApp', 'backup'] as const;
export type CostPresetName = (typeof costPresetNames)[number];

// Illustrative monthly usage for each example, sized so each one has a different main cost.
export const costPresets: Record<CostPresetName, CostFieldValues> = {
  personalSite: { storageGb: 1, putRequests: 100, getRequests: 50_000, transferOutGb: 5 },
  photoApp: { storageGb: 200, putRequests: 50_000, getRequests: 2_000_000, transferOutGb: 500 },
  backup: { storageGb: 1000, putRequests: 10_000, getRequests: 100, transferOutGb: 0 },
};

// The calculator covers S3 Standard, the class a first bucket uses.
export function toStandardCostInput(values: CostFieldValues): CostInput {
  return { storageClass: 'STANDARD', retrievalGb: 0, ...values };
}
