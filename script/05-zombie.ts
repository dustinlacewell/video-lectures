import type { ChapterScript } from './types';

export const zombie: ChapterScript = {
  id: 'zombie', title: 'Meet your zombie twin', short: 'Zombie', root: 185, scale: [0, 3, 5, 7, 10, 12],
  beats: [
    { id: 'zombie.intro', say: 'Philosophers built a thought experiment for exactly this.', cam: { x: 520, y: 450, z: 1.3 } },
    { id: 'zombie.movie', say: 'It is called a zombie. Not the movie kind.', dur: 5.6, cam: { x: 650, y: 432, z: 1.18 }, sfx: [[0.3, 'boo'], [0.4, 'pop'], [2.4, 'fail'], [2.4, 'stamp']] },
    { id: 'zombie.copy', say: 'A philosophical zombie is a copy of you, particle for particle.', sfx: [[0.5, 'scan'], [2.4, 'ding']] },
    { id: 'zombie.same', say: 'Same body. Same brain. Same cognition.', dur: 5.6, sfx: [[0.4, 'pop'], [1.5, 'pop', 1], [2.6, 'pop', 2]] },
    { id: 'zombie.diff', say: 'One difference. The zombie has no inner conscious experience.', sfx: [[0.5, 'spark'], [2.0, 'unpop']] },
    { id: 'zombie.dark', say: 'There is nothing it is like to be the zombie. No felt redness. No felt pain.', cam: { x: 850, y: 430, z: 1.45 }, sfx: [[2.0, 'pop'], [3.4, 'pop', 1]] },
    { id: 'zombie.ask', say: 'So ask it. Are you conscious?', dur: 5.0, cam: { x: 650, y: 432, z: 1.18 }, sfx: [[0.6, 'talk', 2], [0.85, 'talk', 3], [1.1, 'talk', 1]] },
    { id: 'zombie.yes', say: '“Yes. Obviously. I am experiencing this right now.”', dur: 6.4, sfx: [[0.3, 'talk'], [0.55, 'talk', 1], [0.9, 'talk'], [1.2, 'talk', 2], [2.6, 'talk'], [2.85, 'talk', 1], [3.2, 'talk']] },
    { id: 'zombie.must', say: 'It has to say that. Its brain has the same form as yours, and form is function.', sfx: [[0.6, 'pop'], [2.4, 'pop', 1], [3.4, 'ding']] },
    { id: 'zombie.toe', say: 'Step on its toe. It yelps, hops, and holds a grudge.', sfx: [[0.9, 'swish'], [1.25, 'stamp'], [1.3, 'yelp']] },
    { id: 'zombie.pain', say: 'The ouch, the recoil, the lingering dread: all of that is cognition. So the zombie has all of it.', sfx: [[0.5, 'pop'], [1.2, 'pop', 1], [1.9, 'pop', 2]] },
    { id: 'zombie.sure', say: 'It is exactly as sure as you are that it is the conscious one.', sfx: [[0.4, 'talk'], [0.65, 'talk', 2], [1.0, 'talk', 1]] },
    { id: 'zombie.claim', card: 'Inner experience does none of the work.' }
  ]
};
