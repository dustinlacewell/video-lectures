/* This video's speakers, and the engine's script shapes narrowed to them. Voices live in script/cast.ts. */

import type { Cast as AnyCast, ChapterScript as AnyChapter } from '@studio/engine/script';

/** Who speaks a line. */
export type SpeakerId = 'narrator' | 'you' | 'zombie' | 'friend' | 'aibot';

export type Cast = AnyCast<SpeakerId>;

export type ChapterScript = AnyChapter<SpeakerId>;
