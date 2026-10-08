import type { Locale } from '../../lib/i18n/ui';
import type { CostCalculatorMessages, StorageClassSliderMessages } from '../../lib/i18n/ui';
import type { PricingTable } from '../../lib/s3/pricing-schema';

// Every island gets its locale and only its own slice of messages, never the whole dictionary.
export interface IslandProps<M> {
  locale: Locale;
  messages: M;
}

export interface CostCalculatorProps extends IslandProps<CostCalculatorMessages> {
  pricing: PricingTable;
}

export interface StorageClassSliderProps extends IslandProps<StorageClassSliderMessages> {
  pricing: PricingTable;
}
