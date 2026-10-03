/* A two-chapter video in the contract's shapes, shared by the tests. */

import { timedBeats, chaptersOf } from '../shared/beats.ts';
import type { Info, ScriptChapter } from '../shared/contract.ts';

export const SCRIPT: ScriptChapter[] = [
  { id: 'intro', beats: [{ id: 'intro.t', dur: 4 }] },
  {
    id: 'zombie', title: 'Meet your zombie twin', beats: [
      { id: 'zombie.ask', say: 'So let’s ask. Hey, are you *conscious*?' },
      { id: 'zombie.yes', say: 'Yes. Obviously.', speaker: ['you', 'zombie'], stagger: 0.25 },
      { id: 'zombie.toe', say: 'Ouch!', speaker: 'you', dur: 5 },
      { id: 'zombie.claim', card: 'Inner experience cannot be responsible.' }
    ]
  }
];

/** intro 0-4; zombie 4-26 with a 3.4 s title beat first. */
export const INFO: Info = {
  total: 26,
  chapters: [
    { id: 'intro', start: 0, dur: 4, beats: [['t', 0, 4, 'intro.t']] },
    {
      id: 'zombie', start: 4, dur: 22, beats: [
        ['_title', 0, 3.4, 'zombie._title'], ['ask', 3.4, 3.6, 'zombie.ask'], ['yes', 7, 3, 'zombie.yes'],
        ['toe', 10, 5, 'zombie.toe'], ['claim', 15, 7, 'zombie.claim']
      ]
    }
  ]
};

export const BEATS = timedBeats(INFO, SCRIPT);
export const CHAPTERS = chaptersOf(INFO, SCRIPT);
