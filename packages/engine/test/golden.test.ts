import { describe, expect, it } from 'vitest';
import { buildTimeline, voiceDurations } from '../src/timeline';
import { CAST, SCRIPT } from './fixtures';

/** Clip lengths for every voiced fixture beat, so the voiced path is pinned too. */
const LENGTHS = {
  'physics.atoms': 2.1, 'physics.laws': 3.3, 'physics.spirit': 1.9, 'physics.fall': 2.7,
  'physics.stop': 1.2, 'physics.card': 1.4, 'form.lever1': 1.0, 'form.lever2': 1.3
};

describe('timeline golden', () => {
  it('equals the pre-sync timeline with no voice', async () => {
    const tl = buildTimeline(SCRIPT, {}, CAST);
    await expect(JSON.stringify(tl, null, 1)).toMatchFileSnapshot('./__golden__/timeline.estimated.json');
  });

  it('equals the pre-sync timeline with voice', async () => {
    const tl = buildTimeline(SCRIPT, voiceDurations(SCRIPT, LENGTHS, CAST), CAST);
    await expect(JSON.stringify(tl, null, 1)).toMatchFileSnapshot('./__golden__/timeline.voiced.json');
  });
});
