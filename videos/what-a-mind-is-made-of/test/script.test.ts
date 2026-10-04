import { describe, expect, it } from 'vitest';
import { SCRIPT } from '../script';

describe('beat ids', () => {
  it('are unique and prefixed by their chapter id', () => {
    const ids = SCRIPT.flatMap(ch => ch.beats.map(b => { expect(b.id.startsWith(ch.id + '.')).toBe(true); return b.id; }));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
