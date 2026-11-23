import { describe, expect, it } from 'vitest';
import { ResultError } from '../errors.js';
import { readResult } from './results.js';

const failed = (response: unknown, rule: Parameters<typeof readResult>[0]) => {
  try {
    readResult(rule, response);
  } catch (err) {
    return err as ResultError;
  }
  throw new Error('expected a ResultError');
};

describe('readResult', () => {
  it('returns the response when there is no rule', () => {
    expect(readResult(undefined, { a: 1 })).toEqual({ a: 1 });
  });

  it('raises a declared failure with its message and code', () => {
    const error = failed(
      { status: 'failed', message: 'Target unreachable', status_code: 613 },
      { failures: [{ path: 'status', equals: 'failed', message: 'message', code: 'status_code', retryable: true }] },
    );

    expect(error).toBeInstanceOf(ResultError);
    expect(error).toMatchObject({ message: 'Target unreachable', code: '613', retryable: true });
  });

  it('raises an atLeast failure and marks rate limits and server errors retryable', () => {
    const rule = { failures: [{ path: 'results.0.status_code', atLeast: 400 }] };

    expect(failed({ results: [{ status_code: 404 }] }, rule)).toMatchObject({ code: '404', retryable: false });
    expect(failed({ results: [{ status_code: 503 }] }, rule)).toMatchObject({ code: '503', retryable: true });
    expect(failed({ results: [{ status_code: 429 }] }, rule)).toMatchObject({ retryable: true });
    expect(readResult(rule, { results: [{ status_code: 200, content: 'ok' }] })).toBeDefined();
  });

  it('reads from a path and picks fields, with wildcards over lists', () => {
    const response = { results: [{ url: 'u', content: { links: [{ url: 'a' }, { url: 'b' }] } }] };

    expect(
      readResult({ from: 'results.0', fields: { url: 'url', links: 'content.links.*.url', missing: 'nope' } }, response),
    ).toEqual({ url: 'u', links: ['a', 'b'] });
  });

  it('applies the rule to each item of a list result', () => {
    expect(readResult({ omit: ['html'] }, [{ url: 'a', html: 'x' }, { url: 'b' }])).toEqual([{ url: 'a' }, { url: 'b' }]);
  });

  it('raises when a required field is empty or the result is missing', () => {
    expect(failed({ results: [{ content: '' }] }, { from: 'results.0', fields: { content: 'content' }, required: ['content'] })).toMatchObject({
      code: 'empty_content',
    });
    expect(failed({ results: [] }, { from: 'results.0' })).toMatchObject({ code: 'empty_response' });
  });
});
