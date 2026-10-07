import { describe, expect, it } from 'vitest';
import { pricing } from '@/data/pricing';
import { estimateMonthlyCost, roundPrice, type CostInput } from '@/lib/s3/cost';
import { createTestPricing } from './pricing-fixture';

const zero: CostInput = {
  storageClass: 'STANDARD',
  storageGb: 0,
  putRequests: 0,
  getRequests: 0,
  retrievalGb: 0,
  transferOutGb: 0,
};

describe('estimateMonthlyCost', () => {
  it('dá zero em tudo com entradas zeradas', () => {
    expect(estimateMonthlyCost(zero, pricing)).toEqual({
      storage: 0,
      requests: 0,
      retrieval: 0,
      monitoring: 0,
      transfer: 0,
      total: 0,
      billableTransferGb: 0,
    });
  });

  it('trata valores negativos, NaN e infinitos como zero', () => {
    const cost = estimateMonthlyCost(
      { ...zero, storageGb: -5, putRequests: Number.NaN, transferOutGb: Infinity },
      pricing,
    );
    expect(cost.total).toBe(0);
  });

  it('usa só a tabela recebida', () => {
    const cost = estimateMonthlyCost(
      { ...zero, storageGb: 10, putRequests: 2000, getRequests: 3000, transferOutGb: 150 },
      createTestPricing(),
    );
    expect(cost).toEqual({
      storage: 10,
      requests: 23,
      retrieval: 0,
      monitoring: 0,
      transfer: 100,
      total: 133,
      billableTransferGb: 50,
    });
  });

  it('não cobra transferência dentro da franquia, nem no limite exato', () => {
    const table = createTestPricing();
    expect(estimateMonthlyCost({ ...zero, transferOutGb: 100 }, table).transfer).toBe(0);
    expect(estimateMonthlyCost({ ...zero, transferOutGb: 101 }, table).transfer).toBe(2);
  });

  it('cobra recuperação e monitoramento só nas classes que têm essas taxas', () => {
    const table = createTestPricing();
    const reading: CostInput = { ...zero, retrievalGb: 2, objectCount: 1000 };
    expect(estimateMonthlyCost(reading, table).retrieval).toBe(0);
    expect(estimateMonthlyCost(reading, table).monitoring).toBe(0);
    expect(estimateMonthlyCost({ ...reading, storageClass: 'STANDARD_IA' }, table).retrieval).toBe(
      6,
    );
    expect(
      estimateMonthlyCost({ ...reading, storageClass: 'INTELLIGENT_TIERING' }, table).monitoring,
    ).toBe(2);
  });

  it('calcula um caso real do S3 Standard com os preços conferidos', () => {
    const cost = estimateMonthlyCost(
      { ...zero, storageGb: 100, putRequests: 10_000, getRequests: 100_000, transferOutGb: 200 },
      pricing,
    );
    expect(cost.storage).toBe(2.3);
    expect(cost.requests).toBe(0.09);
    expect(cost.transfer).toBe(9);
    expect(cost.total).toBe(11.39);
  });

  it('arredonda para 4 casas e evita ruído de ponto flutuante', () => {
    expect(estimateMonthlyCost({ ...zero, getRequests: 1 }, pricing).requests).toBe(0);
    expect(estimateMonthlyCost({ ...zero, getRequests: 1000 }, pricing).requests).toBe(0.0004);
    expect(roundPrice(0.1 + 0.2)).toBe(0.3);
    expect(roundPrice(0.00005)).toBe(0.0001);
    expect(roundPrice(0.00004)).toBe(0);
  });
});
