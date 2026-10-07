import type { AstroIntegration } from 'astro';
import { pricing } from '../data/pricing';
import { getPricingAgeWarning } from '../lib/s3/pricing-freshness';

// A warning, not an error: stale prices should not block an urgent content fix.
export function pricingFreshness(getNow: () => Date = () => new Date()): AstroIntegration {
  return {
    name: 'descomplica:pricing-freshness',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const warning = getPricingAgeWarning(pricing.verifiedAt, getNow());
        if (warning) logger.warn(warning);
      },
    },
  };
}
