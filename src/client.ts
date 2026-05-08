import { HttpClient } from './http.js';
import { WebScrapingApi } from './api/web-scraping-api.js';

const WEB_API_BASE_URL = 'https://scraper-api.decodo.com';
const DEFAULT_TIMEOUT_MS = 180_000;

export type DecodoConfig = {
  webScrapingApi?: {
    token: string;
  };
  timeoutMs?: number;
};

const notConfigured = (namespace: string, hint: string): never => {
  throw new Error(`${namespace} is not configured. ${hint}`);
};

export class DecodoClient {
  readonly webScrapingApi: WebScrapingApi;

  constructor(config: DecodoConfig) {
    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    if (config.webScrapingApi) {
      this.webScrapingApi = new WebScrapingApi(
        new HttpClient({
          baseUrl: WEB_API_BASE_URL,
          auth: {
            type: 'basic',
            token: config.webScrapingApi.token,
          },
          timeoutMs,
        }),
      );
    } else {
      this.webScrapingApi = new Proxy({} as WebScrapingApi, {
        get() {
          notConfigured(
            'webScrapingApi',
            'Provide webScrapingApi.token in DecodoConfig.',
          );
        },
      });
    }
  }
}
