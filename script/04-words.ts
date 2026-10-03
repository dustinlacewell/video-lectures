import type { ChapterScript } from './types';

export const words: ChapterScript = {
  id: 'words', title: 'This word, and not that one', short: 'Words', root: 196, scale: [0, 3, 5, 7, 10, 12],
  beats: [
    { id: 'words.speak', say: 'Speaking is an action too. But the moving mouth is not the interesting part.', cam: { x: 480, y: 400, z: 1.5 }, sfx: [[0.5, 'talk'], [0.75, 'talk', 1], [1.0, 'talk', 2], [1.3, 'talk']] },
    { id: 'words.which', say: 'The interesting part is which words come out. Why this, and not that?', sfx: [[0.4, 'pop'], [1.4, 'unpop'], [2.0, 'unpop'], [2.6, 'unpop']] },
    { id: 'words.ask1', say: 'Someone asks: coffee or tea?', dur: 4.8, cam: { x: 400, y: 410, z: 1.4 }, sfx: [[0.4, 'talk', 2], [0.65, 'talk', 3], [0.9, 'talk', 2]] },
    { id: 'words.weigh', say: 'Your cognition weighs it. Memories, taste, habit. One answer wins.', cam: { x: 790, y: 340, z: 1.12 }, sfx: [[0.3, 'whoosh'], [1.95, 'pop'], [2.95, 'pop', 1], [3.95, 'pop', 2], [4.7, 'ding']] },
    { id: 'words.ans1', say: '“Coffee.” A physical process selected that word.', sfx: [[0.3, 'talk'], [0.5, 'talk', 1]] },
    { id: 'words.ask2', say: 'Now a stranger question. Are you conscious?', dur: 7.2, sfx: [[0.5, 'talk', 2], [0.75, 'talk', 3], [1.0, 'talk', 1], [3.15, 'pop'], [4.05, 'pop', 1], [4.95, 'pop', 2], [5.7, 'ding']] },
    { id: 'words.ans2', say: '“Yes. Obviously. I am experiencing this right now.”', dur: 5.6, sfx: [[0.3, 'talk'], [0.55, 'talk', 1], [0.9, 'talk'], [1.2, 'talk', 2], [1.5, 'talk', 1]] },
    { id: 'words.same', say: 'That sentence was selected the same way. Cognition produced it, word by word.', sfx: [[0.8, 'swish']] },
    { id: 'words.claim', card: '“I am conscious” is an output of cognition.' },
    { id: 'words.cause', say: 'Whatever else is true of experience, your report of it has a physical cause.', cam: { x: 640, y: 350, z: 1.18 } }
  ]
};
