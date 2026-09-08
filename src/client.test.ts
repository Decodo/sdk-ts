import { afterEach, describe, expect, it, vi } from 'vitest';
import { DecodoClient } from './client.js';
import { Target } from './generated/targets.js';
import { jsonResponse, mockFetch } from './schema/test-helpers.js';

const scrapeParams = {
  target: Target.Universal,
  url: 'https://example.com',
} as const;

describe('DecodoClient transport selection', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('routes a token to scraper-api over v2/v3', async () => {
    const urls: string[] = [];

    mockFetch((input) => {
      urls.push(String(input));
      return jsonResponse({ results: [] });
    });

    const client = new DecodoClient({ webScrapingApi: { token: 'test-token' } });
    await client.webScrapingApi.scrape(scrapeParams);
    await client.webScrapingApi.getStatus('task-1');

    expect(urls).toEqual([
      'https://scraper-api.decodo.com/v2/scrape',
      'https://scraper-api.decodo.com/v3/task/task-1',
    ]);
  });

  it('routes an apiKey to data.decodo.com over v1', async () => {
    const urls: string[] = [];

    mockFetch((input) => {
      urls.push(String(input));
      return jsonResponse({ results: [] });
    });

    const client = new DecodoClient({ webScrapingApi: { apiKey: 'test-key' } });
    await client.webScrapingApi.scrape(scrapeParams);
    await client.webScrapingApi.getStatus('task-1');

    expect(urls).toEqual([
      'https://data.decodo.com/v1/scrape',
      'https://data.decodo.com/v1/task/task-1',
    ]);
  });

  it('throws when both token and apiKey are provided', () => {
    expect(
      () =>
        new DecodoClient({
          // @ts-expect-error the public type already forbids both at once
          webScrapingApi: { token: 'test-token', apiKey: 'test-key' },
        }),
    ).toThrow(/either token or apiKey/);
  });

  it('throws when neither token nor apiKey is provided', () => {
    expect(
      // @ts-expect-error one credential is required
      () => new DecodoClient({ webScrapingApi: {} }),
    ).toThrow(/webScrapingApi requires/);
  });

  it('throws when token is an empty string', () => {
    expect(
      () => new DecodoClient({ webScrapingApi: { token: '' } }),
    ).toThrow(/token must be a non-empty string/);
  });

  it('throws when apiKey is an empty string', () => {
    expect(
      () => new DecodoClient({ webScrapingApi: { apiKey: '' } }),
    ).toThrow(/apiKey must be a non-empty string/);
  });

  it('throws when token is only whitespace', () => {
    expect(
      () => new DecodoClient({ webScrapingApi: { token: '   ' } }),
    ).toThrow(/token must be a non-empty string/);
  });

  it('throws when apiKey is only whitespace', () => {
    expect(
      () => new DecodoClient({ webScrapingApi: { apiKey: '   ' } }),
    ).toThrow(/apiKey must be a non-empty string/);
  });
});
