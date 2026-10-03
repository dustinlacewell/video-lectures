import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: 'player',
  /** Voice clips and durations.json: served at the page root in dev, copied into dist on build. */
  publicDir: '../voice/clips',
  build: { outDir: '../dist', emptyOutDir: true },
  test: { root: '.', include: ['test/**/*.test.ts'] }
});
