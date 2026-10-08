import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IslandErrorBoundary } from '@/components/interactive/IslandErrorBoundary';
import { IslandFrame } from '@/components/interactive/IslandFrame';
import { getIslandRoot, mockReducedMotion, setupIslandTests } from './island-test-utils';

function Broken(): never {
  throw new Error('quebrou');
}

setupIslandTests();

describe('IslandErrorBoundary', () => {
  it('mostra o texto estático quando a ilha lança erro', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <IslandErrorBoundary fallback="O S3 guarda objetos dentro de buckets.">
        <Broken />
      </IslandErrorBoundary>,
    );
    expect(screen.getByText('O S3 guarda objetos dentro de buckets.')).toBeDefined();
    consoleError.mockRestore();
  });

  it('mostra a ilha normalmente quando nada quebra', () => {
    render(
      <IslandErrorBoundary fallback="texto alternativo">
        <p>simulação</p>
      </IslandErrorBoundary>,
    );
    expect(screen.getByText('simulação')).toBeDefined();
    expect(screen.queryByText('texto alternativo')).toBeNull();
  });
});

describe('IslandFrame', () => {
  it('mantém o título e troca só o conteúdo pelo texto alternativo', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <IslandFrame island="Teste" title="Simulador" fallback="Explicação estática">
        <Broken />
      </IslandFrame>,
    );
    expect(screen.getByRole('group', { name: 'Simulador' })).toBeDefined();
    expect(screen.getByText('Explicação estática')).toBeDefined();
    consoleError.mockRestore();
  });

  it('marca o caminho de movimento conforme a preferência do sistema', () => {
    const full = render(
      <IslandFrame island="Teste" title="Simulador" fallback="-">
        <p>ok</p>
      </IslandFrame>,
    );
    expect(getIslandRoot(full.container).dataset.motion).toBe('full');
    full.unmount();
    mockReducedMotion(true);
    const reduced = render(
      <IslandFrame island="Teste" title="Simulador" fallback="-">
        <p>ok</p>
      </IslandFrame>,
    );
    expect(getIslandRoot(reduced.container).dataset.motion).toBe('reduced');
  });
});
