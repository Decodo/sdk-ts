import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { expandPath } from './expand-path.js';

describe('expandPath', () => {
  it('expands ~/ paths relative to home', () => {
    expect(expandPath('~/decodo/cache.json')).toBe(
      resolve(homedir(), 'decodo/cache.json'),
    );
  });

  it('expands ~ to home directory', () => {
    expect(expandPath('~')).toBe(homedir());
  });

  it('resolves absolute paths unchanged', () => {
    expect(expandPath('/tmp/decodo.ir.json')).toBe('/tmp/decodo.ir.json');
  });
});
