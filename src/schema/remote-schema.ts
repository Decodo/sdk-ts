import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { JSONSchema4 } from 'json-schema';
import * as z from 'zod';
import type { TargetMeta } from '../generated/targets.js';
import { buildTargetMeta } from './build-target-meta.js';
import { DEFAULT_IR_CACHE_PATH } from './constants.js';
import { expandPath } from './expand-path.js';
import { resolveLatestIr } from './resolve-latest-ir.js';
import type { DecodoSchema, CachedIr, RemoteIr, RemoteSchemaLoadOptions } from './types.js';

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
  config: RemoteSchemaLoadOptions,
): Promise<{ url: string; version?: string }> => {
  if (config.url) {
    return { url: config.url };
  }

  const latest = await resolveLatestIr();
  return { url: latest.url, version: latest.version };
};

const loadIr = async (config: RemoteSchemaLoadOptions): Promise<RemoteIr> => {
  const cachePath = expandPath(config.cachePath ?? DEFAULT_IR_CACHE_PATH);
  const cached = readCachedIr(cachePath);
  const resolved = await resolveIrUrl(config);

  if (cached?.resolvedUrl === resolved.url) {
    if (isCacheFresh(cached, config.ttlMs)) {
      return cached.ir;
    }

    if (config.url || cached.ir.version === resolved.version) {
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

const buildRequestSchemas = (ir: RemoteIr): Map<string, z.ZodType> => {
  const schemas = new Map<string, z.ZodType>();

  for (const [targetKey, target] of Object.entries(
    ir.apis.webScrapingApi.targets,
  )) {
    schemas.set(
      targetKey,
      z.fromJSONSchema(
        target.parameter_schema as z.core.JSONSchema.JSONSchema,
      ),
    );
  }

  return schemas;
};

const buildParameterSchemas = (ir: RemoteIr): Map<string, JSONSchema4> => {
  const schemas = new Map<string, JSONSchema4>();

  for (const [targetKey, target] of Object.entries(
    ir.apis.webScrapingApi.targets,
  )) {
    schemas.set(targetKey, target.parameter_schema);
  }

  return schemas;
};

export class RemoteSchema implements DecodoSchema {
  readonly version: string;

  private readonly schemas: Map<string, z.ZodType>;
  private readonly meta: Map<string, TargetMeta>;
  private readonly parameterSchemas: Map<string, JSONSchema4>;
  private readonly sharedParameters: Record<string, unknown>;
  private readonly targetKeys: string[];

  private constructor(ir: RemoteIr, schemas: Map<string, z.ZodType>) {
    this.version = ir.version;
    this.schemas = schemas;
    this.meta = buildTargetMeta(ir.apis.webScrapingApi.targets);
    this.parameterSchemas = buildParameterSchemas(ir);
    this.sharedParameters = ir.apis.webScrapingApi.parameters ?? {};
    this.targetKeys = Object.keys(ir.apis.webScrapingApi.targets);
  }

  static async load(
    config: RemoteSchemaLoadOptions = {},
  ): Promise<RemoteSchema> {
    const ir = await loadIr(config);
    const schemas = buildRequestSchemas(ir);
    return new RemoteSchema(ir, schemas);
  }

  getRequestSchema(target: string) {
    return this.schemas.get(target);
  }

  listTargets(): string[] {
    return this.targetKeys;
  }

  getTargetMeta(target: string) {
    return this.meta.get(target);
  }

  getTargetParameterSchema(target: string): JSONSchema4 | undefined {
    return this.parameterSchemas.get(target);
  }

  getSharedParameters(): Record<string, unknown> {
    return this.sharedParameters;
  }
}
