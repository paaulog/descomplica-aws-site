import { describe, expect, it } from 'vitest';
import { lifecycleTimeline, type LifecycleRule } from '@/lib/s3/lifecycle';

const rules: LifecycleRule[] = [
  { afterDays: 30, action: { type: 'transition', to: 'STANDARD_IA' } },
  { afterDays: 90, action: { type: 'transition', to: 'GLACIER' } },
  { afterDays: 365, action: { type: 'expire' } },
];

describe('lifecycleTimeline', () => {
  it('começa no S3 Standard no dia do envio', () => {
    expect(lifecycleTimeline(rules, 0)).toEqual([
      { day: 0, event: 'upload', storageClass: 'STANDARD' },
    ]);
  });

  it('aplica só as regras que já venceram, incluindo a do dia exato', () => {
    expect(lifecycleTimeline(rules, 29)).toHaveLength(1);
    expect(lifecycleTimeline(rules, 30).at(-1)).toEqual({
      day: 30,
      event: 'transition',
      storageClass: 'STANDARD_IA',
    });
  });

  it('lista as transições em ordem', () => {
    expect(lifecycleTimeline(rules, 200).map((step) => step.storageClass)).toEqual([
      'STANDARD',
      'STANDARD_IA',
      'GLACIER',
    ]);
  });

  it('encerra a linha na expiração', () => {
    const steps = lifecycleTimeline(
      [...rules, { afterDays: 400, action: { type: 'transition', to: 'DEEP_ARCHIVE' } }],
      500,
    );
    expect(steps.at(-1)).toEqual({ day: 365, event: 'expire', storageClass: null });
    expect(steps).toHaveLength(4);
  });

  it('ordena regras recebidas fora de ordem', () => {
    const shuffled = [rules[2], rules[0], rules[1]] as LifecycleRule[];
    expect(lifecycleTimeline(shuffled, 400)).toEqual(lifecycleTimeline(rules, 400));
  });

  it('ignora transições que voltariam para uma classe mais quente ou para a mesma', () => {
    const steps = lifecycleTimeline(
      [
        { afterDays: 30, action: { type: 'transition', to: 'GLACIER' } },
        { afterDays: 60, action: { type: 'transition', to: 'STANDARD_IA' } },
        { afterDays: 90, action: { type: 'transition', to: 'GLACIER' } },
      ],
      100,
    );
    expect(steps.map((step) => step.day)).toEqual([0, 30]);
  });

  it('não altera a lista de regras recebida', () => {
    const shuffled = [rules[2], rules[0], rules[1]] as LifecycleRule[];
    const copy = [...shuffled];
    lifecycleTimeline(shuffled, 400);
    expect(shuffled).toEqual(copy);
  });

  it('segue a cascata da AWS entre Standard-IA e Intelligent-Tiering', () => {
    const iaToTiering = lifecycleTimeline(
      [
        { afterDays: 30, action: { type: 'transition', to: 'STANDARD_IA' } },
        { afterDays: 60, action: { type: 'transition', to: 'INTELLIGENT_TIERING' } },
      ],
      100,
    );
    expect(iaToTiering.at(-1)?.storageClass).toBe('INTELLIGENT_TIERING');
    const tieringToIa = lifecycleTimeline(
      [
        { afterDays: 30, action: { type: 'transition', to: 'INTELLIGENT_TIERING' } },
        { afterDays: 60, action: { type: 'transition', to: 'STANDARD_IA' } },
      ],
      100,
    );
    expect(tieringToIa.at(-1)?.storageClass).toBe('INTELLIGENT_TIERING');
  });
});
