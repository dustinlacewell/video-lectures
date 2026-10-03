import type { ChapterScript } from './types';

export const zombie: ChapterScript = {
  id: 'zombie', title: 'Meet your zombie twin', short: 'Zombie', root: 185, scale: [0, 3, 5, 7, 10, 12],
  beats: [
    { id: 'zombie.intro', say: 'Let’s try a thought experiment.', cam: { x: 520, y: 450, z: 1.3 } },
    { id: 'zombie.movie', say: 'Imagine a zombie. Not the movie kind.', dur: 5.6, cam: { x: 650, y: 432, z: 1.18 }, sfx: [[0.3, 'boo'], [0.4, 'pop'], [2.4, 'fail'], [2.4, 'stamp']] },
    { id: 'zombie.copy', say: 'A philosophical zombie is a copy of you, particle for particle.', sfx: [[0.5, 'scan'], [2.4, 'ding']] },
    { id: 'zombie.same', say: 'Same body. Same brain. Same cognition.', dur: 5.6, sfx: [[0.4, 'pop'], [1.5, 'pop', 1], [2.6, 'pop', 2]] },
    { id: 'zombie.diff', say: 'For the sake of the experiment, give it one difference: no inner experience. No lights on inside.', sfx: [[0.5, 'spark'], [1.5, 'spark'], [2.8, 'unpop']] },
    { id: 'zombie.ask', say: 'So let’s ask. Hey, are you conscious?' },
    { id: 'zombie.yes', say: 'Yes. Obviously. I am experiencing this right now.', speaker: ['you', 'zombie'], stagger: 0.25 },
    { id: 'zombie.must', say: 'The zombie gives the same response you do, for all the same physical reasons.', sfx: [[0.6, 'pop'], [2.4, 'pop', 1]] },
    { id: 'zombie.toe', say: 'Step on its toe. It yelps, hops, and holds a grudge.', sfx: [[0.9, 'swish'], [1.25, 'stamp'], [1.3, 'yelp']] },
    { id: 'zombie.pain', say: 'The ouch, the recoil, the lingering dread: all of that is cognition. So the zombie has all of it.', sfx: [[0.5, 'pop'], [1.2, 'pop', 1], [1.9, 'pop', 2]] },
    { id: 'zombie.sure', say: 'It is exactly as sure as you are that it is the conscious one.', sfx: [[0.4, 'talk'], [0.65, 'talk', 2], [1.0, 'talk', 1]] },
    { id: 'zombie.claim', card: 'Inner experience cannot be responsible for what you say or do.' }
  ]
};
