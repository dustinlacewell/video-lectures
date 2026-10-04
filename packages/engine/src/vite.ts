/* The Vite and Vitest config of every video: the engine's player page, filled from the video's video.json,
   playing the video's video.ts and scenes/index.ts, with its voice clips served at the page root. */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import type { ViteUserConfig } from 'vitest/config';
import { fillPage, type VideoMeta } from './player/page.ts';

const PLAYER = fileURLToPath(new URL('./player', import.meta.url));

/** `dir`: the video folder. A video's vite.config.ts is `export default studioConfig(import.meta.dirname)`. */
export function studioConfig(dir: string): ViteUserConfig {
  return {
    root: PLAYER,
    envDir: dir,
    cacheDir: join(dir, 'node_modules/.vite'),
    /** Voice clips and durations.json: served at the page root in dev, copied into dist on build. */
    publicDir: join(dir, 'voice/clips'),
    build: { outDir: join(dir, 'dist'), emptyOutDir: true },
    resolve: { alias: { 'virtual:video': join(dir, 'video.ts'), 'virtual:scenes': join(dir, 'scenes/index.ts') } },
    plugins: [videoPage(join(dir, 'video.json'))],
    test: { root: dir, include: ['test/**/*.test.ts'] }
  };
}

function videoPage(file: string): Plugin {
  return {
    name: 'studio-video-page',
    transformIndexHtml: function (html) {
      return fillPage(html, JSON.parse(readFileSync(file, 'utf8')) as VideoMeta);
    }
  };
}
