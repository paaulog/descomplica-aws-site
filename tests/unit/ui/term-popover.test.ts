import { describe, expect, it } from 'vitest';
import { resolveClickAction } from '@/lib/ui/term-popover';

describe('resolveClickAction', () => {
  it('mantém aberto no clique do mouse, que já abriu pelo hover', () => {
    expect(resolveClickAction('mouse', true)).toBe('show');
    expect(resolveClickAction('mouse', false)).toBe('show');
  });

  it('alterna no toque', () => {
    expect(resolveClickAction('touch', false)).toBe('show');
    expect(resolveClickAction('touch', true)).toBe('hide');
  });

  it('alterna pelo teclado, que não tem pointerType', () => {
    expect(resolveClickAction('', true)).toBe('hide');
    expect(resolveClickAction('', false)).toBe('show');
  });
});
