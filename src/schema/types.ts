import type { z } from 'zod';

export type ValidationConfig =
  | { source?: 'bundled' }
  | { source: 'remote'; url?: string; cachePath?: string; ttlMs?: number };

export type SchemaProvider = {
  getRequestSchema: (target: string) => z.ZodType | undefined;
};
