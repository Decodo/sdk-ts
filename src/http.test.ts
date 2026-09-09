import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from './http.js';
import { RateLimitError } from './errors.js';
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

describe('HttpClient rate limit Retry-After', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const rateLimited = (headers: Record<string, string> = {}) =>
    new Response(
      JSON.stringify({ status: 'failed', message: 'Too many requests' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...headers },
      },
    );

  const rateLimitError = async (headers?: Record<string, string>) => {
    mockFetch(() => rateLimited(headers));

    const client = new HttpClient(baseConfig);

    return client.get('/v3/task/1').then(
      () => {
        throw new Error('expected a RateLimitError');
      },
      (error: unknown) => error as RateLimitError,
    );
  };

  it('parses delta-seconds', async () => {
    const error = await rateLimitError({ 'Retry-After': '30' });

    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.retryAfterMs).toBe(30_000);
  });

  it('parses an HTTP date', async () => {
    const inTenSeconds = new Date(Date.now() + 10_000).toUTCString();

    const error = await rateLimitError({ 'Retry-After': inTenSeconds });

    expect(error.retryAfterMs).toBeGreaterThan(8_000);
    expect(error.retryAfterMs).toBeLessThanOrEqual(10_000);
  });

  it('is undefined when the header is absent', async () => {
    const error = await rateLimitError();

    expect(error.retryAfterMs).toBeUndefined();
  });

  it('is undefined when the header is unparseable', async () => {
    const error = await rateLimitError({ 'Retry-After': 'soon' });

    expect(error.retryAfterMs).toBeUndefined();
  });
});
