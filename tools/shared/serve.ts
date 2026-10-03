/* Serve a built player folder over HTTP on a free local port. */

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf'
};

export interface Served { url: string; close(): Promise<void> }

export async function serveDir(dir: string): Promise<Served> {
  const root = resolve(dir);
  if (!existsSync(join(root, 'index.html'))) throw new Error('no index.html in ' + root);
  const server = createServer(function (req, res) {
    const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
    const file = normalize(join(root, path.endsWith('/') ? path + 'index.html' : path));
    if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  await new Promise<void>(function (r) { server.listen(0, '127.0.0.1', r); });
  const addr = server.address();
  if (!addr || typeof addr === 'string') throw new Error('server has no port');
  return {
    url: 'http://127.0.0.1:' + addr.port + '/',
    close: function () {
      server.closeAllConnections();
      return new Promise<void>(function (r) { server.close(function () { r(); }); });
    }
  };
}
