/* The voices. Each speaker clones one fixed reference clip in voice/refs, so every line sounds like the same person. */

import type { Cast, CastMember } from './types';

const you: CastMember = { name: 'You', ref: 'refs/you.wav' };

export const CAST: Cast = {
  narrator: { name: 'Narrator', ref: 'refs/narrator.wav' },
  you: you,
  /** The zombie must sound exactly like you: the argument depends on it. Same voice by reference. */
  zombie: { ...you, name: 'Zombie' },
  friend: { name: 'Friend', ref: 'refs/friend.wav' },
  aibot: { name: 'AI bot', ref: 'refs/aibot.wav' }
};
