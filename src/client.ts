import { HttpClient } from './http.js';
import type { BasicAuth, ApiKeyAuth } from './http.js';
import {
  WebScrapingApi,
  SCRAPER_API_ROUTES,
  DATA_API_ROUTES,
} from './api/web-scraping-api.js';
import type { WebScrapingApiRoutes } from './api/web-scraping-api.js';
import { BundledSchema } from './schema/bundled-schema.js';
import type { DecodoSchema } from './schema/types.js';

const WEB_API_BASE_URL = 'https://scraper-api.decodo.com';
const DATA_API_BASE_URL = 'https://data.decodo.com';
const DEFAULT_TIMEOUT_MS = 180_000;

type WebScrapingApiCredentials =
  { token: string; apiKey?: never } | { apiKey: string; token?: never };

export type WebScrapingApiConfig = WebScrapingApiCredentials & {
  integrationHeader?: string;
};

export type DecodoConfig = {
  webScrapingApi?: WebScrapingApiConfig;
  timeoutMs?: number;
  schema?: DecodoSchema;
};

const notConfigured = (namespace: string, hint: string): never => {
  throw new Error(`${namespace} is not configured. ${hint}`);
};

type Transport = {
  baseUrl: string;
  auth: BasicAuth | ApiKeyAuth;
  routes: WebScrapingApiRoutes;
};

const resolveTransport = (config: WebScrapingApiConfig): Transport => {
  const { token, apiKey } = config;

  if (token !== undefined && apiKey !== undefined) {
    throw new Error(
      'webScrapingApi accepts either token or apiKey, not both. Provide only one.',
    );
  }

  if (apiKey !== undefined) {
    return {
      baseUrl: DATA_API_BASE_URL,
      auth: { type: 'apiKey', apiKey },
      routes: DATA_API_ROUTES,
    };
  }

  if (token !== undefined) {
    return {
      baseUrl: WEB_API_BASE_URL,
      auth: { type: 'basic', token },
      routes: SCRAPER_API_ROUTES,
    };
  }

  throw new Error('webScrapingApi requires token in DecodoConfig.');
};

export class DecodoClient {
  readonly webScrapingApi: WebScrapingApi;

  constructor(config: DecodoConfig) {
    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const schema = config.schema ?? BundledSchema.shared;

    if (config.webScrapingApi) {
      const { baseUrl, auth, routes } = resolveTransport(config.webScrapingApi);

      this.webScrapingApi = new WebScrapingApi(
        new HttpClient({
          baseUrl,
          auth,
          timeoutMs,
          integrationHeader: config.webScrapingApi.integrationHeader,
        }),
        schema,
        routes,
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
