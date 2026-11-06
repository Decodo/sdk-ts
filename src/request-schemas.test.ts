import { describe, expect, it } from 'vitest';
import { dataApiRequestSchemas, requestSchemas, Target, targets } from './index.js';

describe('exported request schemas', () => {
  it('has a schema for every target', () => {
    expect(Object.keys(requestSchemas).sort()).toEqual([...targets].sort());
  });

  it('validates a target request', () => {
    const schema = requestSchemas[Target.Universal];

    expect(schema.safeParse({ target: 'universal', url: 'https://a.io' }).success).toBe(true);
    expect(schema.safeParse({ target: 'universal', unknown: true }).success).toBe(false);
  });

  it.each([
    ['runSearch', { query: 'decodo' }, {}],
    ['mapSite', { url: 'https://a.io' }, {}],
    ['startCrawl', { url: 'https://a.io' }, {}],
  ] as const)('validates a %s request', (endpoint, valid, invalid) => {
    const schema = dataApiRequestSchemas[endpoint];

    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse(invalid).success).toBe(false);
  });

  it('lets a client narrow a schema to the fields it exposes', () => {
    const narrowed = dataApiRequestSchemas.startCrawl.pick({ url: true }).strict();

    expect(narrowed.safeParse({ url: 'https://a.io' }).success).toBe(true);
    expect(
      narrowed.safeParse({ url: 'https://a.io', callback_url: 'https://b.io' }).success,
    ).toBe(false);
  });
});
