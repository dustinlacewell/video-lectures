import { describe, expect, it } from 'vitest';
import { timelineOf } from '../src/sync/timelineOf';
import type { Timeline } from '../src/timeline';
import { CAST, SCRIPT } from './fixtures';

/** Clip lengths for every voiced fixture beat, so the voiced path is pinned too. */
const LENGTHS = {
  'physics.atoms': 2.1, 'physics.laws': 3.3, 'physics.spirit': 1.9, 'physics.fall': 2.7,
  'physics.stop': 1.2, 'physics.card': 1.4, 'form.lever1': 1.0, 'form.lever2': 1.3
};

/** The timeline as the pre-sync builder wrote it: every field but the new, empty `acts`. */
function pinned(tl: Timeline): string {
  tl.chapters.forEach(ch => expect(ch.acts).toEqual({}));
  return JSON.stringify(tl, (k, v) => k === 'acts' ? undefined : v, 1);
}

describe('timeline golden: no actions build the pre-sync timeline byte for byte', () => {
  it('with no voice', async () => {
    await expect(pinned(timelineOf({ script: SCRIPT, cast: CAST }))).toMatchFileSnapshot('./__golden__/timeline.estimated.json');
  });

  it('with voice', async () => {
    const tl = timelineOf({ script: SCRIPT, cast: CAST }, { lengths: LENGTHS, words: {} });
    await expect(pinned(tl)).toMatchFileSnapshot('./__golden__/timeline.voiced.json');
  });
});
