import { pricingTableSchema, type PricingTable } from '../lib/s3/pricing-schema';

/*
 * us-east-1, USD, first price tier. Checked on verifiedAt against the AWS Price List bulk files
 * (AmazonS3 published 2026-09-28, AmazonS3GlacierDeepArchive 2026-09-11, AWSDataTransfer
 * 2026-09-16) and the pages in `sources`. Archive classes price their read requests as standard
 * restore requests, since a GET only works after the restore.
 */
export const pricing: PricingTable = pricingTableSchema.parse({
  region: 'us-east-1',
  currency: 'USD',
  verifiedAt: '2026-10-07',
  sources: [
    'https://aws.amazon.com/s3/pricing/',
    'https://aws.amazon.com/s3/storage-classes/',
    'https://aws.amazon.com/free/',
    'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/us-east-1/index.json',
  ],
  storage: {
    STANDARD: { perGbMonth: 0.023 },
    INTELLIGENT_TIERING: { perGbMonth: 0.023, monitoringPer1kObjects: 0.0025 },
    STANDARD_IA: { perGbMonth: 0.0125, minDays: 30, minObjectKb: 128, retrievalPerGb: 0.01 },
    GLACIER_IR: { perGbMonth: 0.004, minDays: 90, minObjectKb: 128, retrievalPerGb: 0.03 },
    GLACIER: { perGbMonth: 0.0036, minDays: 90, retrievalPerGb: 0.01 },
    DEEP_ARCHIVE: { perGbMonth: 0.00099, minDays: 180, retrievalPerGb: 0.02 },
  },
  requests: {
    STANDARD: { putPer1k: 0.005, getPer1k: 0.0004 },
    INTELLIGENT_TIERING: { putPer1k: 0.005, getPer1k: 0.0004 },
    STANDARD_IA: { putPer1k: 0.01, getPer1k: 0.001 },
    GLACIER_IR: { putPer1k: 0.02, getPer1k: 0.01 },
    GLACIER: { putPer1k: 0.03, getPer1k: 0.05 },
    DEEP_ARCHIVE: { putPer1k: 0.05, getPer1k: 0.1 },
  },
  transferOut: { freeGb: 100, perGb: 0.09 },
  freePlan: { startedAt: '2025-07-15', creditsUsd: 100, extraCreditsUsd: 100, months: 6 },
});
