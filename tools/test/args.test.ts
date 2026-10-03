import { afterEach, describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { callerPath, numberList } from '../shared/args.ts';

describe('numberList', () => {
  it('reads commas, and the spaces PowerShell turns them into', () => {
    expect(numberList('0.1,0.5,0.9')).toEqual([0.1, 0.5, 0.9]);
    expect(numberList('5 63.2')).toEqual([5, 63.2]);
    expect(numberList(' 1, ,2,')).toEqual([1, 2]);
    expect(numberList('x')).toEqual([]);
  });
});

describe('callerPath', () => {
  const before = process.env.INIT_CWD;
  afterEach(() => { if (before === undefined) delete process.env.INIT_CWD; else process.env.INIT_CWD = before; });

  it('resolves a relative path against the folder pnpm was run in', () => {
    process.env.INIT_CWD = resolve('/caller');
    expect(callerPath('out/run')).toBe(resolve('/caller', 'out/run'));
    expect(callerPath(resolve('/abs'))).toBe(resolve('/abs'));
    expect(callerPath(undefined)).toBeUndefined();
  });
});
