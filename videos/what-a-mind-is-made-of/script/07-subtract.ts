import { ZC } from '../scenes/06-inventory.layout';
import { CHECK_STEP, REM } from '../scenes/07-subtract.layout';
import type { ChapterCue } from '@studio/engine/script';
import type { ChapterScript } from './types';

function checksAndRemovals(): ChapterCue[] {
  const out: ChapterCue[] = [];
  for (let k = 0; k < 8; k++) out.push(['subtract.s1b', 0.5 + k * CHECK_STEP, 'blip']);
  REM.forEach(function (r) { out.push(['subtract.s2b', r[1], 'unpop']); });
  return out;
}

export const subtract: ChapterScript = {
  id: 'subtract', title: 'Two subtractions', short: 'Subtract', root: 196, scale: [0, 3, 5, 7, 10, 12],
  beats: [
    { id: 'subtract.s1', say: 'Now try two subtractions.', dur: 4.6, cam: { x: 640, y: 420, z: 1 } },
    { id: 'subtract.s1a', say: 'First, take away the inner experience and keep the cognition.', sfx: [[0.5, 'pop'], [2.2, 'unpop'], [2.25, 'swish']] },
    { id: 'subtract.s1b', say: 'That is the zombie. Nothing anyone loved about you is missing.' },
    { id: 'subtract.s2a', say: 'Second, keep the inner experience and take away the cognition.', cam: { x: ZC, y: 420, z: 1 }, sfx: [[0.2, 'whoosh'], [1.8, 'pop']] },
    { id: 'subtract.s2b', say: 'No memories. No beliefs. No habits, talents, loves or plans.', dur: 7.2 },
    { id: 'subtract.s2c', say: 'Whatever is left, it is not you. It is not anyone.', cam: { x: ZC, y: 470, z: 1.45 }, sfx: [[0.6, 'spark']] },
    { id: 'subtract.claim', card: 'You are not your consciousness. You are your cognition.' }
  ],
  cues: checksAndRemovals()
};
