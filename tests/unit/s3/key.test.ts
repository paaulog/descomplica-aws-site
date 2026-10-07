import { describe, expect, it } from 'vitest';
import { MAX_KEY_BYTES, parseKey } from '@/lib/s3/key';

describe('parseKey', () => {
  it('separa prefixos e nome do arquivo de fotos/2026/praia.jpg', () => {
    expect(parseKey('fotos/2026/praia.jpg')).toEqual({
      valid: true,
      errors: [],
      warnings: [],
      byteLength: 20,
      segments: ['fotos', '2026', 'praia.jpg'],
      prefixes: ['fotos/', 'fotos/2026/'],
      fileName: 'praia.jpg',
    });
  });

  it('trata chave sem barra como objeto na raiz do bucket', () => {
    const result = parseKey('praia.jpg');
    expect(result.prefixes).toEqual([]);
    expect(result.fileName).toBe('praia.jpg');
  });

  it('marca barra final como "pasta" vazia, sem nome de arquivo', () => {
    const result = parseKey('fotos/2026/');
    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual(['trailingSlash']);
    expect(result.prefixes).toEqual(['fotos/', 'fotos/2026/']);
    expect(result.fileName).toBe('');
  });

  it('aceita a//b, mas avisa do segmento vazio', () => {
    const result = parseKey('a//b');
    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual(['doubleSlash']);
    expect(result.segments).toEqual(['a', '', 'b']);
    expect(result.prefixes).toEqual(['a/', 'a//']);
  });

  it('aceita barra inicial, mas avisa da "pasta" sem nome', () => {
    const result = parseKey('/praia.jpg');
    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual(['leadingSlash']);
    expect(result.prefixes).toEqual(['/']);
  });

  it('não confunde a chave "/" com barra final', () => {
    expect(parseKey('/').warnings).toEqual(['leadingSlash']);
  });

  it('conta bytes em UTF-8, não caracteres', () => {
    const result = parseKey('fotos/férias/😀.png');
    expect(result.valid).toBe(true);
    expect(result.byteLength).toBe(new TextEncoder().encode('fotos/férias/😀.png').length);
    expect(result.byteLength).toBeGreaterThan('fotos/férias/😀.png'.length);
    expect(result.fileName).toBe('😀.png');
  });

  it(`aceita exatamente ${MAX_KEY_BYTES} bytes e recusa um a mais`, () => {
    expect(parseKey('a'.repeat(MAX_KEY_BYTES)).valid).toBe(true);
    const tooLong = parseKey('a'.repeat(MAX_KEY_BYTES + 1));
    expect(tooLong.valid).toBe(false);
    expect(tooLong.errors).toEqual(['tooLong']);
  });

  it('recusa chave que só passa do limite por causa de caracteres multibyte', () => {
    const key = 'é'.repeat(MAX_KEY_BYTES / 2 + 1);
    expect(key.length).toBeLessThan(MAX_KEY_BYTES);
    expect(parseKey(key).errors).toEqual(['tooLong']);
  });

  it('recusa chave vazia', () => {
    expect(parseKey('')).toEqual({
      valid: false,
      errors: ['empty'],
      warnings: [],
      byteLength: 0,
      segments: [],
      prefixes: [],
      fileName: '',
    });
  });
});
