import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { Resvg } from '@resvg/resvg-js';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import type { AccentToken } from '../../data/services';
import { OG_HEIGHT, OG_WIDTH } from './paths';

export interface OgContent {
  /** Small line above the title, e.g. the service name. */
  label: string;
  title: string;
  summary: string;
  siteTitle: string;
  accent: AccentToken;
}

// The card is always dark, so it uses the dark-theme accents from global.css.
const accentColors: Record<AccentToken, string> = {
  green: '#34d399',
  orange: '#fb923c',
  amber: '#fbbf24',
  violet: '#a78bfa',
};

const palette = { background: '#0b0c0e', foreground: '#f4f4f5', muted: '#a1a1aa' };

const FONT_FAMILY = 'Geist';
const fontWeights = [400, 700] as const;
const [, BOLD_WEIGHT] = fontWeights;

// Card layout in px, tuned by eye for the 1200×630 canvas.
const layout = {
  padding: 80,
  stackGap: 28,
  accentBar: { width: 72, height: 8, radius: 4 },
  labelSize: 34,
  titleSize: 68,
  titleLineHeight: 1.1,
  summarySize: 32,
  summaryLineHeight: 1.4,
  siteTitleSize: 28,
} as const;

const require = createRequire(import.meta.url);

// Satori's ESM build reads __dirname on load to find yoga.wasm, which fails in ESM; the CJS one has it.
const { default: satori } = require('satori') as typeof import('satori');

// Satori reads TTF, OTF and WOFF but not WOFF2, so the OG uses the static WOFF files only.
const fontFile = (weight: (typeof fontWeights)[number]) =>
  require.resolve(`@fontsource/geist/files/geist-latin-${weight}-normal.woff`);

type Fonts = Parameters<typeof satori>[1]['fonts'];

let fontsPromise: Promise<Fonts> | undefined;

function loadFonts(): Promise<Fonts> {
  return Promise.all(
    fontWeights.map(async (weight) => ({
      name: FONT_FAMILY,
      data: await readFile(fontFile(weight)),
      weight,
      style: 'normal' as const,
    })),
  );
}

function getFonts(): Promise<Fonts> {
  fontsPromise ??= loadFonts();
  return fontsPromise;
}

function createElement(style: CSSProperties, children?: ReactNode): ReactElement {
  return { type: 'div', key: null, props: { style, children } };
}

export function createOgCard(content: OgContent): ReactElement {
  const accent = accentColors[content.accent];
  return createElement(
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: layout.padding,
      backgroundColor: palette.background,
      color: palette.foreground,
      fontFamily: FONT_FAMILY,
    },
    [
      createElement({ display: 'flex', flexDirection: 'column', gap: layout.stackGap }, [
        createElement({
          width: layout.accentBar.width,
          height: layout.accentBar.height,
          borderRadius: layout.accentBar.radius,
          backgroundColor: accent,
        }),
        createElement(
          { fontSize: layout.labelSize, fontWeight: BOLD_WEIGHT, color: accent },
          content.label,
        ),
        createElement(
          {
            fontSize: layout.titleSize,
            fontWeight: BOLD_WEIGHT,
            lineHeight: layout.titleLineHeight,
          },
          content.title,
        ),
        createElement(
          {
            fontSize: layout.summarySize,
            lineHeight: layout.summaryLineHeight,
            color: palette.muted,
          },
          content.summary,
        ),
      ]),
      createElement({ fontSize: layout.siteTitleSize, fontWeight: BOLD_WEIGHT }, content.siteTitle),
    ],
  );
}

export async function renderOgImage(content: OgContent): Promise<Buffer> {
  const svg = await satori(createOgCard(content), {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: await getFonts(),
  });
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();
}
