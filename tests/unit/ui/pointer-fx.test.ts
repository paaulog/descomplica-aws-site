import { describe, expect, it } from 'vitest';
import { computePointerFx } from '@/lib/ui/pointer-fx';

const box = { left: 100, top: 50, width: 200, height: 100 };

describe('computePointerFx', () => {
  it('converte o ponteiro em porcentagem dentro da caixa', () => {
    const fx = computePointerFx({ x: 200, y: 100 }, box);
    expect(fx.x).toBe(50);
    expect(fx.y).toBe(50);
  });

  it('não inclina quando o ponteiro está no centro', () => {
    const fx = computePointerFx({ x: 200, y: 100 }, box, 8);
    expect(fx.tiltX).toBeCloseTo(0);
    expect(fx.tiltY).toBeCloseTo(0);
  });

  it('inclina a superfície em direção ao ponteiro', () => {
    const topRight = computePointerFx({ x: 300, y: 50 }, box, 8);
    expect(topRight.tiltX).toBeCloseTo(8);
    expect(topRight.tiltY).toBeCloseTo(8);
    const bottomLeft = computePointerFx({ x: 100, y: 150 }, box, 8);
    expect(bottomLeft.tiltX).toBeCloseTo(-8);
    expect(bottomLeft.tiltY).toBeCloseTo(-8);
  });
});
