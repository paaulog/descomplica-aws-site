// @ts-check
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';
import { SITE_URL } from './src/data/site';
import { pricingFreshness } from './src/integrations/pricing-freshness';

// GitHub Pages serves the site under /<repo>/; every other build stays at the domain root.
const isGitHubPages = process.env.DEPLOY_TARGET === 'github-pages';

export default defineConfig({
  site: isGitHubPages ? 'https://paaulog.github.io/descomplica-aws-site/' : SITE_URL,
  base: isGitHubPages ? '/descomplica-aws-site' : undefined,
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'pt-br',
    locales: ['pt-br', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  // expressiveCode must come before mdx.
  integrations: [
    expressiveCode({
      themes: ['github-dark', 'github-light'],
      // Follows the site's data-theme; the media query still covers pages before the theme script.
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      styleOverrides: { codeFontFamily: "'JetBrains Mono Variable', ui-monospace, monospace" },
    }),
    mdx(),
    react(),
    pricingFreshness(),
    sitemap({
      i18n: {
        defaultLocale: 'pt-br',
        locales: { 'pt-br': 'pt-BR', en: 'en' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
