import { ease, lerp } from '../engine/math';
import { CHAIN, LOOP } from '../scenes/03-body.layout';
import type { ChapterCue, ChapterScript } from './types';

/** Start deep inside the body, then pull back to the whole figure. */
function pullBack(S: { since(key: string): number }) {
  const u = ease((S.since('you') - 1.8) / 2.8);
  return { x: 640, y: lerp(500, 400, u), z: Math.exp(lerp(Math.log(5.2), Math.log(1.15), u)) };
}

function chainZaps(): ChapterCue[] {
  const out: ChapterCue[] = [];
  for (let l = 0; l < 2; l++) for (let k = 0; k < CHAIN; k++) out.push(['body.brain', 1.0 + l * LOOP + k * 0.25, 'zap', k]);
  return out;
}

export const body: ChapterScript = {
  id: 'body', title: 'Your body is this kind of machine', short: 'Body', root: 220, scale: [0, 3, 5, 7, 10, 12],
  beats: [
    { id: 'body.you', say: 'You are made of the same particles. So the same rules apply to you.', cam: pullBack, camT: 0.01 },
    { id: 'body.lift', say: 'Lift your arm.', dur: 4.6, cam: { x: 640, y: 400, z: 1.15 }, sfx: [[1.2, 'rise']] },
    { id: 'body.muscle', say: 'It rose because a muscle shortened. The muscle shortened because a nerve fired.', cam: { x: 790, y: 400, z: 2.0 }, sfx: [[0.3, 'fall'], [1.8, 'rise'], [1.8, 'pop'], [4.4, 'zap'], [4.6, 'zap', 1], [4.8, 'zap', 2]] },
    { id: 'body.brain', say: 'The nerve fired because cells in your brain fired. And those fired because others fired first.', cam: { x: 640, y: 296, z: 6.0 } },
    { id: 'body.trace', say: 'Follow it back as far as you like. Through what you saw, what you learned, what you wanted.', cam: { x: 628, y: 300, z: 6.0 }, sfx: [[0.6, 'pop'], [2.0, 'pop', 1], [3.4, 'pop', 2]] },
    { id: 'body.nogap', say: 'Nowhere does the chain break so that something non-physical can reach in.', sfx: [[0.2, 'boo'], [1.6, 'whoosh'], [2.6, 'fail']] },
    { id: 'body.name', card: 'This machinery has a name: cognition.' },
    { id: 'body.list', say: 'Perceiving. Remembering. Wanting. Deciding. All of it is form doing what form does.', cam: { x: 640, y: 420, z: 1.42 }, sfx: [[0.5, 'pop'], [1.5, 'pop', 1], [2.5, 'pop', 2], [3.5, 'pop', 3]] }
  ],
  cues: chainZaps()
};
