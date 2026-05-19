import {
  DecodoError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  TimeoutError,
} from './errors.js';
import type { ErrorResponse } from './types/responses.js';

export type BasicAuth = {
  type: 'basic';
  token: string;
};

export type ApiKeyAuth = {
  type: 'apiKey';
  apiKey: string;
};

export type HttpClientConfig = {
  baseUrl: string;
  auth: BasicAuth | ApiKeyAuth;
  timeoutMs: number;
};

export class HttpClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly timeoutMs: number;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.timeoutMs = config.timeoutMs;

    if (config.auth.type === 'basic') {
      this.authHeader = `Basic ${config.auth.token}`;
    } else {
      this.authHeader = config.auth.apiKey;
    }
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const init: RequestInit = {
        method,
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-integration': 'sdk-ts',
        },
        signal: controller.signal,
      };

      if (body !== undefined) {
        init.body = JSON.stringify(body);
      }

      const res = await fetch(url, init);

      if (res.ok) {
        if (res.status === 204) {
          return undefined as T;
        }
        return (await res.json()) as T;
      }

      let errorBody: ErrorResponse | undefined;
      try {
        errorBody = (await res.json()) as ErrorResponse;
      } catch {
        // response body wasn't JSON
      }

      const message = errorBody?.message ?? `HTTP ${res.status}`;

      if (res.status === 401 || res.status === 403) {
        throw new AuthenticationError(message);
      }
      if (res.status === 429) {
        throw new RateLimitError(message);
      }
      if (res.status === 422 || (res.status === 400 && errorBody?.errors)) {
        throw new ValidationError(message, errorBody?.errors);
      }
      throw new DecodoError(message, res.status, errorBody?.status);
    } catch (err) {
      if (err instanceof DecodoError) {
        throw err;
      }
      if (
        err instanceof TypeError &&
        (err as TypeError & { cause?: { code?: string } }).cause?.code ===
          'ABORT_ERR'
      ) {
        throw new TimeoutError(
          `Request to ${path} timed out after ${this.timeoutMs}ms`,
        );
      }
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new TimeoutError(
          `Request to ${path} timed out after ${this.timeoutMs}ms`,
        );
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  get<T>(path: string, query?: Record<string, string>): Promise<T> {
    if (query) {
      const params = new URLSearchParams(query);
      const qs = params.toString();
      if (qs) {
        return this.request<T>('GET', `${path}?${qs}`);
      }
    }
    return this.request<T>('GET', path);
  }
}
