import { describe, expect, it } from 'vitest';
import { createFakeEtag, DEFAULT_CONTENT_TYPE, normalizePrefix, toS3Object } from '@/lib/s3/object';

const photo = { name: 'praia.jpg', size: 2_457_600, type: 'image/jpeg' };
const now = new Date('2026-01-05T09:00:00Z');

describe('toS3Object', () => {
  it('usa o nome como chave quando não há prefixo', () => {
    expect(toS3Object(photo, '', now)).toEqual({
      key: 'praia.jpg',
      size: 2_457_600,
      contentType: 'image/jpeg',
      lastModified: '2026-01-05T09:00:00.000Z',
      etag: createFakeEtag('praia.jpg', photo),
    });
  });

  it('põe o prefixo na frente do nome', () => {
    expect(toS3Object(photo, 'fotos/2026/', now).key).toBe('fotos/2026/praia.jpg');
  });

  it('completa a barra que falta no prefixo', () => {
    expect(toS3Object(photo, 'fotos', now).key).toBe('fotos/praia.jpg');
  });

  it('gera um ETag determinístico, no formato de 32 hexadecimais entre aspas', () => {
    const first = toS3Object(photo, 'fotos/', now).etag;
    expect(toS3Object(photo, 'fotos/', new Date()).etag).toBe(first);
    expect(first).toMatch(/^"[0-9a-f]{32}"$/);
  });

  it('muda o ETag quando a chave, o tamanho ou o tipo mudam', () => {
    const base = toS3Object(photo, '', now).etag;
    expect(toS3Object(photo, 'outra/', now).etag).not.toBe(base);
    expect(toS3Object({ ...photo, size: 1 }, '', now).etag).not.toBe(base);
    expect(toS3Object({ ...photo, type: 'image/png' }, '', now).etag).not.toBe(base);
  });

  it('usa o tipo padrão do S3 quando o arquivo não tem contentType', () => {
    expect(toS3Object({ ...photo, type: '' }, '', now).contentType).toBe(DEFAULT_CONTENT_TYPE);
  });

  it('usa a hora atual quando nenhuma é informada', () => {
    const before = Date.now();
    const lastModified = Date.parse(toS3Object(photo).lastModified);
    expect(lastModified).toBeGreaterThanOrEqual(before);
  });
});

describe('normalizePrefix', () => {
  it('mantém vazio e prefixos que já terminam em barra', () => {
    expect(normalizePrefix('')).toBe('');
    expect(normalizePrefix('   ')).toBe('');
    expect(normalizePrefix('fotos/')).toBe('fotos/');
  });

  it('tira espaços das pontas', () => {
    expect(normalizePrefix(' fotos ')).toBe('fotos/');
  });
});
