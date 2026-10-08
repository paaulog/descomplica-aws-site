import { describe, expect, it } from 'vitest';
import { pricing } from '@/data/pricing';
import { compareScenarioCosts, estimateScenarioCost } from '@/lib/s3/scenario';
import {
  accessFrequencies,
  recommendStorageClass,
  storageClasses,
  type AccessFrequency,
  type StorageClass,
} from '@/lib/s3/storage-class';

// How long the first byte takes: milliseconds, then minutes to hours, then up to 12 hours.
const RETRIEVAL_SPEED: Record<StorageClass, number> = {
  STANDARD: 0,
  INTELLIGENT_TIERING: 0,
  STANDARD_IA: 0,
  GLACIER_IR: 0,
  GLACIER: 1,
  DEEP_ARCHIVE: 2,
};

const findCheapest = (frequency: AccessFrequency) =>
  compareScenarioCosts(frequency, pricing).toSorted(
    (first, second) => first.cost.total - second.cost.total,
  )[0]?.storageClass;

describe('cenário do slider de classes', () => {
  it('compara todas as classes, sempre na mesma ordem', () => {
    expect(compareScenarioCosts('daily', pricing).map((entry) => entry.storageClass)).toEqual([
      ...storageClasses,
    ]);
  });

  it('mostra o Standard como o mais barato para acesso diário', () => {
    expect(findCheapest('daily')).toBe('STANDARD');
  });

  it('mostra o Deep Archive como o mais barato para dados quase nunca lidos', () => {
    expect(findCheapest('rarely')).toBe('DEEP_ARCHIVE');
  });

  it('soma a taxa de monitoramento no Intelligent-Tiering', () => {
    const standard = estimateScenarioCost('STANDARD', 'monthly', pricing);
    const tiering = estimateScenarioCost('INTELLIGENT_TIERING', 'monthly', pricing);
    expect(tiering.monitoring).toBe(0.025);
    expect(tiering.total).toBeCloseTo(standard.total + 0.025, 4);
  });

  it('faz a recuperação crescer com a frequência de leitura', () => {
    expect(estimateScenarioCost('STANDARD_IA', 'daily', pricing).retrieval).toBe(30);
    expect(estimateScenarioCost('STANDARD_IA', 'monthly', pricing).retrieval).toBe(1);
  });

  it.each(accessFrequencies)(
    'em "%s", a recomendada é a mais barata entre as classes pelo menos tão rápidas quanto ela',
    (frequency) => {
      const { storageClass } = recommendStorageClass({ frequency, retentionDays: 365 }, pricing);
      const cheapest = compareScenarioCosts(frequency, pricing)
        .filter((entry) => RETRIEVAL_SPEED[entry.storageClass] <= RETRIEVAL_SPEED[storageClass])
        .toSorted((first, second) => first.cost.total - second.cost.total)[0];
      expect(cheapest?.storageClass).toBe(storageClass);
    },
  );
});
