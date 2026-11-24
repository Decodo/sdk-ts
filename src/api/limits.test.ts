import { describe, expect, it } from 'vitest';
import { limitResult } from './limits.js';

describe('limitResult', () => {
  it('returns the value as text when there are no limits', () => {
    expect(limitResult(undefined, { a: 1 })).toEqual({ text: '{"a":1}', truncated: false });
    expect(limitResult(undefined, 'plain')).toEqual({ text: 'plain', truncated: false });
  });

  it('cuts long strings, long lists and the item count anywhere in the result', () => {
    const result = limitResult({ maxTextChars: 3, maxListValues: 2, maxItems: 1 }, [
      { title: 'abcdef', tags: ['a', 'b', 'c'] },
      { title: 'second' },
    ]);

    expect(JSON.parse(result.text)).toEqual([{ title: 'abc', tags: ['a', 'b'] }]);
    expect(result.truncated).toBe(true);
  });

  it('cuts the whole text to maxResultChars', () => {
    expect(limitResult({ maxResultChars: 4 }, 'abcdefgh')).toEqual({ text: 'abcd', truncated: true });
  });

  it('reports nothing cut when the result fits', () => {
    expect(limitResult({ maxTextChars: 10, maxResultChars: 100 }, ['short'])).toEqual({
      text: '["short"]',
      truncated: false,
    });
  });
});
