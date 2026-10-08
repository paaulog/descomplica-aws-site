import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CostCalculator from '@/components/interactive/s3/CostCalculator';
import KeyExplorer from '@/components/interactive/s3/KeyExplorer';
import StorageClassSlider from '@/components/interactive/s3/StorageClassSlider';
import UploadToBucket from '@/components/interactive/s3/UploadToBucket';
import { pricing } from '@/data/pricing';
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

describe('KeyExplorer', () => {
  it.each(locales)('renderiza com as mensagens de %s', (locale) => {
    const messages = islandMessages[locale].keyExplorer;
    renderIsland(<KeyExplorer locale={locale} messages={messages} />);
    expect(screen.getByRole('group', { name: messages.title })).toBeDefined();
    expect(screen.getByLabelText(messages.inputLabel)).toHaveProperty(
      'value',
      messages.examples[0],
    );
  });

  it('desenha as "pastas" da chave digitada só pelo teclado', async () => {
    const { user } = renderIsland(<KeyExplorer locale="pt-br" messages={pt.keyExplorer} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText(pt.keyExplorer.inputLabel));
    await user.clear(screen.getByLabelText(pt.keyExplorer.inputLabel));
    await user.keyboard('docs/2026/nota.txt');
    const tree = within(screen.getByTestId('key-tree'));
    expect(tree.getByText('docs/')).toBeDefined();
    expect(tree.getByText('2026/')).toBeDefined();
    expect(tree.getByText(/nota\.txt/)).toBeDefined();
    expect(screen.getByText('18 de 1024 bytes')).toBeDefined();
  });

  it('mostra os avisos de barra dupla e de chave vazia', async () => {
    const { user } = renderIsland(<KeyExplorer locale="pt-br" messages={pt.keyExplorer} />);
    await user.click(screen.getByRole('button', { name: 'fotos//praia.jpg' }));
    expect(screen.getByText(pt.keyExplorer.warnings.doubleSlash)).toBeDefined();
    expect(screen.getByText(pt.keyExplorer.emptySegment, { exact: false })).toBeDefined();
    await user.clear(screen.getByLabelText(pt.keyExplorer.inputLabel));
    expect(screen.getByText(pt.keyExplorer.errors.empty)).toBeDefined();
  });

  it('com movimento reduzido, mostra as pastas sem quadro de entrada', async () => {
    mockReducedMotion(true);
    const { container, user } = renderIsland(
      <KeyExplorer locale="pt-br" messages={pt.keyExplorer} />,
    );
    await user.type(screen.getByLabelText(pt.keyExplorer.inputLabel), '/x');
    expect(getIslandRoot(container).dataset.motion).toBe('reduced');
    expect(countAnimatedElements(container)).toBe(0);
  });
});

