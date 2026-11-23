import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { DecodoClient } from '../client.js';
import { AuthenticationError, JobTimeoutError, ValidationError } from '../errors.js';
import { RemoteSchema } from '../schema/remote-schema.js';
import { jsonResponse, mockFetch } from '../schema/test-helpers.js';
import type { DecodoSchema } from '../schema/types.js';

const FIXTURE_URL = pathToFileURL(
  fileURLToPath(new URL('../schema/__fixtures__/flows-ir.json', import.meta.url)),
).href;

let schema: RemoteSchema;

beforeAll(async () => {
  schema = await RemoteSchema.load({ url: FIXTURE_URL });
});

const flowsWith = (config: { apiKey?: string; token?: string } = { apiKey: 'key' }, withSchema: DecodoSchema = schema) =>
  new DecodoClient({
    webScrapingApi: { ...(config as { apiKey: string }), integrationHeader: 'test-suite' },
    schema: withSchema,
  }).webScrapingApi.flows;

type Call = { url: string; method: string; body: unknown; headers: Record<string, string> };

const recordFetch = (respond: (call: Call) => Response) => {
  const calls: Call[] = [];
  mockFetch((input, init) => {
    const call = {
      url: String(input),
      method: init?.method ?? 'GET',
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
      headers: (init?.headers ?? {}) as Record<string, string>,
    };
    calls.push(call);
    return respond(call);
  });
  return calls;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Flows', () => {
  it('sends a call flow to the operation the IR names, with the integration header', async () => {
    const calls = recordFetch(() => jsonResponse({ organic: [] }));

    await expect(flowsWith().call('search', { query: 'coffee' })).resolves.toEqual({ organic: [] });

    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      url: 'https://data.decodo.com/v1/search',
      method: 'POST',
      body: { query: 'coffee' },
      headers: { Authorization: 'Bearer key', 'x-integration': 'test-suite' },
    });
  });

  it("validates a call against the operation's request schema before sending", async () => {
    const calls = recordFetch(() => jsonResponse({}));

    await expect(flowsWith().call('search', { query: 'coffee', page: 0 })).rejects.toBeInstanceOf(ValidationError);
    expect(calls).toHaveLength(0);
  });

  it("validates a scrape against its target's schema", async () => {
    const calls = recordFetch(() => jsonResponse({ results: [] }));

    await flowsWith().call('scrape', { target: 'universal', url: 'https://example.com' });
    await expect(
      flowsWith().call('scrape', { target: 'universal', headless: 'pdf' }),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://data.decodo.com/v1/scrape');
  });

  it('starts a job, reads its status and tells pending from failed', async () => {
    const calls = recordFetch((call) =>
      call.method === 'POST'
        ? jsonResponse({ crawl_id: 'c 1', status: 'pending' })
        : jsonResponse({ status: 'faulted' }),
    );
    const flows = flowsWith();

    const started = await flows.start('crawl', { url: 'https://example.com', limit: 5 });
    const status = await flows.status('crawl', 'c 1');

    expect(started.crawl_id).toBe('c 1');
    expect(calls[1].url).toBe('https://data.decodo.com/v1/crawl/c%201/status');
    expect(flows.isPending('crawl', started)).toBe(true);
    expect(flows.hasFailed('crawl', status)).toBe(true);
  });

  it('waits until a job is no longer pending', async () => {
    const statuses = ['pending', 'pending', 'done'];
    recordFetch(() => jsonResponse({ status: statuses.shift() }));

    await expect(flowsWith().wait('crawl', 'c1', { pollInterval: 1 })).resolves.toEqual({ status: 'done' });
    expect(statuses).toEqual([]);
  });

  it('gives up waiting after the timeout', async () => {
    recordFetch(() => jsonResponse({ status: 'pending' }));

    await expect(flowsWith().wait('crawl', 'c1', { pollInterval: 1, timeout: 5 })).rejects.toBeInstanceOf(
      JobTimeoutError,
    );
  });

  it('reads job results with the results query, following next links on the API host', async () => {
    const calls = recordFetch((call) =>
      call.url.includes('cursor=2')
        ? jsonResponse({ url: [{ url: 'b' }] })
        : jsonResponse({ url: [{ url: 'a' }], next: 'https://elsewhere.test/v1/crawl/c1?type=content&cursor=2' }),
    );

    await expect(flowsWith().results('crawl', 'c1')).resolves.toEqual([{ url: 'a' }, { url: 'b' }]);
    expect(calls.map((call) => call.url)).toEqual([
      'https://data.decodo.com/v1/crawl/c1?type=content',
      'https://data.decodo.com/v1/crawl/c1?type=content&cursor=2',
    ]);
  });

  it('stops paging once it has maxItems', async () => {
    const calls = recordFetch(() => jsonResponse({ url: [{ url: 'a' }, { url: 'b' }], next: 'https://data.decodo.com/v1/crawl/c1?cursor=2' }));

    await expect(flowsWith().results('crawl', 'c1', { maxItems: 1 })).resolves.toEqual([{ url: 'a' }]);
    expect(calls).toHaveLength(1);
  });

  it('cancels a job and refuses to cancel a flow that cannot be cancelled', async () => {
    const calls = recordFetch(() => jsonResponse({ status: 'cancelled' }));

    await flowsWith().cancel('crawl', 'c1');
    await expect(flowsWith().cancel('task', 't1')).rejects.toThrow('cannot be cancelled');

    expect(calls[0]).toMatchObject({ url: 'https://data.decodo.com/v1/crawl/c1/cancel', method: 'POST' });
  });

  it('accepts a key when the probe scrape fails for any reason but auth or rate limit', async () => {
    const calls = recordFetch(() => jsonResponse({ message: 'could not resolve host' }, 400));

    await expect(flowsWith().checkKey()).resolves.toBeUndefined();
    expect(calls[0].body).toEqual({ target: 'universal', url: 'https://does-not-exist.decodo.com' });
  });

  it('rejects a key the API refuses', async () => {
    recordFetch(() => jsonResponse({ message: 'Unauthorized' }, 401));

    await expect(flowsWith().checkKey()).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('refuses a flow of another pattern and an unknown flow', () => {
    expect(() => flowsWith().describe('crawl', 'call')).toThrow('is a job flow, not a call flow');
    expect(() => flowsWith().describe('nope')).toThrow('Unknown flow "nope"');
  });

  it('needs an API key', () => {
    expect(() => flowsWith({ token: 'dXNlcjpwYXNz' }).describe('search')).toThrow('Flows require an API key');
  });

  it('needs a schema with flows', () => {
    const older: DecodoSchema = {
      getRequestSchema: () => undefined,
      listTargets: () => [],
      getTargetMeta: () => undefined,
      getTargetParameterSchema: () => undefined,
      getSharedParameters: () => ({}),
    };

    expect(() => flowsWith({ apiKey: 'key' }, older).describe('search')).toThrow('IR 2.6.0 or newer');
  });
});
