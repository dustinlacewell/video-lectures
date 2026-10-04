/* The Vite and Vitest config of every video: the engine's player page, filled from the video's video.json,
   playing the video's video.ts and scenes/index.ts, with its voice clips served at the page root. */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import type { Plugin } from 'vite';
import type { ViteUserConfig } from 'vitest/config';
import { fillPage, type VideoMeta } from './player/page.ts';
import type { VideoData } from './video.ts';

const PLAYER = fileURLToPath(new URL('./player', import.meta.url));
const META = fileURLToPath(new URL('./meta.ts', import.meta.url));

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
    plugins: [videoPage(join(dir, 'video.json')), videoMeta(dir)],
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

/** Writes dist/meta.json: runtime and chapters, from the same pure timeline the player builds. Build only. */
function videoMeta(dir: string): Plugin {
  let outDir = join(dir, 'dist');
  return {
    name: 'studio-video-meta',
    apply: 'build',
    configResolved: function (config) { outDir = config.build.outDir; },
    writeBundle: async function () {
      const slug = JSON.parse(readFileSync(join(dir, 'video.json'), 'utf8')).slug as string;
      const clipsFile = join(dir, 'voice/clips/durations.json');
      const clips = existsSync(clipsFile) ? JSON.parse(readFileSync(clipsFile, 'utf8')) : {};
      const meta = await buildVideoMeta(dir, slug, clips);
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'meta.json'), JSON.stringify(meta));
    }
  };
}

/**
 * `video.ts` (and `meta.ts`'s own `timeline.ts`) import through plain extensionless specifiers, meant
 * for Vite's resolver, not raw Node ESM. A short-lived middleware-mode server (same alias as the real
 * build) loads both the way the player bundle does, then closes.
 */
async function buildVideoMeta(dir: string, slug: string, clips: Record<string, number>): Promise<unknown> {
  const server = await createServer({
    root: PLAYER,
    envDir: dir,
    configFile: false,
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true },
    resolve: { alias: { 'virtual:video': join(dir, 'video.ts'), 'virtual:meta': META } }
  });
  try {
    const video = ((await server.ssrLoadModule('virtual:video')) as { default: VideoData }).default;
    const { buildMeta } = await server.ssrLoadModule('virtual:meta') as typeof import('./meta.ts');
    return buildMeta(slug, video.script, clips, video.cast);
  } finally {
    await server.close();
  }
}
