import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import * as z from 'zod';
import { DEFAULT_IR_CACHE_PATH } from './constants.js';
import { expandPath } from './expand-path.js';
import { resolveLatestIr } from './resolve-latest-ir.js';
import type { SchemaProvider } from './types.js';

type RemoteSchemaProviderConfig = {
  url?: string;
  cachePath?: string;
  ttlMs?: number;
};

type RemoteIr = {
  version: string;
  apis: {
    webScrapingApi: {
      targets: Record<string, { parameter_schema: unknown }>;
    };
  };
};

type CachedIr = {
  fetchedAt: number;
  resolvedUrl: string;
  ir: RemoteIr;
};

const readCachedIr = (cachePath: string): CachedIr | null => {
  try {
    const raw = readFileSync(cachePath, 'utf-8');
    return JSON.parse(raw) as CachedIr;
  } catch {
    return null;
  }
};

const isCacheFresh = (cached: CachedIr, ttlMs?: number): boolean => {
  if (ttlMs === undefined) {
    return true;
  }
  return Date.now() - cached.fetchedAt < ttlMs;
};

const fetchIr = async (url: string): Promise<RemoteIr> => {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch IR from ${url}: HTTP ${res.status}`);
  }

  return (await res.json()) as RemoteIr;
};

const writeCachedIr = (cachePath: string, cached: CachedIr): void => {
  mkdirSync(dirname(cachePath), { recursive: true });
  writeFileSync(cachePath, JSON.stringify(cached, null, 2));
};

const resolveIrUrl = async (
  config: RemoteSchemaProviderConfig,
): Promise<{ url: string; version?: string }> => {
  if (config.url) {
    return { url: config.url };
  }

  const latest = await resolveLatestIr();
  return { url: latest.url, version: latest.version };
};

const loadIr = async (config: RemoteSchemaProviderConfig): Promise<RemoteIr> => {
  const cachePath = expandPath(config.cachePath ?? DEFAULT_IR_CACHE_PATH);
  const cached = readCachedIr(cachePath);

  if (cached && isCacheFresh(cached, config.ttlMs)) {
    return cached.ir;
  }

  const resolved = await resolveIrUrl(config);

  if (cached) {
    if (config.url) {
      if (cached.resolvedUrl === config.url) {
        return cached.ir;
      }
    } else if (resolved.version && cached.ir.version === resolved.version) {
      return cached.ir;
    }
  }

  const ir = await fetchIr(resolved.url);
  writeCachedIr(cachePath, {
    fetchedAt: Date.now(),
    resolvedUrl: resolved.url,
    ir,
  });
  return ir;
};

const buildRequestSchemas = (
  ir: RemoteIr,
): Map<string, z.ZodType> => {
  const schemas = new Map<string, z.ZodType>();
  const targets = ir.apis.webScrapingApi.targets;

  for (const [targetKey, target] of Object.entries(targets)) {
    schemas.set(
      targetKey,
      z.fromJSONSchema(
        target.parameter_schema as z.core.JSONSchema.JSONSchema,
      ),
    );
  }

  return schemas;
};

export const createRemoteSchemaProvider = async (
  config: RemoteSchemaProviderConfig = {},
): Promise<SchemaProvider> => {
  const ir = await loadIr(config);
  const schemas = buildRequestSchemas(ir);

  return {
    getRequestSchema(target: string) {
      return schemas.get(target);
    },
  };
};
