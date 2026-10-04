import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { catalog } from './catalogPlugin.ts';

const videosDir = fileURLToPath(new URL('../videos', import.meta.url));
const distDir = fileURLToPath(new URL('../dist', import.meta.url));

export default defineConfig({
  plugins: [catalog(videosDir, distDir)],
  /** Video builds land in ../dist/<slug> first; the site build must not wipe them. */
  build: { outDir: '../dist', emptyOutDir: false }
});
