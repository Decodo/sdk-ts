import { HttpClient } from './http.js';
import { WebScrapingApi } from './api/web-scraping-api.js';
import {
  createSchemaProvider,
  resolveSchemaProvider,
} from './schema/resolve-provider.js';
import type { SchemaProvider, ValidationConfig } from './schema/types.js';

const WEB_API_BASE_URL = 'https://scraper-api.decodo.com';
const DEFAULT_TIMEOUT_MS = 180_000;

export type DecodoConfig = {
  webScrapingApi?: {
    token: string;
  };
  timeoutMs?: number;
  validation?: ValidationConfig;
};

export type { ValidationConfig };

const notConfigured = (namespace: string, hint: string): never => {
  throw new Error(`${namespace} is not configured. ${hint}`);
};

export class DecodoClient {
  readonly webScrapingApi: WebScrapingApi;

  constructor(config: DecodoConfig, schemaProvider?: SchemaProvider) {
    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const provider = schemaProvider ?? resolveSchemaProvider(config.validation);

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
        provider,
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

  static async create(config: DecodoConfig): Promise<DecodoClient> {
    const schemaProvider = await createSchemaProvider(config.validation);
    return new DecodoClient(config, schemaProvider);
  }
}
