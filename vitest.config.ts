/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig herda a config do Astro (plugin React, Tailwind, aliases) para os testes.
export default getViteConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'unit-dom',
          include: ['tests/unit/**/*.test.tsx'],
          environment: 'happy-dom',
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          environment: 'node',
          // O teste de build roda `astro build` de verdade.
          testTimeout: 180_000,
        },
      },
    ],
  },
});
