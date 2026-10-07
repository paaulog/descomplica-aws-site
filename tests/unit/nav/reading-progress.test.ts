import { describe, expect, it } from 'vitest';
import { computeReadingProgress } from '@/lib/nav/reading-progress';

const page = { scrollHeight: 3000, viewportHeight: 1000 };

describe('computeReadingProgress', () => {
  it('vai de 0 no topo a 1 no fim', () => {
    expect(computeReadingProgress({ ...page, scrollTop: 0 })).toBe(0);
    expect(computeReadingProgress({ ...page, scrollTop: 2000 })).toBe(1);
  });

  it('chega a 1 mesmo faltando uma fração de pixel', () => {
    expect(computeReadingProgress({ ...page, scrollTop: 1998.5 })).toBe(1);
  });

  it('fica entre 0 e 1 no meio da página', () => {
    expect(computeReadingProgress({ ...page, scrollTop: 999 })).toBeCloseTo(0.5);
  });

  it('considera lida uma página que cabe na tela', () => {
    expect(computeReadingProgress({ scrollTop: 0, scrollHeight: 800, viewportHeight: 800 })).toBe(
      1,
    );
  });

  it('não passa dos limites com o scroll elástico', () => {
    expect(computeReadingProgress({ ...page, scrollTop: -40 })).toBe(0);
    expect(computeReadingProgress({ ...page, scrollTop: 2100 })).toBe(1);
  });
});
