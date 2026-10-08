import { getContainerRenderer as getMdxRenderer } from '@astrojs/mdx/container-renderer';
import { getContainerRenderer as getReactRenderer } from '@astrojs/react/container-renderer';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { Window } from 'happy-dom';
import { SITE_URL } from '@/data/site';

export const SITE = SITE_URL;

export interface RenderOptions {
  url: string;
  props?: Record<string, unknown>;
  params?: Record<string, string>;
}

export async function renderToHtml(
  component: AstroComponentFactory,
  { url, props = {}, params = {} }: RenderOptions,
): Promise<string> {
  const renderers = await loadRenderers([getMdxRenderer(), getReactRenderer()]);
  const container = await AstroContainer.create({ renderers, astroConfig: { site: SITE } });
  return container.renderToString(component, {
    props,
    params,
    request: new Request(new URL(url, SITE)),
    partial: false,
  });
}

export function parseHtml(html: string): Document {
  const window = new Window({ url: SITE });
  return new window.DOMParser().parseFromString(html, 'text/html') as unknown as Document;
}
