import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { vi } from 'vitest';
import type { CachedIr } from './types.js';

export type FetchHandler = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Response | Promise<Response>;

export const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const mockFetch = (handler: FetchHandler) => {
  const fetchMock = vi.fn(handler);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

export const withTempCacheDir = async <T>(
  fn: (cachePath: string) => Promise<T>,
): Promise<T> => {
  const dir = mkdtempSync(join(tmpdir(), 'decodo-schema-test-'));
  const cachePath = join(dir, 'decodo.ir.json');

  try {
    return await fn(cachePath);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

export const writeCachedIr = (cachePath: string, cached: CachedIr): void => {
  mkdirSync(dirname(cachePath), { recursive: true });
  writeFileSync(cachePath, JSON.stringify(cached, null, 2));
};
