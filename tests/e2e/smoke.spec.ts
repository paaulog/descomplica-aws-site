import { expect, test } from '@playwright/test';

const pages = [
  { path: '/', lang: 'pt-BR' },
  { path: '/en/', lang: 'en' },
  { path: '/s3/', lang: 'pt-BR' },
  { path: '/en/s3/', lang: 'en' },
];

for (const { path, lang } of pages) {
  test(`${path} responde 200 com <html lang="${lang}">`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
  });
}

test('serviço "em breve" não gera rota', async ({ request }) => {
  const response = await request.get('/ec2/');
  expect(response.status()).toBe(404);
});
