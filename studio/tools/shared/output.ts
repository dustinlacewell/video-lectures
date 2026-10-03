/* Imperative shell: write result files under the --out folder. */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/** Write `data` to <out>/<rel>, making folders as needed. Returns the absolute path. */
export function writeOut(out: string, rel: string, data: string | Buffer): string {
  const path = resolve(out, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, data);
  return path;
}

/** A PNG data URL as bytes. */
export function pngBytes(dataUrl: string): Buffer {
  return Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
}
