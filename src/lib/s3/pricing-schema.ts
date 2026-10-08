import { z } from 'astro/zod';
import { storageClasses } from './storage-class';

const priceSchema = z.number().nonnegative();
const isoDateSchema = z.iso.date();

const storagePriceSchema = z.object({
  perGbMonth: priceSchema,
  minDays: z.number().int().positive().optional(),
  minObjectKb: z.number().int().positive().optional(),
  retrievalPerGb: priceSchema.optional(),
  monitoringPer1kObjects: priceSchema.optional(),
});

const requestPriceSchema = z.object({
  putPer1k: priceSchema,
  getPer1k: priceSchema,
});

const byStorageClass = <T extends z.ZodType>(schema: T) =>
  z.object(
    Object.fromEntries(storageClasses.map((name) => [name, schema])) as Record<
      (typeof storageClasses)[number],
      T
    >,
  );

export const pricingTableSchema = z.object({
  region: z.literal('us-east-1'),
  currency: z.literal('USD'),
  verifiedAt: isoDateSchema,
  sources: z.array(z.url()).min(1),
  storage: byStorageClass(storagePriceSchema),
  requests: byStorageClass(requestPriceSchema),
  transferOut: z.object({ freeGb: z.number().nonnegative(), perGb: priceSchema }),
  freePlan: z.object({
    startedAt: isoDateSchema,
    creditsUsd: priceSchema,
    extraCreditsUsd: priceSchema,
    months: z.number().int().positive(),
  }),
});

export type PricingTable = z.infer<typeof pricingTableSchema>;
