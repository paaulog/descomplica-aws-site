import { describe, expect, it } from 'vitest';
import { pricing } from '@/data/pricing';
import {
  accessFrequencies,
  recommendStorageClass,
  type AccessProfile,
  type StorageClass,
} from '@/lib/s3/storage-class';
import { createTestPricing } from './pricing-fixture';

const recommend = (frequency: AccessProfile['frequency'], retentionDays = 365) =>
  recommendStorageClass({ frequency, retentionDays }, pricing);

describe('recommendStorageClass', () => {
  it.each<[AccessProfile['frequency'], StorageClass]>([
    ['daily', 'STANDARD'],
    ['weekly', 'STANDARD'],
    ['monthly', 'STANDARD_IA'],
    ['quarterly', 'GLACIER_IR'],
    ['yearly', 'GLACIER'],
    ['rarely', 'DEEP_ARCHIVE'],
  ])('recomenda a classe certa para "%s"', (frequency, expected) => {
    expect(recommend(frequency).storageClass).toBe(expected);
  });

  it('nunca recomenda uma classe mais quente para um acesso mais raro', () => {
    const order: StorageClass[] = [
      'STANDARD',
      'STANDARD_IA',
      'GLACIER_IR',
      'GLACIER',
      'DEEP_ARCHIVE',
    ];
    const ranks = accessFrequencies.map((frequency) =>
      order.indexOf(recommend(frequency).storageClass),
    );
    expect(ranks).toEqual(ranks.toSorted((first, second) => first - second));
  });

  it('recomenda Intelligent-Tiering para o perfil "não sei", sem avisos', () => {
    expect(recommend('unknown')).toEqual({ storageClass: 'INTELLIGENT_TIERING', warnings: [] });
  });

  it('não avisa nada no S3 Standard', () => {
    expect(recommend('daily', 1).warnings).toEqual([]);
  });

  it('avisa da duração mínima só quando os dados saem antes dela', () => {
    expect(recommend('monthly', 29).warnings).toContainEqual({ type: 'minDuration', minDays: 30 });
    expect(recommend('monthly', 30).warnings).not.toContainEqual(
      expect.objectContaining({ type: 'minDuration' }),
    );
    expect(recommend('rarely', 179).warnings).toContainEqual({
      type: 'minDuration',
      minDays: 180,
    });
  });

  it('avisa do custo de recuperação com o preço da tabela recebida', () => {
    expect(recommend('quarterly').warnings).toContainEqual({ type: 'retrievalFee', perGb: 0.03 });
    expect(
      recommendStorageClass({ frequency: 'monthly', retentionDays: 365 }, createTestPricing())
        .warnings,
    ).toContainEqual({ type: 'retrievalFee', perGb: 3 });
  });

  it('avisa da recuperação demorada só nas classes de arquivo', () => {
    const isSlow = (frequency: AccessProfile['frequency']) =>
      recommend(frequency).warnings.some((warning) => warning.type === 'slowRetrieval');
    expect(isSlow('quarterly')).toBe(false);
    expect(isSlow('yearly')).toBe(true);
    expect(isSlow('rarely')).toBe(true);
  });
});
