import { expect, test } from '@playwright/test';

const theme = (page: import('@playwright/test').Page) => page.locator('html');

test.describe('tema escuro do sistema', () => {
  test.use({ colorScheme: 'dark' });

  test('segue o colorScheme emulado', async ({ page }) => {
    await page.goto('/');
    await expect(theme(page)).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('[data-theme-toggle]')).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('tema claro do sistema', () => {
  test.use({ colorScheme: 'light' });

  test('segue o colorScheme emulado', async ({ page }) => {
    await page.goto('/');
    await expect(theme(page)).toHaveAttribute('data-theme', 'light');
  });

  test('a escolha manual persiste depois de recarregar', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-theme-toggle]').click();
    await expect(theme(page)).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(theme(page)).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('[data-theme-toggle]')).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => localStorage.getItem('da:theme'))).toBe('dark');
  });

  test('aplica o tema salvo antes dos scripts de módulo, sem piscar', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('da:theme', 'dark'));
    // Only the inline <head> script is left to set the theme.
    await page.route('**/_astro/*.js', (route) => route.abort());
    await page.goto('/s3/');
    await expect(theme(page)).toHaveAttribute('data-theme', 'dark');
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(background).toBe('rgb(6, 11, 20)');
  });
});

test('a troca de idioma mantém a seção atual', async ({ page }) => {
  await page.goto('/s3/#analogia');
  await expect(theme(page)).toHaveAttribute('data-active-section', 'analogia');
  await page.locator('[data-language-switch]').click();
  await expect(page).toHaveURL('/en/s3/#analogy');
  await expect(page.locator('#analogy--heading')).toBeInViewport();
});

test('a troca de idioma volta para o mesmo ponto em pt-BR', async ({ page }) => {
  await page.goto('/en/s3/#using-code');
  await expect(theme(page)).toHaveAttribute('data-active-section', 'using-code');
  await page.locator('[data-language-switch]').click();
  await expect(page).toHaveURL('/s3/#usando-via-codigo');
});
