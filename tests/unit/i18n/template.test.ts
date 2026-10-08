import { describe, expect, it } from 'vitest';
import { fillTemplate } from '@/lib/i18n/template';

describe('fillTemplate', () => {
  it('troca os marcadores pelos valores', () => {
    expect(fillTemplate('{bytes} de {max} bytes', { bytes: 20, max: 1024 })).toBe(
      '20 de 1024 bytes',
    );
  });

  it('repete o mesmo valor em vários marcadores', () => {
    expect(fillTemplate('{a} e {a}', { a: 'x' })).toBe('x e x');
  });

  it('deixa visíveis os marcadores sem valor', () => {
    expect(fillTemplate('Dia {day}', {})).toBe('Dia {day}');
  });

  it('não usa propriedades herdadas como valor', () => {
    expect(fillTemplate('{constructor}', {})).toBe('{constructor}');
  });
});
