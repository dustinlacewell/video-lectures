import { describe, expect, it } from 'vitest';
import { mouthOpen } from '../src/characters/bean';

describe('mouth', () => {
  it('starts closed and stays within 0..1', () => {
    expect(mouthOpen(0)).toBe(0);
    for (let t = 0; t < 5; t += 0.01) { const o = mouthOpen(t); expect(o).toBeGreaterThanOrEqual(0); expect(o).toBeLessThanOrEqual(1); }
  });
});
