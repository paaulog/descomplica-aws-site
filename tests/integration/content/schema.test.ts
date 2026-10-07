import { describe, expect, it } from 'vitest';
import { glossarySchema, sectionSchema } from '@/lib/content/schemas';

const validSection = {
  service: 's3',
  key: 'storage-classes',
  order: 11,
  block: 'how',
  anchor: 'classes-de-armazenamento',
  title: 'Classes de armazenamento',
  navLabel: 'Classes de armazenamento',
  summary: 'Quanto menos você acessa, mais barato fica.',
};

interface ParseResult {
  error?: { issues: { path: PropertyKey[] }[] };
}

const issuePaths = (result: ParseResult) =>
  result.error?.issues.map((issue) => issue.path.join('.')) ?? [];

describe('schema de seção', () => {
  it('aceita um frontmatter válido', () => {
    expect(sectionSchema.safeParse(validSection).success).toBe(true);
  });

  it('rejeita navLabel com mais de 28 caracteres', () => {
    expect(
      issuePaths(sectionSchema.safeParse({ ...validSection, navLabel: 'x'.repeat(29) })),
    ).toEqual(['navLabel']);
    expect(sectionSchema.safeParse({ ...validSection, navLabel: 'x'.repeat(28) }).success).toBe(
      true,
    );
  });

  it('rejeita block inválido', () => {
    expect(issuePaths(sectionSchema.safeParse({ ...validSection, block: 'intro' }))).toEqual([
      'block',
    ]);
  });

  it('rejeita order fora de 1–18', () => {
    expect(issuePaths(sectionSchema.safeParse({ ...validSection, order: 0 }))).toEqual(['order']);
    expect(issuePaths(sectionSchema.safeParse({ ...validSection, order: 19 }))).toEqual(['order']);
  });

  it('rejeita anchor e key que não são slug', () => {
    const result = sectionSchema.safeParse({ ...validSection, key: 'Storage', anchor: 'a b' });
    expect(issuePaths(result).sort()).toEqual(['anchor', 'key']);
  });

  it('rejeita serviço desconhecido', () => {
    expect(issuePaths(sectionSchema.safeParse({ ...validSection, service: 'rds' }))).toEqual([
      'service',
    ]);
  });
});

describe('schema de glossário', () => {
  it('aceita termos válidos', () => {
    const result = glossarySchema.safeParse({
      bucket: { term: 'bucket', definition: 'Um contêiner para objetos.' },
    });
    expect(result.success).toBe(true);
  });

  it('rejeita definition com mais de 160 caracteres', () => {
    const result = glossarySchema.safeParse({
      bucket: { term: 'bucket', definition: 'x'.repeat(161) },
    });
    expect(issuePaths(result)).toEqual(['bucket.definition']);
  });

  it('rejeita key que não é slug', () => {
    const result = glossarySchema.safeParse({ 'Bucket S3': { term: 'b', definition: 'd' } });
    expect(result.success).toBe(false);
  });
});
