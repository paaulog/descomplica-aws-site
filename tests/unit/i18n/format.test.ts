import { describe, expect, it } from 'vitest';
import { formatBytes, formatCurrency } from '../../../src/lib/i18n/format';

// Intl usa espaço não separável entre símbolo e número; normaliza para comparar.
const plain = (value: string) => value.replace(/\s/g, ' ');

describe('formatCurrency', () => {
  it('formata BRL em pt-BR', () => {
    expect(plain(formatCurrency(1234.5, 'pt-br', 'BRL'))).toBe('R$ 1.234,50');
  });

  it('formata USD em en', () => {
    expect(formatCurrency(1234.5, 'en', 'USD')).toBe('$1,234.50');
  });

  it('formata USD no padrão pt-BR sem converter o valor', () => {
    expect(plain(formatCurrency(0.023, 'pt-br', 'USD'))).toBe('US$ 0,02');
  });

  it('formata zero', () => {
    expect(formatCurrency(0, 'en', 'USD')).toBe('$0.00');
  });

  it('mostra frações de centavo de preços unitários quando pedido', () => {
    expect(formatCurrency(0.023, 'en', 'USD', { maximumFractionDigits: 4 })).toBe('$0.023');
    expect(plain(formatCurrency(0.0125, 'pt-br', 'USD', { maximumFractionDigits: 4 }))).toBe(
      'US$ 0,0125',
    );
    expect(formatCurrency(5, 'en', 'USD', { maximumFractionDigits: 4 })).toBe('$5.00');
  });
});

describe('formatBytes', () => {
  it('mantém bytes abaixo de 1 KB', () => {
    expect(formatBytes(0, 'en')).toBe('0 B');
    expect(formatBytes(512, 'en')).toBe('512 B');
  });

  it('formata KB, MB e GB em base 1024', () => {
    expect(formatBytes(1024, 'en')).toBe('1 KB');
    expect(formatBytes(1536, 'en')).toBe('1.5 KB');
    expect(formatBytes(5 * 1024 ** 2, 'en')).toBe('5 MB');
    expect(formatBytes(2.25 * 1024 ** 3, 'en')).toBe('2.25 GB');
  });

  it('sobe de unidade quando o arredondamento chega a 1024', () => {
    expect(formatBytes(1024 ** 2 - 1, 'en')).toBe('1 MB');
    expect(formatBytes(1024 ** 3 - 1, 'en')).toBe('1 GB');
    expect(formatBytes(1023, 'en')).toBe('1,023 B');
  });

  it('usa a vírgula decimal em pt-BR', () => {
    expect(formatBytes(1536, 'pt-br')).toBe('1,5 KB');
    expect(formatBytes(1.75 * 1024 ** 2, 'pt-br')).toBe('1,75 MB');
  });

  it('para no TB', () => {
    expect(formatBytes(2048 * 1024 ** 4, 'en')).toBe('2,048 TB');
  });

  it('rejeita tamanhos inválidos', () => {
    expect(() => formatBytes(-1, 'en')).toThrow(RangeError);
    expect(() => formatBytes(Number.NaN, 'en')).toThrow(RangeError);
  });
});
