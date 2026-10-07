import { expect, test, type Locator, type Page } from '@playwright/test';

const ISLANDS = [
  'UploadToBucket',
  'KeyExplorer',
  'FlowDiagram',
  'AccessLock',
  'StorageClassSlider',
  'VersionTimeline',
  'LifecycleAnimation',
  'CostCalculator',
] as const;

// Waits for client:visible to hydrate the island, so clicks reach React and not the static HTML.
async function openIsland(page: Page, name: (typeof ISLANDS)[number]): Promise<Locator> {
  const island = page.locator(`[data-island="${name}"]`);
  await island.scrollIntoViewIfNeeded();
  await expect(page.locator(`astro-island:has([data-island="${name}"])`)).not.toHaveAttribute(
    'ssr',
  );
  return island;
}

// Every request that leaves the local preview server is recorded and blocked.
async function guardNetwork(page: Page): Promise<string[]> {
  const external: string[] = [];
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1' || url.protocol === 'data:') return route.continue();
    external.push(url.href);
    return route.abort();
  });
  return external;
}

test.describe('ilhas do S3: caminho feliz', () => {
  let external: string[] = [];

  test.beforeEach(async ({ page }) => {
    external = await guardNetwork(page);
    await page.goto('/s3/');
  });

  test.afterEach(() => {
    expect(external.filter((url) => url.includes('amazonaws.com'))).toEqual([]);
    expect(external).toEqual([]);
  });

  test('UploadToBucket: o arquivo escolhido e o de exemplo viram objetos', async ({ page }) => {
    const island = await openIsland(page, 'UploadToBucket');
    await island.locator('input[type="file"]').setInputFiles({
      name: 'nota.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('conteúdo que nunca sai do navegador'),
    });
    await expect(island.getByTestId('s3-object').first()).toContainText('fotos/nota.txt');
    await island.getByRole('button', { name: 'Usar arquivo de exemplo' }).click();
    await expect(island.getByTestId('s3-object')).toHaveCount(2);
    await expect(island.getByTestId('s3-object').first()).toContainText('image/jpeg');
  });

  test('KeyExplorer: a chave digitada vira "pastas"', async ({ page }) => {
    const island = await openIsland(page, 'KeyExplorer');
    const input = island.getByLabel('Digite uma chave');
    await input.fill('docs/2026/nota.txt');
    const tree = island.getByTestId('key-tree');
    await expect(tree).toContainText('docs/');
    await expect(tree).toContainText('nota.txt');
    await input.fill('');
    await expect(island).toContainText('A chave não pode ficar vazia.');
  });

  test('StorageClassSlider: as setas mudam a recomendação', async ({ page }) => {
    const island = await openIsland(page, 'StorageClassSlider');
    const slider = island.getByRole('slider');
    const recommendation = island.getByTestId('recommendation');
    await expect(recommendation).toContainText('S3 Standard');
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuetext', 'Uma vez por mês');
    await expect(recommendation).toContainText('S3 Standard-IA');
    await page.keyboard.press('End');
    await expect(recommendation).toContainText('S3 Glacier Deep Archive');
    await island.getByLabel('Não sei com que frequência').check();
    await expect(recommendation).toContainText('S3 Intelligent-Tiering');
  });

  test('CostCalculator: os exemplos e os campos mudam o total', async ({ page }) => {
    const island = await openIsland(page, 'CostCalculator');
    const total = island.getByTestId('cost-total');
    await expect(total).toHaveText(/US\$\s41,65/);
    await island.getByRole('button', { name: 'Backup' }).click();
    await expect(total).toHaveText(/US\$\s23,05/);
    await island.getByLabel('Saída para a internet (GB por mês)').fill('200');
    await expect(total).toHaveText(/US\$\s32,05/);
  });

  test('AccessLock: o link pré-assinado expira no relógio simulado', async ({ page }) => {
    const island = await openIsland(page, 'AccessLock');
    const linkHolder = island.locator('[data-allowed]').nth(2);
    await expect(linkHolder).toHaveAttribute('data-allowed', 'false');
    await island.getByText('URL pré-assinada').click();
    await expect(linkHolder).toHaveAttribute('data-allowed', 'true');
    await island.getByRole('button', { name: 'Avançar 1 hora' }).click();
    await expect(linkHolder).toHaveAttribute('data-allowed', 'false');
  });

  test('VersionTimeline: apagar e restaurar com o versionamento ligado', async ({ page }) => {
    const island = await openIsland(page, 'VersionTimeline');
    const status = island.getByTestId('version-status');
    await island.getByRole('button', { name: 'Ligar o versionamento' }).click();
    await island.getByRole('button', { name: 'Apagar o arquivo' }).click();
    await expect(status).toContainText('Dá para restaurar');
    await island
      .getByRole('button', { name: /Restaurar/ })
      .first()
      .click();
    await expect(status).toContainText('Arquivo atual: Versão 1 do relatório');
  });

  test('LifecycleAnimation: o tempo passa e o arquivo desce de classe', async ({ page }) => {
    const island = await openIsland(page, 'LifecycleAnimation');
    await island.getByRole('button', { name: 'Ver o tempo passar' }).click();
    await expect(island.locator('[data-current]')).toHaveAttribute('data-stage', 'expired', {
      timeout: 15_000,
    });
    await expect(island.getByRole('slider')).toHaveValue('400');
  });

  test('FlowDiagram: o diagrama se monta com o scroll', async ({ page }) => {
    const island = await openIsland(page, 'FlowDiagram');
    const lastPart = island.locator('[data-flow-part]').last();
    await island.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    await expect(lastPart).toHaveCSS('opacity', '1');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect
      .poll(async () => Number(await lastPart.evaluate((el) => getComputedStyle(el).opacity)))
      .toBeLessThan(1);
  });
});

test.describe('ilhas em inglês', () => {
  test('recebem as mensagens em inglês', async ({ page }) => {
    await page.goto('/en/s3/');
    const island = await openIsland(page, 'KeyExplorer');
    await expect(island.getByRole('heading')).toHaveText('Key simulator');
    await expect(island.getByLabel('Type a key')).toHaveValue('photos/2026/beach.jpg');
  });
});

test.describe('com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('todas as ilhas seguem pelo caminho sem animação', async ({ page }) => {
    await page.goto('/s3/');
    for (const name of ISLANDS) {
      const island = await openIsland(page, name);
      await expect(island).toHaveAttribute('data-motion', 'reduced');
    }
    const lifecycle = page.locator('[data-island="LifecycleAnimation"]');
    await expect(lifecycle.getByRole('button', { name: 'Ver o tempo passar' })).toHaveCount(0);
    await lifecycle.getByRole('button', { name: 'Pular para a próxima regra' }).click();
    await expect(lifecycle.getByRole('slider')).toHaveValue('30');
    const flowParts = page.locator('[data-island="FlowDiagram"] [data-flow-part]');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    for (const part of await flowParts.all()) await expect(part).toHaveCSS('opacity', '1');
  });
});
