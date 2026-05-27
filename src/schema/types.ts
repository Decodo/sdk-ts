import type { z } from 'zod';

export type SchemaProvider = {
  getRequestSchema: (target: string) => z.ZodType | undefined;
};
