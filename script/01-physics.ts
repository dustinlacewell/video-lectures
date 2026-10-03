import { DELTA, LAND, N, PUSH, ds, x0 } from '../scenes/01-physics.layout';
import type { ChapterCue, ChapterScript } from './types';

/** The camera follows the falling chain. */
function followChain(S: { since(key: string): number }) {
  const u = S.since('fall') - PUSH;
  return { x: Math.max(500, Math.min(1010, x0 + Math.max(0, u) / DELTA * ds + 130)), y: 420, z: 1.45 };
}

function dominoTicks(): ChapterCue[] {
  const out: ChapterCue[] = [];
  for (let i = 0; i < N - 1; i++) out.push(['physics.fall', PUSH + (i + 1) * DELTA, 'tick', i % 4]);
  out.push(['physics.fall', PUSH, 'tick', 1]);
  out.push(['physics.fall', PUSH + LAND, 'thud']);
  return out;
}

export const physics: ChapterScript = {
  id: 'physics', title: 'Only physical things push', short: 'Physics', root: 196, scale: [0, 2, 4, 7, 9, 12],
  beats: [
    { id: 'physics.atoms', say: 'Everything around you is made of the same few kinds of particle, pushed by the same few forces.', cam: { x: 214, y: 450, z: 7.5 } },
    { id: 'physics.laws', say: 'Physicists have tested those laws to absurd precision. Nothing else has ever been caught pushing on matter.', cam: { x: 262, y: 440, z: 4.0 }, sfx: [[1.6, 'blip'], [2.3, 'blip'], [3.0, 'blip'], [3.7, 'ding']] },
    { id: 'physics.fall', say: 'So things happen for physical reasons. This domino falls because that one hit it.', camT: 1.4, cam: followChain, sfx: [[0.3, 'swish']] },
    { id: 'physics.stop', say: 'The chain ends here. Nothing reached the last domino, so it stands.', cam: { x: 1290, y: 420, z: 1.5 } },
    { id: 'physics.ghost', say: 'Could something non-physical knock it over? Let’s try a ghost.', cam: { x: 1560, y: 404, z: 1.62 }, sfx: [[0.1, 'boo'], [1.8, 'whoosh'], [2.7, 'fail']] },
    { id: 'physics.spirit', say: 'A spirit.', dur: 5.2, sfx: [[0.1, 'whoosh'], [1.3, 'swish'], [2.4, 'swish'], [3.4, 'fail']] },
    { id: 'physics.thought', say: 'A thought. A very determined thought.', dur: 5.4, sfx: [[0.1, 'whoosh'], [3.3, 'fail']] },
    { id: 'physics.nothing', say: 'Nothing. To move matter you need matter, or a force that instruments can measure.' },
    { id: 'physics.finger', say: 'A finger works fine. It is physical.', dur: 5.2, sfx: [[0.3, 'swish'], [1.0, 'tick', 2], [1.55, 'thud'], [1.7, 'pop', 2]] },
    { id: 'physics.claim', card: 'If it happened, something physical made it happen.' }
  ],
  cues: dominoTicks()
};
