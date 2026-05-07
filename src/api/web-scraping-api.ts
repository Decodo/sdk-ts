import { HttpClient } from '../http.js';
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

  constructor(http: HttpClient) {
    this.http = http;
  }

  async scrape(params: ScrapeRequest): Promise<SyncResponse> {
    return this.http.post<SyncResponse>('/v2/scrape', params);
  }

  async scrapeAsync(params: ScrapeRequest): Promise<AsyncTaskResponse> {
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
