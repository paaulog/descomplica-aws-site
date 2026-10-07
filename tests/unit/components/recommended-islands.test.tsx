import { act, fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AccessLock from '@/components/interactive/s3/AccessLock';
import FlowDiagram from '@/components/interactive/s3/FlowDiagram';
import LifecycleAnimation from '@/components/interactive/s3/LifecycleAnimation';
import UploadToBucket from '@/components/interactive/s3/UploadToBucket';
import VersionTimeline from '@/components/interactive/s3/VersionTimeline';
import { islandMessages, locales } from '@/lib/i18n/ui';
import {
  countAnimatedElements,
  getIslandRoot,
  mockReducedMotion,
  renderIsland,
  setupIslandTests,
} from './island-test-utils';

setupIslandTests();

const pt = islandMessages['pt-br'];

function readDecisions(container: HTMLElement): Record<string, boolean> {
  const cards = [...container.querySelectorAll<HTMLElement>('[data-allowed]')];
  return Object.fromEntries(
    cards.map((card) => [
      card.querySelector('p')?.textContent ?? '',
      card.dataset.allowed === 'true',
    ]),
  );
}

describe('caminho com animação (contraprova dos testes de movimento reduzido)', () => {
  it('anima a entrada do objeto novo quando o movimento é permitido', async () => {
    const { container, user } = renderIsland(
      <UploadToBucket locale="pt-br" messages={pt.uploadToBucket} />,
    );
    await user.click(screen.getByRole('button', { name: pt.uploadToBucket.useSample }));
    expect(countAnimatedElements(container)).toBeGreaterThan(0);
  });
});

describe('AccessLock', () => {
  const messages = pt.accessLock;
  const actors = messages.actors;

  it.each(locales)('renderiza com as mensagens de %s', (locale) => {
    const localized = islandMessages[locale].accessLock;
    renderIsland(<AccessLock locale={locale} messages={localized} />);
    expect(screen.getByRole('group', { name: localized.title })).toBeDefined();
    expect(screen.getByRole('radio', { name: new RegExp(localized.modes.private) })).toHaveProperty(
      'checked',
      true,
    );
  });

  it('começa privado: só o dono entra', () => {
    const { container } = renderIsland(<AccessLock locale="pt-br" messages={messages} />);
    expect(readDecisions(container)).toEqual({
      [actors.owner]: true,
      [actors.anonymous]: false,
      [actors.linkHolder]: false,
    });
  });

  it('troca de modo pelas setas do grupo de rádio e libera todo mundo no público', async () => {
    const { container, user } = renderIsland(<AccessLock locale="pt-br" messages={messages} />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: new RegExp(messages.modes.public) })).toHaveProperty(
      'checked',
      true,
    );
    expect(Object.values(readDecisions(container))).toEqual([true, true, true]);
  });

  it('com URL pré-assinada, o link vale até expirar no relógio simulado', async () => {
    const { container, user } = renderIsland(<AccessLock locale="pt-br" messages={messages} />);
    await user.click(screen.getByRole('radio', { name: new RegExp(messages.modes.presigned) }));
    expect(readDecisions(container)[actors.linkHolder]).toBe(true);
    expect(readDecisions(container)[actors.anonymous]).toBe(false);
    await user.click(screen.getByRole('button', { name: messages.advanceHour }));
    expect(readDecisions(container)[actors.linkHolder]).toBe(false);
    expect(screen.getByText(/O link expirou/)).toBeDefined();
    await user.click(screen.getByRole('button', { name: messages.resetClock }));
    expect(readDecisions(container)[actors.linkHolder]).toBe(true);
  });

  it('com 7 dias, o link sobrevive a um dia e meio de relógio', async () => {
    const { container, user } = renderIsland(<AccessLock locale="pt-br" messages={messages} />);
    await user.click(screen.getByRole('radio', { name: new RegExp(messages.modes.presigned) }));
    await user.selectOptions(screen.getByLabelText(messages.expirationLabel), '604800');
    await user.click(screen.getByRole('button', { name: messages.advanceDay }));
    expect(readDecisions(container)[actors.linkHolder]).toBe(true);
  });

  it('com movimento reduzido, troca o cadeado sem animação', async () => {
    mockReducedMotion(true);
    const { container, user } = renderIsland(<AccessLock locale="pt-br" messages={messages} />);
    await user.click(screen.getByRole('radio', { name: new RegExp(messages.modes.public) }));
    expect(getIslandRoot(container).dataset.motion).toBe('reduced');
    expect(countAnimatedElements(container)).toBe(0);
  });
});

