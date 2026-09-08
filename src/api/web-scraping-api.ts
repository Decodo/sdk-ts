import { prettifyError } from 'zod';
import { HttpClient } from '../http.js';
import { ValidationError } from '../errors.js';
import { BundledSchema } from '../schema/bundled-schema.js';
import type { DecodoSchema } from '../schema/types.js';
import type { ScrapeRequest, BatchRequest } from '../generated/targets.js';
import type {
  SyncResponse,
  AsyncTaskResponse,
  BatchResponse,
  TaskMetadata,
  TaskResultsResponse,
} from '../types/responses.js';

export type WebScrapingApiRoutes = {
  scrape: string;
  task: string;
};

export const SCRAPER_API_ROUTES: WebScrapingApiRoutes = {
  scrape: '/v2/scrape',
  task: '/v3/task',
};

export const DATA_API_ROUTES: WebScrapingApiRoutes = {
  scrape: '/v1/scrape',
  task: '/v1/task',
};

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
}
