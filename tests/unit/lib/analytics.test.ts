import { describe, expect, it } from 'vitest';
import { track, type AnalyticsEvent } from '@/lib/analytics';

describe('track', () => {
  it('aceita os eventos previstos sem efeito colateral', () => {
    expect(track({ name: 'interaction_used', island: 'KeyExplorer' })).toBeUndefined();
    expect(track({ name: 'section_view', section: 'hero', locale: 'pt-br' })).toBeUndefined();
  });

  it('não lança erro com payload inválido', () => {
    const invalid = [null, undefined, 42, 'texto', {}, { name: 'desconhecido' }];
    for (const payload of invalid) {
      expect(() => track(payload as unknown as AnalyticsEvent)).not.toThrow();
    }
  });

  it('não lança erro com um objeto que explode ao ser lido', () => {
    const hostile = new Proxy(
      {},
      {
        get() {
          throw new Error('boom');
        },
      },
    );
    expect(() => track(hostile as AnalyticsEvent)).not.toThrow();
  });
});