describe('VersionTimeline', () => {
  const messages = pt.versionTimeline;
  const status = () => screen.getByTestId('version-status').textContent;

  it.each(locales)('renderiza com as mensagens de %s', (locale) => {
    const localized = islandMessages[locale].versionTimeline;
    renderIsland(<VersionTimeline locale={locale} messages={localized} />);
    expect(screen.getByRole('group', { name: localized.title })).toBeDefined();
    expect(screen.getByText(localized.versioningOff)).toBeDefined();
  });

  it('sem versionamento, apagar é definitivo', async () => {
    const { user } = renderIsland(<VersionTimeline locale="pt-br" messages={messages} />);
    await user.click(screen.getByRole('button', { name: messages.delete }));
    expect(status()).toBe(messages.deletedForever);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: messages.upload }));
    expect(screen.getByText(messages.emptyHistory)).toBeDefined();
    expect(screen.getByRole('button', { name: messages.delete })).toHaveProperty('disabled', true);
  });

  it('com versionamento, apagar cria marcador e restaurar traz a versão de volta, pelo teclado', async () => {
    const { container, user } = renderIsland(
      <VersionTimeline locale="pt-br" messages={messages} />,
    );
    screen.getByRole('button', { name: messages.enableVersioning }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByText(messages.versioningOn)).toBeDefined();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: messages.upload }));
    screen.getByRole('button', { name: messages.upload }).focus();
    await user.keyboard('{Enter}');
    expect(status()).toBe(`${messages.currentLabel}: Versão 2 do relatório`);
    screen.getByRole('button', { name: messages.delete }).focus();
    await user.keyboard('{Enter}');
    expect(status()).toBe(messages.deletedWithMarker);
    expect(container.querySelector('[data-delete-marker]')).not.toBeNull();
    screen.getByRole('button', { name: /^Restaurar.*Versão 1 do relatório$/ }).focus();
    await user.keyboard('{Enter}');
    expect(status()).toBe(`${messages.currentLabel}: Versão 1 do relatório`);
  });

  it('com movimento reduzido, novas versões entram sem animação', async () => {
    mockReducedMotion(true);
    const { container, user } = renderIsland(
      <VersionTimeline locale="pt-br" messages={messages} />,
    );
    await user.click(screen.getByRole('button', { name: messages.enableVersioning }));
    await user.click(screen.getByRole('button', { name: messages.upload }));
    expect(countAnimatedElements(container)).toBe(0);
  });
});

