import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from './http.js';
import { jsonResponse, mockFetch } from './schema/test-helpers.js';

const baseConfig = {
  baseUrl: 'https://api.test',
  auth: { type: 'basic' as const, token: 'test-token' },
  timeoutMs: 5000,
};

describe('HttpClient integration header', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sends x-integration: sdk-ts by default', async () => {
    let capturedHeaders: Record<string, string> | undefined;

    mockFetch((_input, init) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return jsonResponse({ ok: true });
    });

    const client = new HttpClient(baseConfig);
    await client.get('/v3/task/1');

    expect(capturedHeaders?.['x-integration']).toBe('sdk-ts');
  });

  it('sends a custom x-integration header when configured', async () => {
    let capturedHeaders: Record<string, string> | undefined;

    mockFetch((_input, init) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return jsonResponse({ ok: true });
    });

    const client = new HttpClient({
      ...baseConfig,
      integrationHeader: 'cli',
    });
    await client.get('/v3/task/1');

    expect(capturedHeaders?.['x-integration']).toBe('cli');
  });
});

describe('HttpClient auth header', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sends Basic auth for a token', async () => {
    let capturedHeaders: Record<string, string> | undefined;

    mockFetch((_input, init) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return jsonResponse({ ok: true });
    });

    const client = new HttpClient(baseConfig);
    await client.get('/v3/task/1');

    expect(capturedHeaders?.Authorization).toBe('Basic test-token');
  });

  it('sends Bearer auth for an apiKey', async () => {
    let capturedHeaders: Record<string, string> | undefined;

    mockFetch((_input, init) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return jsonResponse({ ok: true });
    });

    const client = new HttpClient({
      ...baseConfig,
      auth: { type: 'apiKey', apiKey: 'test-key' },
    });
    await client.get('/v1/task/1');

    expect(capturedHeaders?.Authorization).toBe('Bearer test-key');
  });
});
