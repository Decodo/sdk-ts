import { afterEach, describe, expect, it, vi } from 'vitest';
import * as z from 'zod';
import {
  WebScrapingApi,
  DATA_API_ROUTES,
  SCRAPER_API_ROUTES,
} from './web-scraping-api.js';
import type { WebScrapingApiRoutes } from './web-scraping-api.js';
import { TimeoutError, ValidationError } from '../errors.js';
import { Target } from '../generated/targets.js';
import { HttpClient } from '../http.js';
import { BundledSchema } from '../schema/bundled-schema.js';
import { jsonResponse, mockFetch } from '../schema/test-helpers.js';
import type { DecodoSchema } from '../schema/types.js';

const createApi = (schemas: DecodoSchema) => {
  const http = {
    post: vi.fn().mockResolvedValue({ results: [] }),
    get: vi.fn(),
  } as unknown as HttpClient;

  return {
    api: new WebScrapingApi(http, schemas),
    http,
  };
};

describe('WebScrapingApi validation', () => {
  it('throws ValidationError before HTTP when schema rejects params', async () => {
    const strictSchema: DecodoSchema = {
      getRequestSchema: () =>
        z.object({
          target: z.literal(Target.GoogleSearch),
          query: z.string().min(1),
        }),
      listTargets: () => [],
      getTargetMeta: () => undefined,
      getTargetParameterSchema: () => undefined,
      getSharedParameters: () => ({}),
    };

    const { api, http } = createApi(strictSchema);

    await expect(
      api.scrape({
        target: Target.GoogleSearch,
        query: '',
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(http.post).not.toHaveBeenCalled();
  });

  it('calls HTTP when params pass schema validation', async () => {
    const strictSchema: DecodoSchema = {
      getRequestSchema: () =>
        z.object({
          target: z.literal(Target.GoogleSearch),
          query: z.string().min(1),
        }),
      listTargets: () => [],
      getTargetMeta: () => undefined,
      getTargetParameterSchema: () => undefined,
      getSharedParameters: () => ({}),
    };

    const { api, http } = createApi(strictSchema);

    await api.scrape({
      target: Target.GoogleSearch,
      query: 'coffee',
    });

    expect(http.post).toHaveBeenCalledTimes(1);
  });

  it('validates bundled google_search payloads', async () => {
    const { api, http } = createApi(BundledSchema.shared);

    await api.scrape({
      target: Target.GoogleSearch,
      query: 'coffee',
    });

    expect(http.post).toHaveBeenCalledTimes(1);
  });
});

const crawlJob = (status: string) => ({
  target: 'crawl',
  url: 'https://example.com',
  created_at: '2026-10-12 10:00:00',
  crawl_id: 'crawl-1',
  status,
  crawl_status: 'https://data.decodo.com/v1/crawl/crawl-1/status',
  results_tasks: 'https://data.decodo.com/v1/crawl/crawl-1',
  results_content: 'https://data.decodo.com/v1/crawl/crawl-1?type=content',
});

const crawlStatus = (status: string) => ({
  ...crawlJob(status),
  sitemap_status: 'include',
  output: 'markdown',
  discovered: 2,
  completed: status === 'pending' ? 0 : 2,
  failed: 0,
  in_flight: 0,
  sitemaps: 1,
  requests: 3,
});

const crawlPage = (url: string) => ({
  status: 'done',
  created_at: '2026-10-12 10:00:00',
  updated_at: '2026-10-12 10:00:01',
  url,
  depth: 1,
  content: `# ${url}`,
  crawl_status: 'https://data.decodo.com/v1/crawl/crawl-1/status',
  results_tasks: 'https://data.decodo.com/v1/crawl/crawl-1',
  results_content: 'https://data.decodo.com/v1/crawl/crawl-1?type=content',
});

type RecordedRequest = { method: string; url: string; body?: unknown };

const createDataApi = (routes: WebScrapingApiRoutes = DATA_API_ROUTES) =>
  new WebScrapingApi(
    new HttpClient({
      baseUrl: 'https://data.decodo.com',
      auth: { type: 'apiKey', apiKey: 'test-key' },
      timeoutMs: 1_000,
    }),
    BundledSchema.shared,
    routes,
  );

const recordRequests = (
  respond: (request: RecordedRequest) => unknown,
): RecordedRequest[] => {
  const requests: RecordedRequest[] = [];

  mockFetch((input, init) => {
    const request: RecordedRequest = {
      method: init?.method ?? 'GET',
      url: String(input),
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    };
    requests.push(request);
    return jsonResponse(respond(request));
  });

  return requests;
};

describe('WebScrapingApi data API', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('posts search and map requests to their v1 routes', async () => {
    const requests = recordRequests(() => ({ results: [] }));
    const api = createDataApi();

    await api.search({ query: 'coffee' });
    await api.map({ url: 'https://example.com', limit: 10 });

    expect(requests).toEqual([
      { method: 'POST', url: 'https://data.decodo.com/v1/search', body: { query: 'coffee' } },
      {
        method: 'POST',
        url: 'https://data.decodo.com/v1/map',
        body: { url: 'https://example.com', limit: 10 },
      },
    ]);
  });

  it('rejects data API calls made with a Basic token before any request', async () => {
    const fetchMock = mockFetch(() => jsonResponse({}));
    const api = createDataApi(SCRAPER_API_ROUTES);

    await expect(api.search({ query: 'coffee' })).rejects.toThrow(
      'search() requires webScrapingApi.apiKey. A Basic token cannot call the Data API.',
    );
    await expect(api.crawl({ url: 'https://example.com' })).rejects.toThrow(
      'startCrawl() requires webScrapingApi.apiKey',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('follows next links until the last page of crawl results', async () => {
    const requests = recordRequests(({ url }) =>
      url.includes('cursor=')
        ? { crawl_id: 'crawl-1', url: [crawlPage('https://example.com/b')] }
        : {
            crawl_id: 'crawl-1',
            url: [crawlPage('https://example.com/a')],
            next: 'https://data.decodo.com/v1/crawl/crawl-1?type=content&cursor=abc',
            total: 2,
          },
    );
    const api = createDataApi();

    const pages = await api.getCrawlResults('crawl-1');

    expect(pages.map((page) => page.url)).toEqual([
      'https://example.com/a',
      'https://example.com/b',
    ]);
    expect(requests.map((request) => request.url)).toEqual([
      'https://data.decodo.com/v1/crawl/crawl-1?type=content',
      'https://data.decodo.com/v1/crawl/crawl-1?type=content&cursor=abc',
    ]);
  });

  it('returns one page of crawl results with the next cursor', async () => {
    const requests = recordRequests(() => ({
      crawl_id: 'crawl-1',
      url: [crawlPage('https://example.com/b')],
      next: 'https://data.decodo.com/v1/crawl/crawl-1?type=content&cursor=def',
    }));
    const api = createDataApi();

    const page = await api.listCrawlPages('crawl-1', { cursor: 'abc' });

    expect(page.pages.map(({ url }) => url)).toEqual(['https://example.com/b']);
    expect(page.next).toBe('def');
    expect(requests.map(({ url }) => url)).toEqual([
      'https://data.decodo.com/v1/crawl/crawl-1?type=content&cursor=abc',
    ]);
  });

  it('omits next and keeps total on the last crawl results page', async () => {
    recordRequests(() => ({
      crawl_id: 'crawl-1',
      url: [crawlPage('https://example.com/a')],
      total: 1,
    }));
    const api = createDataApi();

    const page = await api.listCrawlPages('crawl-1');

    expect(page.next).toBeUndefined();
    expect(page.total).toBe(1);
  });

  it('requests crawl results without content when asked', async () => {
    const requests = recordRequests(() => ({ crawl_id: 'crawl-1', url: [] }));
    const api = createDataApi();

    await api.getCrawlResults('crawl-1', { content: false });

    expect(requests.map((request) => request.url)).toEqual([
      'https://data.decodo.com/v1/crawl/crawl-1',
    ]);
  });

  it('cancels a crawl by id', async () => {
    const requests = recordRequests(() => crawlJob('cancelled'));
    const api = createDataApi();

    const job = await api.cancelCrawl('crawl 1');

    expect(job.status).toBe('cancelled');
    expect(requests).toEqual([
      { method: 'POST', url: 'https://data.decodo.com/v1/crawl/crawl%201/cancel', body: undefined },
    ]);
  });

  it('starts a crawl, polls until it settles and returns every page', async () => {
    let statusChecks = 0;
    const requests = recordRequests(({ method, url }) => {
      if (method === 'POST') {
        return crawlJob('pending');
      }
      if (url.endsWith('/status')) {
        statusChecks += 1;
        return crawlStatus(statusChecks < 2 ? 'pending' : 'done');
      }
      return { crawl_id: 'crawl-1', url: [crawlPage('https://example.com/a')] };
    });
    const api = createDataApi();

    const result = await api.crawl(
      { url: 'https://example.com', limit: 5 },
      { pollInterval: 1 },
    );

    expect(result.status.status).toBe('done');
    expect(result.pages.map((page) => page.url)).toEqual(['https://example.com/a']);
    expect(requests.map(({ method, url }) => `${method} ${url}`)).toEqual([
      'POST https://data.decodo.com/v1/crawl',
      'GET https://data.decodo.com/v1/crawl/crawl-1/status',
      'GET https://data.decodo.com/v1/crawl/crawl-1/status',
      'GET https://data.decodo.com/v1/crawl/crawl-1?type=content',
    ]);
  });

  it('throws TimeoutError when the crawl does not settle in time', async () => {
    recordRequests(({ method }) =>
      method === 'POST' ? crawlJob('pending') : crawlStatus('pending'),
    );
    const api = createDataApi();

    await expect(
      api.crawl({ url: 'https://example.com' }, { pollInterval: 5, timeout: 1 }),
    ).rejects.toBeInstanceOf(TimeoutError);
  });
});
