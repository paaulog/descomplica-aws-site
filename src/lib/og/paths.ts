// Kept apart from render.ts so pages can link the image without bundling Satori.
import type { ServiceId } from '../../data/services';
import type { Locale } from '../i18n/ui';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const HOME_OG_SLUG = 'home';

export type OgSlug = ServiceId | typeof HOME_OG_SLUG;

export function getOgImagePath(locale: Locale, slug: OgSlug): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/og/${locale}/${slug}.png`;
}
