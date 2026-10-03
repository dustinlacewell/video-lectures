import { describe, expect, it } from 'vitest';
import { awayFrom, determinismMd, nondeterministic } from '../contact-sheet/determinism.ts';
import { balancedChunks, frameTimes, sheetsOf, sheetTimes, timeSheets } from '../contact-sheet/plan.ts';
import { line, transcript } from '../contact-sheet/transcript.ts';
import { sheetHtml } from '../contact-sheet/layout.ts';
import { withFlag } from '../shared/url.ts';
import { BEATS, CHAPTERS } from './fixture.ts';

const F = [0.1, 0.5, 0.9];

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
    const sheets = sheetsOf(CHAPTERS, BEATS, 3, F);
    expect(sheets.map((s) => s.file)).toEqual(['sheets/01-intro-1.png', 'sheets/02-zombie-1.png', 'sheets/02-zombie-2.png']);
    expect(sheets[1].beats).toHaveLength(3);
    expect(sheets[0].times).toEqual([[0.4, 2, 3.6]]);
  });

  it('puts exact times on the beat playing then, and returns the rest', () => {
    const { sheets, outside } = timeSheets(CHAPTERS, BEATS, [26, 11.5, 0, 11, -1, 25.9], 4);
    expect(sheets.map((s) => s.file)).toEqual(['sheets/times-01-intro-1.png', 'sheets/times-02-zombie-1.png']);
    expect(sheets[1].beats.map((b) => b.id)).toEqual(['zombie.yes', 'zombie.claim']);
    expect(sheets[1].times).toEqual([[11, 11.5], [25.9]]);
    expect(outside).toEqual([-1, 26]);
    expect(sheetTimes(sheets)).toEqual([0, 11, 11.5, 25.9]);
  });

  it('leaves out times in chapters not chosen', () => {
    const zombie = BEATS.filter((b) => b.chapter === 'zombie');
    expect(timeSheets(CHAPTERS, zombie, [1, 5], 4).outside).toEqual([1]);
  });
});

describe('determinism', () => {
  it('seeks half the video away, wrapping', () => {
    expect(awayFrom(4, 26)).toBe(17);
    expect(awayFrom(20, 26)).toBe(7);
  });

  it('reports only frames whose draws differ, with beat and pixel count', () => {
    const redraws = [{ t: 1, changed: 0, pixels: 100 }, { t: 11.5, changed: 7, pixels: 100 }];
    expect(nondeterministic(redraws)).toEqual([redraws[1]]);
    const md = determinismMd(redraws, BEATS, 26);
    expect(md).toContain('1 frames differ');
    expect(md).toContain('0:11.5 | 11.500 | zombie.yes | 7 | 7.00%');
    expect(determinismMd([redraws[0]], BEATS, 26)).toContain('Every frame matched to the pixel.');
  });
});

describe('page url', () => {
  it('strips the purpose flag unless asked, and keeps other flags', () => {
    expect(withFlag('http://h/?purpose&boards', 'purpose', false)).toBe('http://h/?boards');
    expect(withFlag('http://h/?purpose=1#x', 'purpose', false)).toBe('http://h/#x');
    expect(withFlag('http://h/', 'purpose', true)).toBe('http://h/?purpose');
    expect(withFlag('http://h/?boards&purpose=0', 'purpose', true)).toBe('http://h/?boards&purpose');
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
    const md = transcript(CHAPTERS, BEATS, sheetsOf(CHAPTERS, BEATS, 4, F), F, 26);
    expect(md).toContain('## 2. zombie - Meet your zombie twin (0:04.0 to 0:26.0)');
    expect(md).toContain('Sheets: sheets/02-zombie-1.png, sheets/02-zombie-2.png');
    expect(md).toContain('frames at 10%, 50%, 90% of the beat');
  });
});

describe('layout', () => {
  it('labels each beat and frame and escapes text', () => {
    const sheet = sheetsOf(CHAPTERS, BEATS, 4, F)[0];
    const html = sheetHtml(sheet, [[{ t: 0.4, src: 'data:x' }]], { thumbWidth: 480, perRow: 3 });
    expect(html).toContain('intro.t <span>0:00.0 to 0:04.0</span>');
    expect(html).toContain('<figcaption>0:00.4</figcaption>');
    expect(html).toContain('repeat(3,480px)');
    expect(html).not.toContain('class="banner"');
  });

  it('marks purpose-band sheets on the image and in the transcript', () => {
    const sheets = sheetsOf(CHAPTERS, BEATS, 4, F);
    expect(sheetHtml(sheets[0], [[]], { thumbWidth: 480, perRow: 3, banner: 'DIRECTOR ONLY' })).toContain('<p class="banner">DIRECTOR ONLY</p>');
    expect(transcript(CHAPTERS, BEATS, sheets, F, 26, 'DIRECTOR ONLY')).toContain('**DIRECTOR ONLY**');
  });
});
