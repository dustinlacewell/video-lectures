/* Vite plugin: reads every videos/<slug>/video.json at build time, writes the cards into index.html, and publishes each poster at /<slug>/poster.png. */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { parseVideo, posterPath, renderCards, sortVideos, type Video } from './src/catalog.ts';

const SITE_URL = 'https://lectures.ldlework.com/';

export function catalog(videosDir: string): Plugin {
  const load = () => readVideos(videosDir);
  return {
    name: 'catalog',
    transformIndexHtml(html) {
      const videos = load();
      return html
        .replace('<!--cards-->', renderCards(videos))
        .replace('%OG_IMAGE%', videos.length ? SITE_URL + posterPath(videos[0]) : '');
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const v = load().find(x => req.url === '/' + posterPath(x));
        if (!v) return next();
        res.setHeader('Content-Type', 'image/png');
        res.end(readFileSync(join(videosDir, v.slug, v.poster)));
      });
    },
    generateBundle() {
      for (const v of load()) {
        this.emitFile({ type: 'asset', fileName: posterPath(v), source: readFileSync(join(videosDir, v.slug, v.poster)) });
      }
    }
  };
}

function readVideos(videosDir: string): Video[] {
  const videos = readdirSync(videosDir)
    .map(dir => join(videosDir, dir, 'video.json'))
    .filter(existsSync)
    .map(file => parseVideo(JSON.parse(readFileSync(file, 'utf8')), file));
  return sortVideos(videos);
}
