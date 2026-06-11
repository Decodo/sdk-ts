import { HttpClient } from './http.js';
import { WebScrapingApi } from './api/web-scraping-api.js';
import { BundledSchema } from './schema/bundled-schema.js';
import type { DecodoSchema } from './schema/types.js';

const WEB_API_BASE_URL = 'https://scraper-api.decodo.com';
const DEFAULT_TIMEOUT_MS = 180_000;

export type DecodoConfig = {
  webScrapingApi?: {
    token: string;
    integrationHeader?: string;
  };
  timeoutMs?: number;
  schema?: DecodoSchema;
};

const notConfigured = (namespace: string, hint: string): never => {
  throw new Error(`${namespace} is not configured. ${hint}`);
};

export class DecodoClient {
  readonly webScrapingApi: WebScrapingApi;

  constructor(config: DecodoConfig) {
    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const schema = config.schema ?? BundledSchema.shared;

    if (config.webScrapingApi) {
      this.webScrapingApi = new WebScrapingApi(
        new HttpClient({
          baseUrl: WEB_API_BASE_URL,
          auth: {
            type: 'basic',
            token: config.webScrapingApi.token,
          },
          timeoutMs,
          integrationHeader: config.webScrapingApi.integrationHeader,
        }),
        schema,
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
