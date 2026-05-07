import { HttpClient } from './http.js';
import { WebScrapingApi } from './api/web-scraping-api.js';

const WEB_API_BASE_URL = 'https://scraper-api.decodo.com';
const DEFAULT_TIMEOUT_MS = 180_000;

export type DecodoConfig = {
  webScrapingApi?: {
    username: string;
    password: string;
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
            username: config.webScrapingApi.username,
            password: config.webScrapingApi.password,
          },
          timeoutMs,
        }),
      );
    } else {
      this.webScrapingApi = new Proxy({} as WebScrapingApi, {
        get() {
          notConfigured(
            'webScrapingApi',
            'Provide webScrapingApi.username and webScrapingApi.password in DecodoConfig.',
          );
        },
      });
    }
  }
}
