import { describe, expect, it, vi } from 'vitest';
import * as z from 'zod';
import { WebScrapingApi } from './web-scraping-api.js';
import { ValidationError } from '../errors.js';
import { Target } from '../generated/targets.js';
import type { HttpClient } from '../http.js';
import { BundledSchema } from '../schema/bundled-schema.js';
import type { DecodoSchema } from '../schema/types.js';

const createApi = (schemas: DecodoSchema) => {
  const http = {
    post: vi.fn().mockResolvedValue({ results: [] }),
    get: vi.fn(),
  } as unknown as HttpClient;

  return {
    api: new WebScrapingApi(http, schemas),
    http,
  };
};

describe('WebScrapingApi validation', () => {
  it('throws ValidationError before HTTP when schema rejects params', async () => {
    const strictSchema: DecodoSchema = {
      getRequestSchema: () =>
        z.object({
          target: z.literal(Target.GoogleSearch),
          query: z.string().min(1),
        }),
      listTargets: () => [],
      getTargetMeta: () => undefined,
      getTargetParameterSchema: () => undefined,
      getSharedParameters: () => ({}),
    };

    const { api, http } = createApi(strictSchema);

    await expect(
      api.scrape({
        target: Target.GoogleSearch,
        query: '',
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(http.post).not.toHaveBeenCalled();
  });

  it('calls HTTP when params pass schema validation', async () => {
    const strictSchema: DecodoSchema = {
      getRequestSchema: () =>
        z.object({
          target: z.literal(Target.GoogleSearch),
          query: z.string().min(1),
        }),
      listTargets: () => [],
      getTargetMeta: () => undefined,
      getTargetParameterSchema: () => undefined,
      getSharedParameters: () => ({}),
    };

    const { api, http } = createApi(strictSchema);

    await api.scrape({
      target: Target.GoogleSearch,
      query: 'coffee',
    });

    expect(http.post).toHaveBeenCalledTimes(1);
  });

  it('validates bundled google_search payloads', async () => {
    const { api, http } = createApi(BundledSchema.shared);

    await api.scrape({
      target: Target.GoogleSearch,
      query: 'coffee',
    });

    expect(http.post).toHaveBeenCalledTimes(1);
  });
});
