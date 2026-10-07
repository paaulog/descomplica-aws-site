import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { serviceIds } from '@/data/services';

const css = readFileSync(new URL('../../../src/styles/global.css', import.meta.url), 'utf8');

describe('tokens de destaque', () => {
  it('cada serviço tem uma cor de destaque em global.css', () => {
    for (const id of serviceIds) expect(css, id).toContain(`[data-service='${id}']`);
  });
});
