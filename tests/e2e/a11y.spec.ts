import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const BLOCKING_IMPACTS = new Set(['serious', 'critical']);
const routes = ['/', '/en/', '/s3/', '/en/s3/'];
const themes = ['light', 'dark'] as const;

test.describe('acessibilidade (axe)', () => {
  test.skip(({ isMobile }) => isMobile, 'as regras do axe não mudam com a largura da tela');

  for (const route of routes) {
    for (const theme of themes) {
      test(`${route} no tema ${theme} não tem violações serious ou critical`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
        await page.goto(route);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        // client:visible islands only hydrate once on screen, so each one is scrolled into view.
        for (const island of await page.locator('astro-island').all()) {
          await island.scrollIntoViewIfNeeded();
        }
        await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
        const { violations } = await new AxeBuilder({ page }).analyze();
        const blocking = violations
          .filter((violation) => BLOCKING_IMPACTS.has(violation.impact ?? ''))
          .map(
            (violation) => `${violation.id}: ${violation.nodes.map((n) => n.target).join(' | ')}`,
          );
        expect(blocking).toEqual([]);
      });
    }
  }
});
