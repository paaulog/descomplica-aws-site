import { expect, test, type Page } from '@playwright/test';

function getTerm(page: Page) {
  const trigger = page.locator('#o-que-e-o-s3 [data-term-trigger]').first();
  const popover = page.locator('#o-que-e-o-s3 [popover]').first();
  return { trigger, popover };
}

test.describe('Term no desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'hover e teclado são do desktop');

  test('abre por hover e fecha ao sair', async ({ page }) => {
    await page.goto('/s3/');
    const { trigger, popover } = getTerm(page);
    await trigger.hover();
    await expect(popover).toBeVisible();
    await expect(popover).toContainText('Um arquivo guardado no S3');
    await page.mouse.move(0, 0);
    await expect(popover).toBeHidden();
  });

  test('abre pelo foco do teclado e fecha com Esc', async ({ page }) => {
    await page.goto('/s3/');
    const { trigger, popover } = getTerm(page);
    await trigger.focus();
    await expect(popover).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(popover).toBeHidden();
  });

  test('o clique depois do hover mantém a definição aberta', async ({ page }) => {
    await page.goto('/s3/');
    const { trigger, popover } = getTerm(page);
    await trigger.click();
    await expect(popover).toBeVisible();
  });
});

test.describe('Term no mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'toque é do mobile');

  test('abre e fecha pelo toque', async ({ page }) => {
    await page.goto('/s3/');
    const { trigger, popover } = getTerm(page);
    await trigger.tap();
    await expect(popover).toBeVisible();
    await trigger.tap();
    await expect(popover).toBeHidden();
  });

  test('fecha com Esc', async ({ page }) => {
    await page.goto('/s3/');
    const { trigger, popover } = getTerm(page);
    await trigger.tap();
    await expect(popover).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(popover).toBeHidden();
  });
});

test.describe('abas de código', () => {
  const groups = (page: Page) => page.locator('[data-code-tabs]');
  const tab = (page: Page, group: number, label: string) =>
    groups(page).nth(group).getByRole('tab', { name: label });
  const panel = (page: Page, group: number, language: string) =>
    groups(page).nth(group).locator(`[role="tabpanel"][data-code-lang="${language}"]`);

  test('trocam de linguagem e sincronizam entre os blocos', async ({ page }) => {
    await page.goto('/s3/#usando-via-codigo');
    await expect(groups(page)).toHaveCount(2);
    await tab(page, 0, 'Python').click();
    for (const group of [0, 1]) {
      await expect(tab(page, group, 'Python')).toHaveAttribute('aria-selected', 'true');
      await expect(panel(page, group, 'python')).toBeVisible();
      await expect(panel(page, group, 'js')).toBeHidden();
    }
    await page.reload();
    await expect(tab(page, 1, 'Python')).toHaveAttribute('aria-selected', 'true');
    expect(await page.evaluate(() => localStorage.getItem('da:code-lang'))).toBe('python');
  });

  test('sincronizam com outra aba do navegador', async ({ page, context }) => {
    await page.goto('/s3/#usando-via-codigo');
    const other = await context.newPage();
    await other.goto('/s3/#usando-via-codigo');
    await tab(other, 0, 'Python').click();
    await expect(tab(page, 1, 'Python')).toHaveAttribute('aria-selected', 'true');
  });

  test('seguem o padrão WAI-ARIA no teclado', async ({ page }) => {
    await page.goto('/s3/#usando-via-codigo');
    await tab(page, 0, 'JavaScript').focus();
    await page.keyboard.press('ArrowRight');
    await expect(tab(page, 0, 'Python')).toBeFocused();
    await expect(tab(page, 0, 'Python')).toHaveAttribute('aria-selected', 'true');
    await expect(tab(page, 0, 'JavaScript')).toHaveAttribute('tabindex', '-1');
    await page.keyboard.press('Home');
    await expect(tab(page, 0, 'JavaScript')).toHaveAttribute('aria-selected', 'true');
  });

  test('o botão de copiar coloca o código na área de transferência', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/s3/#usando-via-codigo');
    const visiblePanel = panel(page, 0, 'js');
    await visiblePanel.hover();
    await visiblePanel.locator('.copy button').click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain('new PutObjectCommand({');
    expect(copied).toContain("Key: 'fotos/2026/praia.jpg'");
  });
});
