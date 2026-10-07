import type { Locale } from './i18n/ui';

export type AnalyticsEvent =
  | { name: 'section_view'; section: string; locale: Locale }
  | { name: 'interaction_used'; island: string }
  | { name: 'code_copied'; lang: string }
  | { name: 'theme_changed'; theme: string };

type AnalyticsSink = (event: AnalyticsEvent) => void;

/*
 * No-op on purpose: Vercel accepts custom events only on the Pro plan. Pointing the site at
 * another destination (e.g. Umami) means replacing this sink and nothing else.
 */
const sendToSink: AnalyticsSink = () => undefined;

// Analytics must never break the page, whatever the payload or the destination does.
export function track(event: AnalyticsEvent): void {
  try {
    sendToSink(event);
  } catch {
    // Losing one event is harmless.
  }
}
