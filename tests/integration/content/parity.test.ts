import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getActiveServices } from '@/data/services';
import { findParityIssues, LocaleParityError, selectServiceSections } from '@/lib/content/parity';
import { loadSections } from './load-sections';

const contentDir = fileURLToPath(new URL('../../../src/content/sections', import.meta.url));
const fixture = (name: string) =>
  loadSections(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)));

describe('paridade de conteúdo', () => {
  it('passa com o conteúdo real de todo serviço ativo', () => {
    const sections = loadSections(contentDir);
    for (const service of getActiveServices()) {
      expect(findParityIssues(service.id, sections)).toEqual([]);
    }
  });

  it('falha quando falta uma seção num idioma', () => {
    expect(findParityIssues('s3', fixture('missing-section'))).toEqual([
      's3/en: falta a seção "problem" que existe em pt-br',
    ]);
  });

  it('falha quando a key diverge entre idiomas', () => {
    expect(findParityIssues('s3', fixture('key-mismatch'))).toEqual([
      's3/en: falta a seção "hero" que existe em pt-br',
      's3/en: seção "intro" não existe em pt-br',
    ]);
  });

  it('falha com order duplicado', () => {
    expect(findParityIssues('s3', fixture('duplicate-order'))).toEqual([
      's3/pt-br: order "1" repetido',
      's3/en: order "1" repetido',
    ]);
  });

  it('falha com anchor repetida', () => {
    expect(findParityIssues('s3', fixture('duplicate-anchor'))).toEqual([
      's3/pt-br: anchor "abertura" repetido',
    ]);
  });

  it('falha quando um serviço não tem conteúdo', () => {
    expect(findParityIssues('ec2', loadSections(contentDir))).toEqual([
      'ec2/pt-br: nenhuma seção encontrada',
      'ec2/en: nenhuma seção encontrada',
    ]);
  });

  it('falha quando o service do frontmatter difere da pasta', () => {
    const [entry] = fixture('missing-section');
    if (!entry) throw new Error('fixture vazia');
    const issues = findParityIssues('s3', [{ ...entry, data: { ...entry.data, service: 'ec2' } }]);
    expect(issues).toContain(`${entry.id}: service "ec2" difere da pasta "s3"`);
  });

  it('falha quando um arquivo do serviço está numa pasta com outro nome', () => {
    const sections = fixture('duplicate-anchor');
    const [first] = sections;
    if (!first) throw new Error('fixture vazia');
    const misplaced = { ...first, id: first.id.replace(/^s3\//, 'S3/') };
    expect(findParityIssues('s3', [...sections, misplaced])).toContain(
      `${misplaced.id}: service "s3" difere da pasta "S3"`,
    );
  });

  it('seleciona só as seções do serviço e idioma, ordenadas por order', () => {
    const sections = fixture('duplicate-anchor').toReversed();
    const ids = selectServiceSections(sections, 's3', 'pt-br').map(({ id }) => id);
    expect(ids).toEqual(['s3/pt-br/01-hero', 's3/pt-br/02-problem']);
  });

  it('não seleciona seções de outro serviço', () => {
    expect(selectServiceSections(fixture('duplicate-anchor'), 'ec2', 'en')).toEqual([]);
  });

  it('monta uma mensagem de erro legível com todos os problemas', () => {
    const error = new LocaleParityError('s3', ['a', 'b']);
    expect(error.message).toBe('Conteúdo de "s3" inválido entre idiomas:\n  - a\n  - b');
  });
});
