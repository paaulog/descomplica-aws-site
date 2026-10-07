import type { ReactElement, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { createTranslator, locales, type Locale } from '@/lib/i18n/ui';
import { getOgImagePath, OG_HEIGHT, OG_WIDTH } from '@/lib/og/paths';
import { createOgCard, renderOgImage, type OgContent } from '@/lib/og/render';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];
const IHDR_WIDTH_OFFSET = 16;
const IHDR_HEIGHT_OFFSET = 20;

const contentByLocale: Record<Locale, OgContent> = {
  'pt-br': {
    label: 'Amazon S3',
    title: 'Em 10 minutos você vai entender o S3',
    summary: 'O S3 é mais simples do que parece, e esta página prova isso.',
    siteTitle: createTranslator('pt-br')('site.title'),
    accent: 'green',
  },
  en: {
    label: 'Amazon S3',
    title: 'In 10 minutes you will understand S3',
    summary: 'S3 is simpler than it looks, and this page proves it.',
    siteTitle: createTranslator('en')('site.title'),
    accent: 'green',
  },
};

function collectText(node: ReactNode): string[] {
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(collectText);
  const element = node as ReactElement<{ children?: ReactNode }> | null;
  return element?.props ? collectText(element.props.children) : [];
}

describe.each(locales)('renderOgImage (%s)', (locale) => {
  it('gera um PNG de 1200×630', async () => {
    const png = await renderOgImage(contentByLocale[locale]);
    expect([...png.subarray(0, PNG_SIGNATURE.length)]).toEqual(PNG_SIGNATURE);
    expect(png.readUInt32BE(IHDR_WIDTH_OFFSET)).toBe(OG_WIDTH);
    expect(png.readUInt32BE(IHDR_HEIGHT_OFFSET)).toBe(OG_HEIGHT);
  });

  it('usa o title e o summary da página no cartão', () => {
    const content = contentByLocale[locale];
    expect(collectText(createOgCard(content))).toEqual([
      content.label,
      content.title,
      content.summary,
      content.siteTitle,
    ]);
  });
});

describe('getOgImagePath', () => {
  it('monta o caminho do PNG por idioma e página', () => {
    expect(getOgImagePath('pt-br', 's3')).toBe('/og/pt-br/s3.png');
    expect(getOgImagePath('en', 'home')).toBe('/og/en/home.png');
  });
});
