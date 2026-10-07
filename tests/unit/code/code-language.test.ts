// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  CODE_LANGUAGE_STORAGE_KEY,
  isCodeLanguage,
  readStoredCodeLanguage,
  saveCodeLanguage,
} from '@/lib/code/code-language';

describe('linguagem do código', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reconhece só as linguagens das abas', () => {
    expect(isCodeLanguage('js')).toBe(true);
    expect(isCodeLanguage('python')).toBe(true);
    expect(isCodeLanguage('ruby')).toBe(false);
    expect(isCodeLanguage(null)).toBe(false);
  });

  it('grava e lê a escolha em da:code-lang', () => {
    expect(readStoredCodeLanguage()).toBeNull();
    saveCodeLanguage('python');
    expect(localStorage.getItem(CODE_LANGUAGE_STORAGE_KEY)).toBe('python');
    expect(readStoredCodeLanguage()).toBe('python');
  });

  it('ignora um valor salvo inválido', () => {
    localStorage.setItem(CODE_LANGUAGE_STORAGE_KEY, 'cobol');
    expect(readStoredCodeLanguage()).toBeNull();
  });
});
