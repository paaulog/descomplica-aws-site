import type { APIRoute } from 'astro';

// Built from `site`, so changing the domain in astro.config.mjs also updates the sitemap URL.
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('robots.txt: defina `site` em astro.config.mjs');
  const sitemap = new URL('sitemap-index.xml', site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