describe('UploadToBucket', () => {
  it.each(locales)('renderiza com as mensagens de %s', (locale) => {
    const messages = islandMessages[locale].uploadToBucket;
    renderIsland(<UploadToBucket locale={locale} messages={messages} />);
    expect(screen.getByRole('group', { name: messages.title })).toBeDefined();
    expect(screen.getByText(messages.emptyBucket)).toBeDefined();
  });

  it('transforma o arquivo do <input type=file> em objeto, sem ler o conteúdo', async () => {
    const { user } = renderIsland(<UploadToBucket locale="pt-br" messages={pt.uploadToBucket} />);
    const file = new File(['conteúdo secreto'], 'nota.txt', { type: 'text/plain' });
    const readers = [
      vi.spyOn(file, 'text'),
      vi.spyOn(file, 'arrayBuffer'),
      vi.spyOn(file, 'stream'),
    ];
    const fileReader = vi.spyOn(FileReader.prototype, 'readAsArrayBuffer');
    await user.upload(screen.getByLabelText(pt.uploadToBucket.chooseFile), file);
    const card = within(screen.getByTestId('s3-object'));
    expect(card.getAllByText('fotos/nota.txt')).not.toHaveLength(0);
    expect(card.getByText('text/plain')).toBeDefined();
    for (const reader of [...readers, fileReader]) expect(reader).not.toHaveBeenCalled();
  });

  it('usa o arquivo de exemplo pelo teclado e respeita o prefixo', async () => {
    const { user } = renderIsland(<UploadToBucket locale="pt-br" messages={pt.uploadToBucket} />);
    const prefix = screen.getByLabelText(pt.uploadToBucket.prefixLabel);
    await user.clear(prefix);
    await user.type(prefix, 'ferias/2026');
    screen.getByRole('button', { name: pt.uploadToBucket.useSample }).focus();
    await user.keyboard('{Enter}');
    const card = within(screen.getByTestId('s3-object'));
    expect(card.getAllByText('ferias/2026/praia.jpg')).not.toHaveLength(0);
    expect(card.getByText('image/jpeg')).toBeDefined();
    expect(screen.getByText('O objeto ferias/2026/praia.jpg entrou no bucket.')).toBeDefined();
  });

  it('aceita arquivo solto na área de arrastar', () => {
    renderIsland(<UploadToBucket locale="en" messages={islandMessages.en.uploadToBucket} />);
    const file = new File([''], 'clip.mp4', { type: 'video/mp4' });
    fireEvent.drop(screen.getByTestId('drop-zone'), { dataTransfer: { files: [file] } });
    expect(screen.getAllByText('photos/clip.mp4')).not.toHaveLength(0);
  });

  it('impede o navegador de abrir um arquivo solto fora da área', () => {
    renderIsland(<UploadToBucket locale="pt-br" messages={pt.uploadToBucket} />);
    const drop = new Event('drop', { cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', { value: { types: ['Files'] } });
    window.dispatchEvent(drop);
    expect(drop.defaultPrevented).toBe(true);
  });

  it('anuncia de novo quando a mesma chave é enviada outra vez', async () => {
    const { user, container } = renderIsland(
      <UploadToBucket locale="pt-br" messages={pt.uploadToBucket} />,
    );
    const sample = screen.getByRole('button', { name: pt.uploadToBucket.useSample });
    await user.click(sample);
    const first = container.querySelector('[aria-live] span');
    await user.click(sample);
    const second = container.querySelector('[aria-live] span');
    expect(second?.textContent).toBe('O objeto fotos/praia.jpg entrou no bucket.');
    expect(second).not.toBe(first);
    expect(screen.getAllByTestId('s3-object')).toHaveLength(1);
  });

  it('com movimento reduzido, o objeto entra sem animação', async () => {
    mockReducedMotion(true);
    const { container, user } = renderIsland(
      <UploadToBucket locale="pt-br" messages={pt.uploadToBucket} />,
    );
    await user.click(screen.getByRole('button', { name: pt.uploadToBucket.useSample }));
    expect(screen.getByTestId('s3-object')).toBeDefined();
    expect(countAnimatedElements(container)).toBe(0);
  });
});

describe('StorageClassSlider', () => {
  const messages = pt.storageClassSlider;
  const recommended = () =>
    screen.getByTestId('recommendation').querySelector('[data-storage-class]')?.textContent;

  it.each(locales)('renderiza com as mensagens de %s', (locale) => {
    const localized = islandMessages[locale].storageClassSlider;
    renderIsland(<StorageClassSlider locale={locale} messages={localized} pricing={pricing} />);
    expect(screen.getByRole('group', { name: localized.title })).toBeDefined();
    expect(screen.getByRole('slider', { name: localized.frequencyLabel })).toBeDefined();
  });

  it('é um slider nativo, alcançável por Tab, que muda a recomendação a cada passo', async () => {
    const { user } = renderIsland(
      <StorageClassSlider locale="pt-br" messages={messages} pricing={pricing} />,
    );
    await user.tab();
    const slider = screen.getByRole('slider', { name: messages.frequencyLabel });
    expect(document.activeElement).toBe(slider);
    expect(slider.getAttribute('aria-valuetext')).toBe(messages.frequencies.daily);
    expect(recommended()).toBe('S3 Standard');
    // The browser turns each arrow key on a native range into this change event.
    fireEvent.change(slider, { target: { value: '5' } });
    expect(slider.getAttribute('aria-valuetext')).toBe(messages.frequencies.rarely);
    expect(recommended()).toBe('S3 Glacier Deep Archive');
  });

  it('recomenda Intelligent-Tiering com "não sei" e destaca a barra dela', async () => {
    const { user, container } = renderIsland(
      <StorageClassSlider locale="pt-br" messages={messages} pricing={pricing} />,
    );
    await user.click(screen.getByRole('checkbox', { name: messages.unknownLabel }));
    expect(recommended()).toBe('S3 Intelligent-Tiering');
    expect(screen.getByRole('slider').hasAttribute('disabled')).toBe(true);
    expect(container.querySelector('[data-highlighted]')?.getAttribute('data-bar')).toBe(
      'INTELLIGENT_TIERING',
    );
  });

  it('avisa da duração mínima ao guardar por pouco tempo', async () => {
    const { user } = renderIsland(
      <StorageClassSlider locale="pt-br" messages={messages} pricing={pricing} />,
    );
    fireEvent.change(screen.getByRole('slider'), { target: { value: '2' } });
    await user.selectOptions(screen.getByLabelText(messages.retentionLabel), '30');
    expect(screen.queryByText(/no mínimo 30 dias/)).toBeNull();
    fireEvent.change(screen.getByRole('slider'), { target: { value: '5' } });
    expect(screen.getByText(/no mínimo 180 dias/)).toBeDefined();
  });

  it('com movimento reduzido, as barras mudam sem transição', () => {
    mockReducedMotion(true);
    const { container } = renderIsland(
      <StorageClassSlider locale="pt-br" messages={messages} pricing={pricing} />,
    );
    fireEvent.change(screen.getByRole('slider'), { target: { value: '3' } });
    expect(container.querySelector('[class*="transition-[width]"]')).toBeNull();
    expect(countAnimatedElements(container)).toBe(0);
  });
});

describe('CostCalculator', () => {
  const messages = pt.costCalculator;
  const total = () => screen.getByTestId('cost-total').textContent?.replace(/\s/g, ' ');

  it.each(locales)('renderiza com as mensagens de %s', (locale) => {
    const localized = islandMessages[locale].costCalculator;
    renderIsland(<CostCalculator locale={locale} messages={localized} pricing={pricing} />);
    expect(screen.getByRole('group', { name: localized.title })).toBeDefined();
    expect(screen.getByText(localized.breakdownTitle)).toBeDefined();
  });

  it('recalcula o total só pelo teclado', async () => {
    const { user } = renderIsland(
      <CostCalculator locale="en" messages={islandMessages.en.costCalculator} pricing={pricing} />,
    );
    const inputs = islandMessages.en.costCalculator.inputs;
    for (const label of Object.values(inputs)) {
      await user.clear(screen.getByLabelText(label));
      await user.type(screen.getByLabelText(label), '0');
    }
    expect(total()).toBe('$0.00');
    await user.clear(screen.getByLabelText(inputs.storageGb));
    await user.type(screen.getByLabelText(inputs.storageGb), '100');
    expect(total()).toBe('$2.30');
  });

  it('troca de exemplo e marca o botão escolhido', async () => {
    const { user } = renderIsland(
      <CostCalculator locale="pt-br" messages={messages} pricing={pricing} />,
    );
    const backup = screen.getByRole('button', { name: messages.presets.backup });
    await user.click(backup);
    expect(backup.getAttribute('aria-pressed')).toBe('true');
    expect(total()).toBe('US$ 23,05');
  });

  it('trata campo vazio como zero, sem quebrar', async () => {
    const { user } = renderIsland(
      <CostCalculator locale="pt-br" messages={messages} pricing={pricing} />,
    );
    await user.clear(screen.getByLabelText(messages.inputs.storageGb));
    expect(screen.getByLabelText(messages.inputs.storageGb)).toHaveProperty('value', '');
    expect(total()).toMatch(/^US\$/);
  });

  it('mostra a franquia, o Free Plan e a data de verificação', () => {
    renderIsland(<CostCalculator locale="pt-br" messages={messages} pricing={pricing} />);
    expect(screen.getByText('Os primeiros 100 GB de saída por mês são grátis.')).toBeDefined();
    expect(screen.getByText(/Free Plan/)).toBeDefined();
    expect(screen.getByText(/conferidos em 7 de outubro de 2026/)).toBeDefined();
  });

  it('com movimento reduzido, o total muda sem animação', async () => {
    mockReducedMotion(true);
    const { container, user } = renderIsland(
      <CostCalculator locale="pt-br" messages={messages} pricing={pricing} />,
    );
    await user.click(screen.getByRole('button', { name: messages.presets.personalSite }));
    expect(countAnimatedElements(container)).toBe(0);
  });
});
