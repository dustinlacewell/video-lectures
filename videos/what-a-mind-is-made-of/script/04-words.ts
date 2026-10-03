import type { ChapterScript } from './types';

export const words: ChapterScript = {
  id: 'words', title: 'This word, and not that one', short: 'Words', root: 196, scale: [0, 3, 5, 7, 10, 12],
  beats: [
    { id: 'words.speak', say: 'Speaking is an action too. But the moving mouth is not the interesting part.', cam: { x: 480, y: 400, z: 1.5 }, sfx: [[0.5, 'talk'], [0.75, 'talk', 1], [1.0, 'talk', 2], [1.3, 'talk']] },
    { id: 'words.which', say: 'The interesting part is which words come out. Why this, and not that?', sfx: [[0.4, 'pop'], [1.4, 'unpop'], [2.0, 'unpop'], [2.6, 'unpop']] },
    { id: 'words.ask1', say: 'Coffee or tea?', speaker: 'friend', dur: 2.4, cam: { x: 400, y: 410, z: 1.4 } },
    { id: 'words.weigh', say: 'Your cognition weighs it. Memories, taste, habit. One answer wins.', cam: { x: 790, y: 340, z: 1.12 }, sfx: [[0.3, 'whoosh'], [1.95, 'pop'], [2.95, 'pop', 1], [3.95, 'pop', 2], [4.7, 'ding']] },
    { id: 'words.ans1', say: 'Coffee.', speaker: 'you', dur: 1.8 },
    { id: 'words.selected', say: 'A physical process selected that word.', dur: 3.0 },
    { id: 'words.stranger', say: 'Now a stranger question.', dur: 2.4, cam: { x: 650, y: 370, z: 1.06 } },
    { id: 'words.ask2', say: 'Are you conscious?', speaker: 'friend', dur: 6.0, sfx: [[1.95, 'pop'], [2.85, 'pop', 1], [3.75, 'pop', 2], [4.8, 'ding']] },
    { id: 'words.ans2', say: 'Yes. Obviously. I am experiencing this right now.', speaker: 'you' },
    { id: 'words.same', say: 'That sentence was selected the same way. Cognition produced it, word by word.', sfx: [[0.8, 'swish']] },
    { id: 'words.claim', card: '“I am conscious” is an output of cognition.' },
    { id: 'words.cause', say: 'Whatever else is true of experience, your report of it has physical causes.', cam: { x: 660, y: 350, z: 1.12 } }
  ]
};
