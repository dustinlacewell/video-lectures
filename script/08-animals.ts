import type { ChapterScript } from './types';

export const animals: ChapterScript = {
  id: 'animals', title: 'Animals, and AI', short: 'Animals & AI', root: 220, scale: [0, 2, 4, 7, 9, 12],
  beats: [
    { id: 'animals.animals', say: 'The same is true of animals.', dur: 4.8, cam: { x: 585, y: 420, z: 1.2 } },
    { id: 'animals.three', say: 'A crow that makes tools. A dog that misses you. An octopus that solves puzzles.', sfx: [[0.4, 'pop'], [1.5, 'pop', 1], [2.6, 'pop', 2]] },
    { id: 'animals.are', say: 'What each of them is, is in its cognition.', dur: 5.2, sfx: [[0.4, 'pop'], [0.7, 'pop', 1], [1.0, 'pop', 2], [1.3, 'pop', 3], [1.6, 'pop'], [1.9, 'pop', 1]] },
    { id: 'animals.ai', say: 'And the same is true of AI.', dur: 5.2, cam: { x: 1500, y: 410, z: 1.3 }, sfx: [[0.2, 'whoosh'], [1.6, 'pop'], [2.2, 'pop', 1], [2.8, 'pop', 2]] },
    { id: 'animals.ask', say: 'People ask whether they are conscious, as if the answer settles how we ought to treat them.', cam: { x: 895, y: 372, z: 0.8 }, sfx: [[0.5, 'spark'], [1.0, 'pop'], [1.35, 'pop', 1], [1.7, 'pop', 2], [2.05, 'pop', 3]] },
    { id: 'animals.trivia', say: 'Whether a being is conscious is tantamount to trivia. It has no moral or ethical import.', sfx: [[2.4, 'stamp'], [2.7, 'stamp'], [3.0, 'stamp'], [3.3, 'stamp'], [3.6, 'stamp']] },
    { id: 'animals.why', say: 'Conscious or not, a being does, wants, remembers and fears exactly the same things.', sfx: [[0.3, 'swish']] },
    { id: 'animals.matters', say: 'What matters is how sophisticated its cognition is, and how richly it models itself.', sfx: [[0.6, 'ding'], [3.0, 'spark']] },
    { id: 'animals.claim', card: 'For the purposes of ethics, a mind is its cognition.' },
    { id: 'animals.end', dur: 7, cam: { x: 640, y: 360, z: 1 }, camT: 0.01, still: true, sfx: [[0.2, 'card']] }
  ]
};
