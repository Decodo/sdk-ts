import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { DecodoClient } from '../client.js';
import { ResultError } from '../errors.js';
import { RemoteSchema } from '../schema/remote-schema.js';
import { jsonResponse, mockFetch } from '../schema/test-helpers.js';
import type { IrSurfaceTool } from '../schema/types.js';
import { buildToolInputSchema, buildToolRequest, runTool } from './tools.js';

const FIXTURE_URL = pathToFileURL(
  fileURLToPath(new URL('../schema/__fixtures__/flows-ir.json', import.meta.url)),
).href;

let schema: RemoteSchema;

beforeAll(async () => {
  schema = await RemoteSchema.load({ url: FIXTURE_URL });
});

const tool = (surface: string, name: string): IrSurfaceTool => {
  const found = schema.getSurface(surface)?.tools.find((candidate) => candidate.name === name);
  if (!found) {
    throw new Error(`fixture has no ${surface} tool ${name}`);
  }
  return found;
};

const flows = () =>
  new DecodoClient({ webScrapingApi: { apiKey: 'key' }, schema }).webScrapingApi.flows;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('buildToolInputSchema', () => {
  it("applies the surface's descriptions, defaults and caps to the operation's fields", () => {
    const input = buildToolInputSchema(schema, tool('mcp', 'map'));

    expect(Object.keys(input.properties ?? {})).toEqual(tool('mcp', 'map').fields);
    expect(input.properties?.limit).toMatchObject({ type: 'integer', default: 10, minimum: 1, maximum: 500 });
    expect(input.properties?.url?.description).toBe('Website URL to map');
    expect(input.required).toEqual(['url']);
    expect(input.additionalProperties).toBe(false);
  });

  it("narrows a target's field to the surface's choices and never shows fixed fields", () => {
    const input = buildToolInputSchema(schema, tool('mcp', 'bing_search'));

    expect(input.properties?.device_type?.enum).toEqual(['desktop', 'mobile']);
    expect(input.properties?.headless?.enum).toEqual(['html']);
    expect(input.properties).not.toHaveProperty('target');
    expect(input.properties).not.toHaveProperty('parse');
    expect(input.required).toEqual(['query']);
  });

  it('takes only the job id for a step after start', () => {
    expect(buildToolInputSchema(schema, tool('mcp', 'crawl_status'))).toEqual({
      type: 'object',
      properties: { crawl_id: { type: 'string', description: 'Crawl id returned by crawl_start' } },
      required: ['crawl_id'],
      additionalProperties: false,
    });
  });
});

describe('buildToolRequest', () => {
  it('keeps shown fields, fills defaults and lets fixed values win', () => {
    expect(
      buildToolRequest(tool('mcp', 'crawl_start'), { url: 'https://example.com', output: 'html', extra: 1 }),
    ).toEqual({ url: 'https://example.com', limit: 10, output: 'markdown' });
  });
});

describe('runTool', () => {
  it('runs a call tool and reads its result', async () => {
    const fetchMock = mockFetch(() => jsonResponse({ results: [{ status_code: 200, content: '<p>hi</p>' }] }));

    await expect(runTool(flows(), tool('mcp', 'scrape_as_markdown'), { url: 'https://example.com' })).resolves.toBe(
      '<p>hi</p>',
    );
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      url: 'https://example.com',
      target: 'universal',
    });
  });

  it("raises the result rule's failures", async () => {
    mockFetch(() => jsonResponse({ results: [{ status_code: 613, content: '' }] }));

    await expect(runTool(flows(), tool('mcp', 'google_search'), { query: 'coffee' })).rejects.toBeInstanceOf(
      ResultError,
    );
  });

  it('runs each step of a job tool', async () => {
    const fetchMock = mockFetch((input) => {
      const url = String(input);
      if (url.endsWith('/status')) {return jsonResponse({ status: 'done' });}
      if (url.endsWith('/cancel')) {return jsonResponse({ status: 'cancelled' });}
      if (url.includes('type=content')) {return jsonResponse({ url: [{ url: 'a' }] });}
      return jsonResponse({ crawl_id: 'c1', status: 'pending' });
    });

    await expect(runTool(flows(), tool('mcp', 'crawl_start'), { url: 'https://example.com' })).resolves.toMatchObject({
      crawl_id: 'c1',
    });
    await expect(runTool(flows(), tool('mcp', 'crawl_status'), { crawl_id: 'c1' })).resolves.toEqual({ status: 'done' });
    await expect(runTool(flows(), tool('mcp', 'crawl_results'), { crawl_id: 'c1' })).resolves.toEqual([{ url: 'a' }]);
    await expect(runTool(flows(), tool('mcp', 'crawl_cancel'), { crawl_id: 'c1' })).resolves.toEqual({
      status: 'cancelled',
    });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('returns the status of a job still running when a waiting results tool runs out of time', async () => {
    vi.useFakeTimers();
    mockFetch(() => jsonResponse({ status: 'pending' }));

    const running = runTool(flows(), tool('google-adk-python', 'decodo_crawl_results'), { crawl_id: 'c1' });
    await vi.runAllTimersAsync();

    await expect(running).resolves.toEqual({ status: 'pending' });
    vi.useRealTimers();
  });

  it('needs the job id', async () => {
    await expect(runTool(flows(), tool('mcp', 'crawl_status'), {})).rejects.toThrow('needs crawl_id');
  });
});
