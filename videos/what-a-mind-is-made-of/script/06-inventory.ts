import { ZC } from '../scenes/06-inventory.layout';
import type { ChapterCue, ChapterScript } from './types';

function itemPops(): ChapterCue[] {
  const out: ChapterCue[] = [];
  for (let k = 0; k < 8; k++) out.push(['inventory.zall', 0.3 + k * 0.32, 'pop', k % 4]);
  return out;
}

export const inventory: ChapterScript = {
  id: 'inventory', title: 'What makes you you', short: 'Inventory', root: 220, scale: [0, 2, 4, 7, 9, 12],
  beats: [
    { id: 'inventory.you', say: 'So what makes you you? Take inventory.', dur: 5.0, cam: { x: 640, y: 420, z: 1 } },
    { id: 'inventory.m1', say: 'Your memories. Your habits. Your beliefs.', dur: 5.6, sfx: [[0.3, 'pop'], [1.9, 'pop', 1], [3.5, 'pop', 2]] },
    { id: 'inventory.m2', say: 'Your talents. Your loves. Your fears.', dur: 5.6, sfx: [[0.3, 'pop', 3], [1.9, 'pop', 2], [3.5, 'pop', 1]] },
    { id: 'inventory.m3', say: 'Your sense of humor. Your plans for next year.', dur: 5.4, sfx: [[0.3, 'pop'], [2.6, 'pop', 2]] },
    { id: 'inventory.cog', say: 'Every item on that list is cognition: physical structure in your brain, doing what its form dictates.', sfx: [[0.6, 'swish'], [1.6, 'ding']] },
    { id: 'inventory.z', say: 'Now check the zombie.', dur: 4.8, cam: { x: ZC, y: 420, z: 1 }, sfx: [[0.2, 'whoosh']] },
    { id: 'inventory.zwhy', say: 'It has no inner experience. But it is physically identical, so it has the same cognitive machinery.', sfx: [[0.4, 'pop'], [2.6, 'pop', 1], [5.0, 'pop', 2]] },
    { id: 'inventory.zall', say: 'So it has every item. Your memories, your habits, your loves, your plans.' },
    { id: 'inventory.zlife', say: 'It loves your family. It keeps your promises. It laughs at your jokes, for your reasons.', sfx: [[0.5, 'spark'], [3.0, 'spark'], [5.4, 'spark']] }
  ],
  cues: itemPops()
};
