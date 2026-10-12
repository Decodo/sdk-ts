import { prettifyError } from 'zod';
import { HttpClient } from '../http.js';
import { TimeoutError, ValidationError } from '../errors.js';
import { BundledSchema } from '../schema/bundled-schema.js';
import type { DecodoSchema } from '../schema/types.js';
import { dataApiEndpoints } from '../generated/data-api.js';
import type {
  CancelCrawlResponse,
  DataApiEndpoint,
  GetCrawlStatusResponse,
  ListCrawlPagesResponse,
  MapSiteRequest,
  MapSiteResponse,
  RunSearchRequest,
  RunSearchResponse,
  StartCrawlRequest,
  StartCrawlResponse,
} from '../generated/data-api.js';
import type { ScrapeRequest, BatchRequest } from '../generated/targets.js';
import type {
  CrawlOptions,
  CrawlPagesOptions,
  CrawlResultsOptions,
} from '../types/requests.js';
import type {
  CrawlPage,
  CrawlPageList,
  CrawlResult,
  SyncResponse,
  AsyncTaskResponse,
  BatchResponse,
  TaskMetadata,
  TaskResultsResponse,
} from '../types/responses.js';

export type WebScrapingApiRoutes = {
  scrape: string;
  task: string;
  dataApi?: typeof dataApiEndpoints;
};

export const SCRAPER_API_ROUTES: WebScrapingApiRoutes = {
  scrape: '/v2/scrape',
  task: '/v3/task',
};

export const DATA_API_ROUTES: WebScrapingApiRoutes = {
  scrape: '/v1/scrape',
  task: '/v1/task',
  dataApi: dataApiEndpoints,
};

const DEFAULT_CRAWL_POLL_INTERVAL_MS = 5_000;
const DEFAULT_CRAWL_TIMEOUT_MS = 3_600_000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class WebScrapingApi {
  private readonly http: HttpClient;
  private readonly schemas: DecodoSchema;
  private readonly routes: WebScrapingApiRoutes;

  constructor(
    http: HttpClient,
    schemas: DecodoSchema = BundledSchema.shared,
    routes: WebScrapingApiRoutes = SCRAPER_API_ROUTES,
  ) {
    this.http = http;
    this.schemas = schemas;
    this.routes = routes;
  }

  private validate(params: ScrapeRequest): void {
    const schema = this.schemas.getRequestSchema(params.target);
    if (!schema) {
      return;
    }
    const parsed = schema.safeParse(params);
    if (!parsed.success) {
      throw new ValidationError(prettifyError(parsed.error));
    }
  }

  async scrape(params: ScrapeRequest): Promise<SyncResponse> {
    this.validate(params);
    return this.http.post<SyncResponse>(this.routes.scrape, params);
  }

  async scrapeAsync(params: ScrapeRequest): Promise<AsyncTaskResponse> {
    this.validate(params);
    return this.http.post<AsyncTaskResponse>(this.routes.task, params);
  }

  async scrapeBatch(params: BatchRequest): Promise<BatchResponse> {
    return this.http.post<BatchResponse>(`${this.routes.task}/batch`, params);
  }

  async getStatus(taskId: string): Promise<TaskMetadata> {
    return this.http.get<TaskMetadata>(`${this.routes.task}/${taskId}`);
  }

  async getResults(taskId: string): Promise<TaskResultsResponse | null> {
    const res = await this.http.get<TaskResultsResponse | undefined>(
      `${this.routes.task}/${taskId}/results`,
    );
    return res ?? null;
  }

  private dataApiPath(endpoint: DataApiEndpoint, caller: string): string {
    if (!this.routes.dataApi) {
      throw new Error(
        `${caller}() requires webScrapingApi.apiKey. A Basic token cannot call the Data API.`,
      );
    }
    return this.routes.dataApi[endpoint].path;
  }

  private crawlPath(
    endpoint: DataApiEndpoint,
    crawlId: string,
    caller: string,
  ): string {
    return this.dataApiPath(endpoint, caller).replace(
      '{id}',
      encodeURIComponent(crawlId),
    );
  }

  async search(params: RunSearchRequest): Promise<RunSearchResponse> {
    return this.http.post<RunSearchResponse>(
      this.dataApiPath('runSearch', 'search'),
      params,
    );
  }

  async map(params: MapSiteRequest): Promise<MapSiteResponse> {
    return this.http.post<MapSiteResponse>(
      this.dataApiPath('mapSite', 'map'),
      params,
    );
  }

  async startCrawl(params: StartCrawlRequest): Promise<StartCrawlResponse> {
    return this.http.post<StartCrawlResponse>(
      this.dataApiPath('startCrawl', 'startCrawl'),
      params,
    );
  }

  async getCrawlStatus(crawlId: string): Promise<GetCrawlStatusResponse> {
    return this.http.get<GetCrawlStatusResponse>(
      this.crawlPath('getCrawlStatus', crawlId, 'getCrawlStatus'),
    );
  }

  async listCrawlPages(
    crawlId: string,
    { cursor, content = true }: CrawlPagesOptions = {},
  ): Promise<CrawlPageList> {
    const query: Record<string, string> = {};
    if (content) {
      query.type = 'content';
    }
    if (cursor) {
      query.cursor = cursor;
    }

    const res = await this.http.get<ListCrawlPagesResponse>(
      this.crawlPath('listCrawlPages', crawlId, 'listCrawlPages'),
      query,
    );

    return {
      pages: res.url,
      next: res.next
        ? (new URL(res.next).searchParams.get('cursor') ?? undefined)
        : undefined,
      total: res.total,
    };
  }

  async getCrawlResults(
    crawlId: string,
    { content = true }: CrawlResultsOptions = {},
  ): Promise<CrawlPage[]> {
    const pages: CrawlPage[] = [];
    let cursor: string | undefined;

    do {
      const page = await this.listCrawlPages(crawlId, { cursor, content });
      pages.push(...page.pages);
      cursor = page.next;
    } while (cursor);

    return pages;
  }

  async cancelCrawl(crawlId: string): Promise<CancelCrawlResponse> {
    return this.http.post<CancelCrawlResponse>(
      this.crawlPath('cancelCrawl', crawlId, 'cancelCrawl'),
      undefined,
    );
  }

  async crawl(
    params: StartCrawlRequest,
    {
      pollInterval = DEFAULT_CRAWL_POLL_INTERVAL_MS,
      timeout = DEFAULT_CRAWL_TIMEOUT_MS,
    }: CrawlOptions = {},
  ): Promise<CrawlResult> {
    const { crawl_id: crawlId } = await this.startCrawl(params);
    const deadline = Date.now() + timeout;
    let status = await this.getCrawlStatus(crawlId);

    while (status.status === 'pending') {
      if (Date.now() + pollInterval > deadline) {
        throw new TimeoutError(
          `Crawl ${crawlId} did not settle within ${timeout}ms. It is still running; call cancelCrawl('${crawlId}') to stop it.`,
        );
      }
      await sleep(pollInterval);
      status = await this.getCrawlStatus(crawlId);
    }

    return { status, pages: await this.getCrawlResults(crawlId) };
  }
}
