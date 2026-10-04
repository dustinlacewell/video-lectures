/* Shell: read each cast member's reference clip from disk -> its audio hash and transcript. */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Cast, Refs } from './manifest';

/** voiceDir is the voice/ folder; cast refs are relative to it. A missing clip is left out. */
export function readRefs(cast: Cast, voiceDir: string): Refs {
  const out: Refs = {};
  for (const m of Object.values(cast)) {
    const wav = join(voiceDir, m.ref), txt = wav.replace(/\.wav$/i, '.txt');
    if (out[m.ref] || !existsSync(wav)) continue;
    out[m.ref] = {
      hash: createHash('sha256').update(readFileSync(wav)).digest('hex'),
      text: existsSync(txt) ? readFileSync(txt, 'utf8').trim() : undefined
    };
  }
  return out;
}
