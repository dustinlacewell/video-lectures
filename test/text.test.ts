import { describe, expect, it } from 'vitest';
import { parseRuns, runsWidth, toMarkup, wrapMarkup, type Measure } from '../engine/richText';

/** Fake metrics: 10 per character, italic 12. */
const measure: Measure = function (s, italic) { return s.length * (italic ? 12 : 10); };

/** The plain word wrap text.ts used before rich text, for comparison. */
function plainWrap(s: string, maxW: number): string[] {
  const words = s.split(' '), lines: string[] = [];
  let cur = '';
  words.forEach(function (w) {
    const t = cur ? cur + ' ' + w : w;
    if (measure(t, false) > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  });
  if (cur) lines.push(cur);
  return lines;
}

describe('parseRuns', function () {
  it('reads *word* as italic', function () {
    expect(parseRuns('Form *is* function.')).toEqual([
      { text: 'Form ', italic: false }, { text: 'is', italic: true }, { text: ' function.', italic: false }
    ]);
  });

  it('keeps plain text as one plain run', function () {
    expect(parseRuns('If it happened, something made it happen.')).toEqual([{ text: 'If it happened, something made it happen.', italic: false }]);
    expect(parseRuns('')).toEqual([]);
  });

  it('allows spaces inside a span and punctuation after it', function () {
    expect(parseRuns('pain: *not felt*.')).toEqual([
      { text: 'pain: ', italic: false }, { text: 'not felt', italic: true }, { text: '.', italic: false }
    ]);
  });

  it('leaves a lone or space-padded asterisk literal', function () {
    expect(parseRuns('2 * 3')).toEqual([{ text: '2 * 3', italic: false }]);
    expect(parseRuns('a * b * c')).toEqual([{ text: 'a * b * c', italic: false }]);
    expect(parseRuns('*open')).toEqual([{ text: '*open', italic: false }]);
  });

  it('round-trips through toMarkup', function () {
    const s = '*You* are not *your* consciousness.';
    expect(toMarkup(parseRuns(s))).toBe(s);
  });
});

describe('runsWidth', function () {
  it('measures each run in its own style', function () {
    expect(runsWidth(parseRuns('ab *cd*'), measure)).toBe(30 + 24);
  });
});

describe('wrapMarkup', function () {
  it('wraps plain text exactly like the plain word wrap', function () {
    const s = 'What a thing is shaped like is what it does.  Form is function.';
    [40, 90, 130, 200, 1000].forEach(function (maxW) { expect(wrapMarkup(s, maxW, measure)).toEqual(plainWrap(s, maxW)); });
  });

  it('measures italic words with the italic width', function () {
    /* "aaaa *bbbb*" is 50 + 48 = 98 wide: fits at 98, breaks at 97. */
    expect(wrapMarkup('aaaa *bbbb*', 98, measure)).toEqual(['aaaa *bbbb*']);
    expect(wrapMarkup('aaaa *bbbb*', 97, measure)).toEqual(['aaaa', '*bbbb*']);
  });

  it('closes a span at every word, so a span may cross a line break', function () {
    expect(wrapMarkup('You are *not your consciousness*.', 120, measure)).toEqual(['You are *not*', '*your*', '*consciousness*.']);
  });

  it('gives lines whose words are valid markup on their own', function () {
    const lines = wrapMarkup('Form *is* function, *and* form *is not* magic.', 160, measure);
    const words = lines.join(' ').split(' ');
    expect(words.map(function (w) { return parseRuns(w).map(function (r) { return r.text; }).join(''); }))
      .toEqual(['Form', 'is', 'function,', 'and', 'form', 'is', 'not', 'magic.']);
    expect(parseRuns(lines.join(' ')).filter(function (r) { return r.italic; }).map(function (r) { return r.text; })).toEqual(['is', 'and', 'is', 'not']);
  });
});
