import { prettifyError } from 'zod';
import { HttpClient } from '../http.js';
import { ValidationError } from '../errors.js';
import { bundledSchemaProvider } from '../schema/bundled-provider.js';
import type { SchemaProvider } from '../schema/types.js';
import type { ScrapeRequest, BatchRequest } from '../generated/targets.js';
import type {
  SyncResponse,
  AsyncTaskResponse,
  BatchResponse,
  TaskMetadata,
  TaskResultsResponse,
} from '../types/responses.js';

export class WebScrapingApi {
  private readonly http: HttpClient;
  private readonly schemas: SchemaProvider;

  constructor(http: HttpClient, schemas: SchemaProvider = bundledSchemaProvider) {
    this.http = http;
    this.schemas = schemas;
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
    return this.http.post<SyncResponse>('/v2/scrape', params);
  }

  async scrapeAsync(params: ScrapeRequest): Promise<AsyncTaskResponse> {
    this.validate(params);
    return this.http.post<AsyncTaskResponse>('/v3/task', params);
  }

  async scrapeBatch(params: BatchRequest): Promise<BatchResponse> {
    return this.http.post<BatchResponse>('/v3/task/batch', params);
  }

  async getStatus(taskId: string): Promise<TaskMetadata> {
    return this.http.get<TaskMetadata>(`/v3/task/${taskId}`);
  }

  async getResults(taskId: string): Promise<TaskResultsResponse | null> {
    const res = await this.http.get<TaskResultsResponse | undefined>(
      `/v3/task/${taskId}/results`,
    );
    return res ?? null;
  }
}