describe('LifecycleAnimation', () => {
  const messages = pt.lifecycleAnimation;
  const currentStage = (container: HTMLElement) =>
    container.querySelector<HTMLElement>('[data-current]')?.dataset.stage;

  it.each(locales)('renderiza com as mensagens de %s', (locale) => {
    const localized = islandMessages[locale].lifecycleAnimation;
    renderIsland(<LifecycleAnimation locale={locale} messages={localized} />);
    expect(screen.getByRole('group', { name: localized.title })).toBeDefined();
    expect(screen.getByRole('slider')).toBeDefined();
  });

  it('move o arquivo entre as classes conforme o dia', () => {
    const { container } = renderIsland(<LifecycleAnimation locale="pt-br" messages={messages} />);
    const slider = screen.getByRole('slider');
    expect(currentStage(container)).toBe('STANDARD');
    fireEvent.change(slider, { target: { value: '45' } });
    expect(currentStage(container)).toBe('STANDARD_IA');
    expect(screen.getByTestId('lifecycle-status').textContent).toBe(
      'No dia 45, o arquivo está no S3 Standard-IA.',
    );
    fireEvent.change(slider, { target: { value: '365' } });
    expect(currentStage(container)).toBe('expired');
    expect(slider.getAttribute('aria-valuetext')).toBe('Dia 365');
  });

  it('o botão de tocar avança os dias sozinho e para no fim', async () => {
    vi.useFakeTimers();
    const { container } = renderIsland(<LifecycleAnimation locale="pt-br" messages={messages} />);
    act(() => screen.getByRole('button', { name: messages.play }).click());
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(currentStage(container)).not.toBe('STANDARD');
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    expect(screen.getByRole('slider')).toHaveProperty('value', '400');
    expect(screen.getByRole('button', { name: messages.play })).toBeDefined();
    vi.useRealTimers();
  });

  it('para de tocar se o movimento reduzido for ligado no meio', async () => {
    vi.useFakeTimers();
    const view = renderIsland(<LifecycleAnimation locale="pt-br" messages={messages} />);
    act(() => screen.getByRole('button', { name: messages.play }).click());
    await act(() => vi.advanceTimersByTimeAsync(500));
    mockReducedMotion(true);
    view.rerender(<LifecycleAnimation locale="pt-br" messages={{ ...messages }} />);
    const dayAtSwitch = screen.getByRole<HTMLInputElement>('slider').value;
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(screen.getByRole('slider')).toHaveProperty('value', dayAtSwitch);
    expect(screen.getByRole('button', { name: messages.nextRule })).toBeDefined();
    mockReducedMotion(false);
    view.rerender(<LifecycleAnimation locale="pt-br" messages={{ ...messages }} />);
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(screen.getByRole('slider')).toHaveProperty('value', dayAtSwitch);
    expect(screen.getByRole('button', { name: messages.play })).toBeDefined();
    vi.useRealTimers();
  });

  it('com movimento reduzido, troca o tocar por saltos de regra em regra', async () => {
    mockReducedMotion(true);
    const { container, user } = renderIsland(
      <LifecycleAnimation locale="pt-br" messages={messages} />,
    );
    expect(screen.queryByRole('button', { name: messages.play })).toBeNull();
    const next = screen.getByRole('button', { name: messages.nextRule });
    await user.click(next);
    expect(screen.getByRole('slider')).toHaveProperty('value', '30');
    await user.click(next);
    await user.click(next);
    expect(currentStage(container)).toBe('expired');
    expect(next).toHaveProperty('disabled', true);
    expect(countAnimatedElements(container)).toBe(0);
  });
});

describe('FlowDiagram', () => {
  it.each(locales)('renderiza com as mensagens de %s', (locale) => {
    const localized = islandMessages[locale].flowDiagram;
    renderIsland(<FlowDiagram locale={locale} messages={localized} />);
    const group = within(screen.getByRole('group', { name: localized.title }));
    expect(group.getByText(localized.steps.bucket.name)).toBeDefined();
    expect(group.getByText(localized.arrows.store)).toBeDefined();
  });

  it('liga as partes ao progresso do scroll quando o movimento é permitido', () => {
    const { container } = renderIsland(<FlowDiagram locale="pt-br" messages={pt.flowDiagram} />);
    const parts = [...container.querySelectorAll<HTMLElement>('[data-flow-part]')];
    expect(parts).toHaveLength(5);
    expect(parts.every((part) => part.style.opacity !== '')).toBe(true);
  });

  it('com movimento reduzido, mostra o diagrama inteiro e parado', () => {
    mockReducedMotion(true);
    const { container } = renderIsland(<FlowDiagram locale="pt-br" messages={pt.flowDiagram} />);
    const parts = [...container.querySelectorAll<HTMLElement>('[data-flow-part]')];
    expect(parts).toHaveLength(5);
    expect(parts.every((part) => part.getAttribute('style') === null)).toBe(true);
  });
});
