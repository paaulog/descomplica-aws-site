import { describe, expect, it } from 'vitest';
import {
  checkGlossaryUsage,
  findGlossaryEntry,
  findTermIds,
  GlossaryTermError,
} from '@/lib/content/glossary';

const glossary = { bucket: { term: 'bucket', definition: 'Um contêiner.' } };

describe('findGlossaryEntry', () => {
  it('encontra o termo pela key', () => {
    expect(findGlossaryEntry(glossary, 'bucket', 'pt-br')).toEqual(glossary.bucket);
  });

  it('não aceita chaves herdadas do protótipo', () => {
    expect(() => findGlossaryEntry(glossary, 'constructor', 'pt-br')).toThrow(GlossaryTermError);
  });

  it('lança um erro que aponta o arquivo do glossário', () => {
    expect(() => findGlossaryEntry(glossary, 'nao-existe', 'en')).toThrow(GlossaryTermError);
    expect(() => findGlossaryEntry(glossary, 'nao-existe', 'en')).toThrow(
      '<Term id="nao-existe">: o termo não existe no glossário en (src/content/glossary/en.yaml)',
    );
  });
});

describe('findTermIds', () => {
  it('acha os ids de <Term>, com e sem rótulo', () => {
    const source = 'Um <Term id="bucket" /> guarda <Term id="object">objetos</Term>.';
    expect(findTermIds(source)).toEqual(['bucket', 'object']);
  });

  it('devolve lista vazia sem <Term>', () => {
    expect(findTermIds('Só texto.')).toEqual([]);
  });
});

describe('checkGlossaryUsage', () => {
  it('separa termos ausentes do glossário e termos sem uso', () => {
    const usage = checkGlossaryUsage(glossary, ['region', 'region']);
    expect(usage).toEqual({ missing: ['region'], unused: ['bucket'] });
  });

  it('não acusa nada quando uso e glossário batem', () => {
    expect(checkGlossaryUsage(glossary, ['bucket'])).toEqual({ missing: [], unused: [] });
  });
});
