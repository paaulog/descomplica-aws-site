import type { APIRoute, GetStaticPaths } from 'astro';
import { getActiveServicePaths, getServiceSections } from '../../../lib/content';
import { createTranslator, locales, type Locale } from '../../../lib/i18n/ui';
import { HOME_OG_SLUG } from '../../../lib/og/paths';
import { renderOgImage, type OgContent } from '../../../lib/og/render';
import type { Service } from '../../../data/services';

interface Props {
  locale: Locale;
  service?: Service;
}

// One image per page and locale: the home plus every active service.
export const getStaticPaths = (async () => {
  const servicePaths = await getActiveServicePaths();
  return locales.flatMap((locale) => [
    { params: { locale, service: HOME_OG_SLUG }, props: { locale } },
    ...servicePaths.map(({ params, props }) => ({
      params: { locale, service: params.service },
      props: { locale, service: props.service },
    })),
  ]);
}) satisfies GetStaticPaths;

async function getServiceOgContent(service: Service, locale: Locale): Promise<OgContent> {
  const [opening] = await getServiceSections(service.id, locale);
  if (!opening) throw new Error(`OG: o serviço "${service.id}" não tem seções em ${locale}`);
  return {
    label: service.title[locale],
    title: opening.data.title,
    summary: opening.data.summary,
    siteTitle: createTranslator(locale)('site.title'),
    accent: service.accent,
  };
}

function getHomeOgContent(locale: Locale): OgContent {
  const t = createTranslator(locale);
  return {
    label: t('home.eyebrow'),
    title: t('home.title'),
    summary: t('home.lead'),
    siteTitle: t('site.title'),
    accent: 'green',
  };
}

export const GET: APIRoute<Props> = async ({ props }) => {
  const { locale, service } = props;
  const content = service ? await getServiceOgContent(service, locale) : getHomeOgContent(locale);
  const png = await renderOgImage(content);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
