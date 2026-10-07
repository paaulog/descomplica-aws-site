import { describe, expect, it } from 'vitest';
import { pricing } from '@/data/pricing';
import { estimateMonthlyCost } from '@/lib/s3/cost';
import { costPresetNames, costPresets, toStandardCostInput } from '@/lib/s3/cost-presets';

const estimate = (name: (typeof costPresetNames)[number]) =>
  estimateMonthlyCost(toStandardCostInput(costPresets[name]), pricing);

describe('exemplos da calculadora', () => {
  it('calculam no S3 Standard, sem recuperação', () => {
    expect(toStandardCostInput(costPresets.backup)).toEqual({
      storageClass: 'STANDARD',
      retrievalGb: 0,
      ...costPresets.backup,
    });
  });

  it('mostram um site pessoal custando poucos centavos', () => {
    expect(estimate('personalSite').total).toBeLessThan(0.1);
  });

  it('têm, cada um, um peso principal diferente', () => {
    expect(estimate('photoApp').transfer).toBeGreaterThan(estimate('photoApp').storage);
    expect(estimate('backup').storage).toBeGreaterThan(estimate('backup').transfer);
    expect(estimate('personalSite').requests).toBeGreaterThan(estimate('personalSite').transfer);
  });
});
