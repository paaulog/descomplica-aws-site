import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { services } from '../../src/data/services';
import { SITE_URL as SITE } from '../../src/data/site';
import { locales } from '../../src/lib/i18n/ui';
import { OG_HEIGHT, OG_WIDTH } from '../../src/lib/og/paths';

const IHDR_WIDTH_OFFSET = 16;
const IHDR_HEIGHT_OFFSET = 20;

const root = fileURLToPath(new URL('../..', import.meta.url));
const astroBin = join(root, 'node_modules/astro/bin/astro.mjs');
let outDir: string;

const page = (route: string) => join(outDir, route, 'index.html');

describe('astro build', () => {
  beforeAll(() => {
    outDir = mkdtempSync(join(tmpdir(), 'descomplica-build-'));
    execFileSync(process.execPath, [astroBin, 'build', '--outDir', outDir], {
      cwd: root,
      stdio: 'pipe',
    });
  });

  afterAll(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true });
  });

  it('gera as homes nos dois idiomas com o lang certo', () => {
    expect(readFileSync(page('/'), 'utf8')).toContain('<html lang="pt-BR"');
    expect(readFileSync(page('/en/'), 'utf8')).toContain('<html lang="en"');
  });

  it('gera só as rotas dos serviços ativos', () => {
    for (const service of services) {
      const expected = service.status === 'active';
      expect(existsSync(page(`/${service.id}/`)), `/${service.id}/`).toBe(expected);
      expect(existsSync(page(`/en/${service.id}/`)), `/en/${service.id}/`).toBe(expected);
    }
  });

  it('renderiza as seções com as âncoras localizadas', () => {
    expect(readFileSync(page('/s3/'), 'utf8')).toContain('<section id="abertura"');
    expect(readFileSync(page('/en/s3/'), 'utf8')).toContain('<section id="opening"');
  });

  it.each(locales)('gera os PNGs de OG de 1200×630 (%s)', (locale) => {
    for (const slug of ['home', 's3']) {
      const png = readFileSync(join(outDir, 'og', locale, `${slug}.png`));
      expect(png.readUInt32BE(IHDR_WIDTH_OFFSET), slug).toBe(OG_WIDTH);
      expect(png.readUInt32BE(IHDR_HEIGHT_OFFSET), slug).toBe(OG_HEIGHT);
    }
  });

  it('lista no sitemap as quatro rotas e nenhum serviço em breve', () => {
    const sitemap = readFileSync(join(outDir, 'sitemap-0.xml'), 'utf8');
    const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);
    expect(routes.toSorted()).toEqual([`${SITE}/`, `${SITE}/en/`, `${SITE}/en/s3/`, `${SITE}/s3/`]);
    for (const service of services.filter(({ status }) => status === 'soon')) {
      expect(sitemap).not.toContain(`/${service.id}/`);
    }
  });

  it('aponta o robots.txt para o sitemap', () => {
    expect(readFileSync(join(outDir, 'robots.txt'), 'utf8')).toContain(
      `Sitemap: ${SITE}/sitemap-index.xml`,
    );
  });
});
