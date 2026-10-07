import { describe, expect, it } from 'vitest';
import { mapAnchors, parseAnchorMap, translateHref } from '@/lib/i18n/anchors';

const ptBr = [
  { key: 'hero', anchor: 'abertura' },
  { key: 'storage-classes', anchor: 'classes-de-armazenamento' },
];
const en = [
  { key: 'storage-classes', anchor: 'storage-classes' },
  { key: 'hero', anchor: 'opening' },
];

describe('mapAnchors', () => {
  it('leva a âncora de pt-BR para a de en pela key', () => {
    expect(mapAnchors(ptBr, en)).toEqual({
      abertura: 'opening',
      'classes-de-armazenamento': 'storage-classes',
    });
  });

  it('faz o caminho de volta', () => {
    const toPtBr = mapAnchors(en, ptBr);
    for (const [anchor, translated] of Object.entries(mapAnchors(ptBr, en))) {
      expect(toPtBr[translated]).toBe(anchor);
    }
  });

  it('omite seções sem par no outro idioma', () => {
    expect(mapAnchors([...ptBr, { key: 'extra', anchor: 'extra' }], en)).not.toHaveProperty(
      'extra',
    );
  });
});

describe('translateHref', () => {
  const anchorMap = mapAnchors(ptBr, en);

  it('acrescenta a âncora traduzida', () => {
    expect(translateHref('/en/s3/', 'classes-de-armazenamento', anchorMap)).toBe(
      '/en/s3/#storage-classes',
    );
  });

  it('troca um hash antigo', () => {
    expect(translateHref('/en/s3/#opening', 'classes-de-armazenamento', anchorMap)).toBe(
      '/en/s3/#storage-classes',
    );
  });

  it('ignora chaves herdadas do protótipo', () => {
    expect(translateHref('/en/s3/', 'constructor', parseAnchorMap('{}'))).toBe('/en/s3/');
    expect(translateHref('/en/s3/', 'toString', anchorMap)).toBe('/en/s3/');
  });

  it('volta para o topo quando a seção atual não é conhecida', () => {
    expect(translateHref('/en/s3/#opening', '', anchorMap)).toBe('/en/s3/');
    expect(translateHref('/en/', 'qualquer', {})).toBe('/en/');
  });
});

describe('parseAnchorMap', () => {
  it('lê o mapa serializado', () => {
    expect(parseAnchorMap('{"abertura":"opening"}')).toEqual({ abertura: 'opening' });
  });

  it('devolve um mapa vazio para entradas inválidas', () => {
    expect(parseAnchorMap(undefined)).toEqual({});
    expect(parseAnchorMap('isto não é json')).toEqual({});
    expect(parseAnchorMap('null')).toEqual({});
  });

  it('descarta valores que não são texto', () => {
    expect(parseAnchorMap('{"a":1,"b":"c"}')).toEqual({ b: 'c' });
  });
});
