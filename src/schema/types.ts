import type { JSONSchema4 } from 'json-schema';
import type { z } from 'zod';
import type { TargetMeta } from '../generated/targets.js';

export type RemoteSchemaLoadOptions = {
  url?: string;
  cachePath?: string;
  ttlMs?: number;
};

export type IrTarget = {
  group: string;
  response_format: string;
  parameter_schema: JSONSchema4;
};

export type RemoteIr = {
  version: string;
  apis: {
    webScrapingApi: {
      parameters: Record<string, unknown>;
      targets: Record<string, IrTarget>;
    };
  };
};

export type CachedIr = {
  fetchedAt: number;
  resolvedUrl: string;
  ir: RemoteIr;
};

export type GcsObjectList = {
  items?: Array<{ name: string }>;
};

export type LatestIrLocation = {
  version: string;
  url: string;
};

export type DecodoSchema = {
  getRequestSchema: (target: string) => z.ZodType | undefined;
  listTargets: () => string[];
  getTargetMeta: (target: string) => TargetMeta | undefined;
  getTargetParameterSchema: (target: string) => JSONSchema4 | undefined;
  getSharedParameters: () => Record<string, unknown>;
  readonly version?: string;
};
