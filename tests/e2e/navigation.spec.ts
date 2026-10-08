import { expect, test, type Page } from '@playwright/test';

const dash = (page: Page, anchor: string) =>
  page.locator(`[data-section-nav] a[href="#${anchor}"]`);

async function jumpTo(page: Page, anchor: string): Promise<void> {
  await page.evaluate((id) => {
    document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, anchor);
}

test.describe('home', () => {
  test('o cartão S3 leva à página do serviço', async ({ page }) => {
    await page.goto('/');
    await page.locator('article[data-service="s3"] a').click();
    await expect(page).toHaveURL('/s3/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('os cartões "em breve" não navegam', async ({ page }) => {
    await page.goto('/');
    const soon = page.locator('article[data-status="soon"]');
    await expect(soon).toHaveCount(3);
    await expect(soon.locator('a')).toHaveCount(0);
    await soon.first().click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('nav em traços no desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'os traços só aparecem a partir de lg');

  test('clicar num traço rola até a seção e atualiza o hash', async ({ page }) => {
    await page.goto('/s3/');
    await dash(page, 'analogia').click();
    await expect(page).toHaveURL(/\/s3\/#analogia$/);
    await expect(page.locator('#analogia--heading')).toBeInViewport();
    await expect(dash(page, 'analogia')).toHaveAttribute('aria-current', 'location');
  });

  test('mostra o nome da seção ao passar o mouse', async ({ page }) => {
    await page.goto('/s3/');
    const label = dash(page, 'o-problema').locator('.dash-label');
    await expect(label).toHaveCSS('opacity', '0');
    await dash(page, 'o-problema').hover();
    await expect(label).toHaveCSS('opacity', '1');
    await expect(label).toHaveText('O problema');
  });

  test('o traço ativo muda com o scroll', async ({ page }) => {
    await page.goto('/s3/');
    await expect(dash(page, 'abertura')).toHaveAttribute('aria-current', 'location');
    await jumpTo(page, 'o-que-e-o-s3');
    await expect(dash(page, 'o-que-e-o-s3')).toHaveAttribute('aria-current', 'location');
    await expect(dash(page, 'abertura')).not.toHaveAttribute('aria-current');
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
    );
    await expect(dash(page, 'resumo')).toHaveAttribute('aria-current', 'location');
  });
});

test.describe('barra de seções no mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'a barra só aparece abaixo de lg');

  test('a barra abre a lista de seções e leva até a escolhida', async ({ page }) => {
    await page.goto('/s3/');
    const bar = page.locator('[data-section-bar]');
    await expect(bar.locator('nav')).toBeHidden();
    await bar.locator('summary').tap();
    await expect(bar.locator('nav')).toBeVisible();
    await bar.locator('nav a[href="#analogia"]').tap();
    await expect(page).toHaveURL(/#analogia$/);
    await expect(bar).not.toHaveAttribute('open');
    await expect(page.locator('[data-bar-current]')).toHaveText('A analogia');
  });

  test('Esc fecha a lista e devolve o foco à barra', async ({ page }) => {
    await page.goto('/s3/');
    const bar = page.locator('[data-section-bar]');
    await bar.locator('summary').tap();
    await bar.locator('nav a').first().focus();
    await page.keyboard.press('Escape');
    await expect(bar).not.toHaveAttribute('open');
    await expect(bar.locator('summary')).toBeFocused();
  });
});

test('um link direto com âncora cai na seção, sem ficar sob o cabeçalho', async ({ page }) => {
  await page.goto('/en/s3/#analogy');
  const heading = page.locator('#analogy--heading');
  await expect(heading).toBeInViewport();
  const covered = await page.evaluate(() => {
    const title = document.getElementById('analogy--heading')?.getBoundingClientRect();
    const stickyBottoms = [...document.querySelectorAll('header, [data-section-bar]')]
      .filter((element) => element.checkVisibility())
      .map((element) => element.getBoundingClientRect().bottom);
    return title === undefined ? true : title.top < Math.max(...stickyBottoms);
  });
  expect(covered).toBe(false);
});

test.describe('revelação no scroll', () => {
  test('anima seções fora da tela quando o movimento é permitido', async ({ page }) => {
    await page.goto('/s3/');
    await expect(page.locator('#abertura')).toHaveCSS('opacity', '1');
    await expect(page.locator('#resumo')).toHaveCSS('opacity', '0');
    await jumpTo(page, 'resumo');
    await expect(page.locator('#resumo')).toHaveCSS('opacity', '1');
  });

  test('não anima com movimento reduzido', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/s3/');
    const summary = page.locator('#resumo');
    await expect(summary).toHaveCSS('opacity', '1');
    await expect(summary).toHaveCSS('transform', 'none');
    await expect(summary).toHaveCSS('transition-duration', '0s');
  });
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('o texto continua legível e as âncoras funcionam', async ({ page }) => {
    await page.goto('/s3/');
    await expect(page.locator('#resumo')).toHaveCSS('opacity', '1');
    await page.goto('/s3/#analogia');
    await expect(page.locator('#analogia--heading')).toBeInViewport();
  });

  test('as abas de código mostram todas as linguagens', async ({ page }) => {
    await page.goto('/s3/');
    const panels = page.locator('[data-code-tabs]').first().locator('[role="tabpanel"]');
    await expect(panels).toHaveCount(2);
    for (const panel of await panels.all()) await expect(panel).toBeVisible();
  });
});

test.describe('teclado', () => {
  test.skip(({ isMobile }) => isMobile, 'Tab é do desktop');

  test('o primeiro Tab mostra o link para pular ao conteúdo', async ({ page }) => {
    await page.goto('/s3/');
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main"]');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });
});

test('o link âncora copia o endereço da seção', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/s3/#analogia');
  await page.locator('#analogia [data-copy-link]').click();
  await expect(page).toHaveURL(/#analogia$/);
  await expect(page.locator('#analogia [role="status"]')).toHaveText('Link copiado');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toMatch(/\/s3\/#analogia$/);
});
