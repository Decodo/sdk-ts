import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_IR_BASE,
  DEFAULT_IR_LIST_URL,
  DEFAULT_IR_PREFIX,
} from './constants.js';
import { RemoteSchema } from './remote-schema.js';
import type { CachedIr, RemoteIr } from './types.js';
import {
  jsonResponse,
  mockFetch,
  withTempCacheDir,
  writeCachedIr,
} from './test-helpers.js';
import minimalIrJson from './__fixtures__/minimal-ir.json';

const minimalIr = minimalIrJson as RemoteIr;
const IR_URL = 'https://example.test/decodo-ir-v1.0.0.json';

const cloneIr = (version: string): RemoteIr => ({
  ...minimalIr,
  version,
});

describe('RemoteSchema.load', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('cold load fetches IR, writes cache, and exposes introspection', async () => {
    const fetchMock = mockFetch((input) => {
      expect(String(input)).toBe(IR_URL);
      return jsonResponse(minimalIr);
    });

    await withTempCacheDir(async (cachePath) => {
      const schema = await RemoteSchema.load({ url: IR_URL, cachePath });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(schema.version).toBe('1.0.0');
      expect(schema.listTargets()).toEqual(['google_search']);
      expect(schema.getTargetMeta('google_search')?.parameters).toContain('query');
      expect(schema.getSharedParameters()).toHaveProperty('GEOLOCATION_NAME');

      const cached = JSON.parse(readFileSync(cachePath, 'utf-8')) as CachedIr;
      expect(cached.resolvedUrl).toBe(IR_URL);
      expect(cached.ir.version).toBe('1.0.0');
    });
  });

  it('uses cache when TTL is fresh', async () => {
    const fetchMock = mockFetch(() => jsonResponse(minimalIr));

    await withTempCacheDir(async (cachePath) => {
      writeCachedIr(cachePath, {
        fetchedAt: Date.now(),
        resolvedUrl: IR_URL,
        ir: minimalIr,
      });

      const schema = await RemoteSchema.load({
        url: IR_URL,
        cachePath,
        ttlMs: 60_000,
      });

      expect(fetchMock).not.toHaveBeenCalled();
      expect(schema.version).toBe('1.0.0');
    });
  });

  it('uses stale cache when resolved version is unchanged', async () => {
    const latestUrl = `${DEFAULT_IR_BASE}/${DEFAULT_IR_PREFIX}2.1.0.json`;
    const fetchMock = mockFetch((input) => {
      if (String(input) === DEFAULT_IR_LIST_URL) {
        return jsonResponse({
          items: [{ name: `${DEFAULT_IR_PREFIX}2.1.0.json` }],
        });
      }

      throw new Error(`Unexpected fetch: ${String(input)}`);
    });

    await withTempCacheDir(async (cachePath) => {
      writeCachedIr(cachePath, {
        fetchedAt: Date.now() - 60_000,
        resolvedUrl: latestUrl,
        ir: cloneIr('2.1.0'),
      });

      const schema = await RemoteSchema.load({
        cachePath,
        ttlMs: 1_000,
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(schema.version).toBe('2.1.0');
    });
  });

  it('refetches when stale cache version differs from latest', async () => {
    const latestUrl = `${DEFAULT_IR_BASE}/${DEFAULT_IR_PREFIX}2.1.0.json`;
    const fetchMock = mockFetch((input) => {
      if (String(input) === DEFAULT_IR_LIST_URL) {
        return jsonResponse({
          items: [{ name: `${DEFAULT_IR_PREFIX}2.1.0.json` }],
        });
      }

      if (String(input) === latestUrl) {
        return jsonResponse(cloneIr('2.1.0'));
      }

      throw new Error(`Unexpected fetch: ${String(input)}`);
    });

    await withTempCacheDir(async (cachePath) => {
      writeCachedIr(cachePath, {
        fetchedAt: Date.now() - 60_000,
        resolvedUrl: latestUrl,
        ir: cloneIr('1.0.0'),
      });

      const schema = await RemoteSchema.load({
        cachePath,
        ttlMs: 1_000,
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(schema.version).toBe('2.1.0');
    });
  });

  it('refetches when cache URL does not match requested URL', async () => {
    const otherUrl = 'https://example.test/decodo-ir-v9.9.9.json';
    const fetchMock = mockFetch((input) => {
      expect(String(input)).toBe(otherUrl);
      return jsonResponse(cloneIr('9.9.9'));
    });

    await withTempCacheDir(async (cachePath) => {
      writeCachedIr(cachePath, {
        fetchedAt: Date.now(),
        resolvedUrl: IR_URL,
        ir: minimalIr,
      });

      const schema = await RemoteSchema.load({
        url: otherUrl,
        cachePath,
        ttlMs: 60_000,
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(schema.version).toBe('9.9.9');
    });
  });
});
