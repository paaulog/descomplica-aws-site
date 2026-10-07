import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { services } from '../../src/data/services';

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
});
