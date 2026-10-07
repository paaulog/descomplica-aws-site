// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyTheme,
  DARK_SCHEME_QUERY,
  getNextTheme,
  getOppositeTheme,
  getPreferredTheme,
  readStoredTheme,
  saveTheme,
  THEME_STORAGE_KEY,
} from '@/lib/theme/theme';

function mockSystemTheme(prefersDark: boolean) {
  const matchMedia = vi.fn((query: string) => ({ matches: prefersDark, media: query }));
  vi.stubGlobal('matchMedia', matchMedia);
  return matchMedia;
}

describe('tema', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('usa o tema salvo em da:theme', () => {
    const matchMedia = mockSystemTheme(true);
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    expect(getPreferredTheme()).toBe('light');
    expect(matchMedia).not.toHaveBeenCalled();
  });

  it('cai no tema do sistema quando não há valor salvo', () => {
    const matchMedia = mockSystemTheme(true);
    expect(getPreferredTheme()).toBe('dark');
    expect(matchMedia).toHaveBeenCalledWith(DARK_SCHEME_QUERY);
    mockSystemTheme(false);
    expect(getPreferredTheme()).toBe('light');
  });

  it('ignora um valor salvo inválido', () => {
    mockSystemTheme(false);
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    expect(readStoredTheme()).toBeNull();
    expect(getPreferredTheme()).toBe('light');
  });

  it('grava a escolha ao alternar', () => {
    mockSystemTheme(false);
    saveTheme(getOppositeTheme(getPreferredTheme()));
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(getPreferredTheme()).toBe('dark');
  });

  it('continua funcionando quando o localStorage está bloqueado', () => {
    mockSystemTheme(true);
    const blocked = () => {
      throw new Error('SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
    expect(getPreferredTheme()).toBe('dark');
    expect(() => saveTheme('light')).not.toThrow();
  });

  it('alterna a partir do tema na tela mesmo com o armazenamento bloqueado', () => {
    mockSystemTheme(false);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    applyTheme('light');
    const first = getNextTheme();
    applyTheme(first);
    expect([first, getNextTheme()]).toEqual(['dark', 'light']);
  });

  it('aplica o tema no <html>', () => {
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
