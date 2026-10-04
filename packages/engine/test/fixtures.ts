/* A small script and cast for engine tests. Shaped like a real video: an untitled still opener,
   a titled chapter with fixed, moving and carried cameras, sounds, cues and a card, and a short last chapter. */

import type { Cast, CastMember, ChapterScript } from '../src/script';

const you: CastMember = { name: 'You', ref: 'refs/you.wav' };

export const CAST: Cast = {
  narrator: { name: 'Narrator', ref: 'refs/narrator.wav' },
  you: you,
  zombie: { ...you, name: 'Zombie' },
  friend: { name: 'Friend', ref: 'refs/friend.wav' }
};

export const SCRIPT: ChapterScript[] = [
  {
    id: 'title', short: 'Title', root: 220, scale: [0, 4, 7],
    beats: [{ id: 'title.t', dur: 6, still: true, cam: { x: 640, y: 360, z: 1 } }]
  },
  {
    id: 'physics', title: 'Physics', short: 'Physics', root: 196, scale: [0, 3, 7],
    beats: [
      { id: 'physics.atoms', say: 'Everything you see is made of atoms.', cam: { x: 900, y: 380, z: 1.2 } },
      { id: 'physics.laws', say: 'Atoms follow the laws of physics, and nothing else.', sfx: [[0.6, 'blip'], [1.2, 'blip', 2]] },
      { id: 'physics.spirit', say: 'A spirit tries to push one.', dur: 5.2, camT: 1.2, cam: { x: 1100, y: 400, z: 1.4 } },
      { id: 'physics.fall', say: 'The first domino falls, and the chain follows.', cam: S => ({ x: 1100 + 30 * S.bt, y: 400, z: 1.4 }) },
      { id: 'physics.stop', say: 'Nothing reached it.', cam: { x: 1290, y: 420, z: 1.5 } },
      { id: 'physics.card', card: 'Atoms do *all* the work.' }
    ],
    cues: [['physics.fall', 0.5, 'thud']]
  },
  {
    id: 'form', title: 'Form', short: 'Form', root: 247, scale: [0, 2, 5],
    beats: [
      { id: 'form.lever1', say: 'Pull the lever.', cam: { x: 640, y: 360, z: 1 } },
      { id: 'form.lever2', say: 'It lifts the weight.', still: true }
    ]
  }
];
