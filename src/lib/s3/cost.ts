import type { PricingTable } from './pricing-schema';
import type { StorageClass } from './storage-class';

export interface CostInput {
  storageClass: StorageClass;
  storageGb: number;
  putRequests: number;
  getRequests: number;
  retrievalGb: number;
  transferOutGb: number;
  objectCount?: number;
}

export interface CostBreakdown {
  storage: number;
  requests: number;
  retrieval: number;
  monitoring: number;
  transfer: number;
  total: number;
  billableTransferGb: number;
}

const REQUESTS_PER_PRICE_UNIT = 1000;
// Unit prices go down to US$ 0.0000004 per request, so cents would hide most of the bill.
const PRICE_DECIMALS = 4;
const PRICE_SCALE = 10 ** PRICE_DECIMALS;

export function roundPrice(amount: number): number {
  return Math.round(amount * PRICE_SCALE) / PRICE_SCALE;
}

function toQuantity(value: number | undefined): number {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : 0;
}

function sanitizeInput(input: CostInput): Required<CostInput> {
  return {
    storageClass: input.storageClass,
    storageGb: toQuantity(input.storageGb),
    putRequests: toQuantity(input.putRequests),
    getRequests: toQuantity(input.getRequests),
    retrievalGb: toQuantity(input.retrievalGb),
    transferOutGb: toQuantity(input.transferOutGb),
    objectCount: toQuantity(input.objectCount),
  };
}

// Uses the first-tier prices only, so estimates are exact up to 50 TB stored and 10 TB sent.
export function estimateMonthlyCost(input: CostInput, table: PricingTable): CostBreakdown {
  const quantities = sanitizeInput(input);
  const storagePrice = table.storage[quantities.storageClass];
  const requestPrice = table.requests[quantities.storageClass];
  const billableTransferGb = Math.max(0, quantities.transferOutGb - table.transferOut.freeGb);
  const lines = {
    storage: roundPrice(quantities.storageGb * storagePrice.perGbMonth),
    requests: roundPrice(
      (quantities.putRequests * requestPrice.putPer1k +
        quantities.getRequests * requestPrice.getPer1k) /
        REQUESTS_PER_PRICE_UNIT,
    ),
    retrieval: roundPrice(quantities.retrievalGb * (storagePrice.retrievalPerGb ?? 0)),
    monitoring: roundPrice(
      (quantities.objectCount * (storagePrice.monitoringPer1kObjects ?? 0)) /
        REQUESTS_PER_PRICE_UNIT,
    ),
    transfer: roundPrice(billableTransferGb * table.transferOut.perGb),
  };
  const total = roundPrice(Object.values(lines).reduce((sum, line) => sum + line, 0));
  return { ...lines, total, billableTransferGb };
}
