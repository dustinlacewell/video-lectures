/* The engine contract as data shapes: what the tools read from a page and from a script. No I/O. */

/** One beat row from __info(): [key in chapter, start in chapter (s), duration (s), global id]. */
export type InfoBeat = [key: string, start: number, dur: number, id: string];

export interface InfoChapter { id: string; start: number; dur: number; beats: InfoBeat[] }

/** What window.__info() returns. Extra fields (cues) are ignored. */
export interface Info { total: number; chapters: InfoChapter[] }

/** A beat of the script as pure data. Only the fields the tools read. */
export interface ScriptBeat {
  id: string;
  say?: string;
  card?: string;
  speaker?: string | string[];
  stagger?: number;
  dur?: number;
}

export interface ScriptChapter { id: string; title?: string; short?: string; beats: ScriptBeat[] }

/** Measured clip lengths in seconds, by clip id (durations.json). */
export type ClipLengths = Record<string, number>;
