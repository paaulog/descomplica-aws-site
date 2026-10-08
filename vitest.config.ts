/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      // The pure S3 logic is where a bug would teach something wrong.
      thresholds: { 'src/lib/s3/**': { lines: 95, branches: 90 } },
    },
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
          // The build test runs a real `astro build`.
          testTimeout: 180_000,
        },
      },
    ],
  },
});
