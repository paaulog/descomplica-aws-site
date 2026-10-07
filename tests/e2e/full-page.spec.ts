import { expect, test } from '@playwright/test';
import { author } from '../../src/data/author';
import { pricing } from '../../src/data/pricing';
import { formatCalendarDate } from '../../src/lib/i18n/format';

const SECTION_COUNT = 18;

const pages = [
  { path: '/s3/', locale: 'pt-br', costs: 'custos-sem-susto', summary: 'resumo' },
  { path: '/en/s3/', locale: 'en', costs: 'costs-without-surprises', summary: 'summary' },
] as const;

for (const { path, locale, costs, summary } of pages) {
  test.describe(`página completa ${path}`, () => {
    test('percorre as 18 seções, cada uma com título visível e gancho ou fechamento', async ({
      page,
    }) => {
      await page.goto(path);
      const sections = page.locator('article > section');
      await expect(sections).toHaveCount(SECTION_COUNT);
      const ids = await sections.evaluateAll((nodes) => nodes.map((node) => node.id));
      for (const id of ids) {
        await page.evaluate((anchor) => {
          document.getElementById(anchor)?.scrollIntoView({ block: 'start', behavior: 'instant' });
        }, id);
        await expect(page.locator(`#${id}--heading`)).toBeInViewport();
      }
      const withoutHook = await sections.evaluateAll((nodes) =>
        nodes.filter((node) => !node.querySelector('[data-next-hook]')).map((node) => node.id),
      );
      expect(withoutHook).toEqual([]);
    });

    test('a seção de custos mostra a data de verificação dos preços', async ({ page }) => {
      await page.goto(`${path}#${costs}`);
      const note = page.locator(`#${costs} [data-pricing-note] time`);
      await expect(note).toHaveAttribute('datetime', pricing.verifiedAt);
      await expect(note).toContainText(formatCalendarDate(pricing.verifiedAt, locale));
    });

    test('o resumo tem links para LinkedIn, GitHub e o próximo serviço', async ({ page }) => {
      await page.goto(`${path}#${summary}`);
      const authorLinks = page.locator(`#${summary} [data-author-link]`);
      await expect(authorLinks).toHaveCount(author.links.length);
      for (const [index, link] of author.links.entries()) {
        await expect(authorLinks.nth(index)).toHaveAttribute('href', link.href);
        await expect(authorLinks.nth(index)).toHaveText(link.label);
      }
      await page.locator(`#${summary} [data-next-service]`).click();
      await expect(page).toHaveURL(/\/#services-heading$/);
      await expect(page.locator('article[data-service="ec2"]')).toBeVisible();
    });
  });
}
