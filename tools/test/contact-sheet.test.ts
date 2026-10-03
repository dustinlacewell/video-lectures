import { describe, expect, it } from 'vitest';
import { balancedChunks, frameTimes, sheetsOf } from '../contact-sheet/plan.ts';
import { line, transcript } from '../contact-sheet/transcript.ts';
import { sheetHtml } from '../contact-sheet/layout.ts';
import { BEATS, CHAPTERS } from './fixture.ts';

describe('plan', () => {
  it('captures inside the beat at the given fractions', () => {
    const ask = BEATS[2];
    const ts = frameTimes(ask, [-1, 0.5, 1]);
    [7.4, 9.2, 10.999].forEach((want, i) => expect(ts[i]).toBeCloseTo(want, 6));
  });

  it('balances sheet sizes', () => {
    expect(balancedChunks([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4).map((c) => c.length)).toEqual([4, 3, 3]);
    expect(balancedChunks([1, 2, 3], 4)).toEqual([[1, 2, 3]]);
    expect(balancedChunks([], 4)).toEqual([]);
  });

  it('names sheets by play order and chapter', () => {
    const sheets = sheetsOf(CHAPTERS, BEATS, 3);
    expect(sheets.map((s) => s.file)).toEqual(['sheets/01-intro-1.png', 'sheets/02-zombie-1.png', 'sheets/02-zombie-2.png']);
    expect(sheets[1].beats).toHaveLength(3);
  });
});

describe('transcript', () => {
  it('writes one line per beat, speaker named, cards marked', () => {
    expect(BEATS.map(line)).toEqual([
      '- [0:00.0] (no words, 4.0 s)',
      '- [0:04.0] TITLE CARD: Meet your zombie twin',
      '- [0:07.4] NARRATOR: So let’s ask. Hey, are you *conscious*?',
      '- [0:11.0] YOU + ZOMBIE (together): Yes. Obviously.',
      '- [0:14.0] YOU: Ouch!',
      '- [0:19.0] CARD (read aloud): Inner experience cannot be responsible.'
    ]);
  });

  it('lists chapters with their sheets', () => {
    const md = transcript(CHAPTERS, BEATS, sheetsOf(CHAPTERS, BEATS, 4), [0.1, 0.5, 0.9], 26);
    expect(md).toContain('## 2. zombie - Meet your zombie twin (0:04.0 to 0:26.0)');
    expect(md).toContain('Sheets: sheets/02-zombie-1.png, sheets/02-zombie-2.png');
    expect(md).toContain('frames at 10%, 50%, 90% of the beat');
  });
});

describe('layout', () => {
  it('labels each beat and frame and escapes text', () => {
    const sheet = sheetsOf(CHAPTERS, BEATS, 4)[0];
    const html = sheetHtml(sheet, [[{ t: 0.4, src: 'data:x' }]], { thumbWidth: 480, perRow: 3 });
    expect(html).toContain('intro.t <span>0:00.0 to 0:04.0</span>');
    expect(html).toContain('<figcaption>0:00.4</figcaption>');
    expect(html).toContain('repeat(3,480px)');
  });
});
