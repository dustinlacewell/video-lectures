/* The voices. Each speaker's voice is a Breeze TTS text description. */

import type { Cast, CastMember } from './types';

const you: CastMember = {
  name: 'You',
  voice: 'A cheerful cartoon character with a small, bright, bouncy voice, slightly high pitched, like a friendly animated sidekick. Earnest and eager, quick pace.'
};

export const CAST: Cast = {
  narrator: {
    name: 'Narrator',
    voice: 'A woman in her mid thirties with a crisp, posh English accent, received pronunciation. Dry, wry and quietly amused, as if sharing a clever point. Unhurried.'
  },
  you: you,
  /** The zombie must sound exactly like you: the argument depends on it. Same voice by reference. */
  zombie: { name: 'Zombie', voice: you.voice, pad: you.pad },
  friend: {
    name: 'Friend',
    voice: 'A warm, friendly cartoon character with a lower, rounder, chubby voice, gentle and easygoing, like a big-hearted animated buddy. Relaxed, steady pace.'
  },
  aibot: {
    name: 'AI bot',
    voice: 'A friendly cartoon robot with a light, clean, slightly synthetic voice, crisp and even, a little bit electronic but warm and helpful. Precise, steady pace.'
  }
};
