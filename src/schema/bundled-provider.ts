import { requestSchemas } from '../generated/request-schemas.js';
import { Target } from '../generated/targets.js';
import type { SchemaProvider } from './types.js';

export const bundledSchemaProvider: SchemaProvider = {
  getRequestSchema(target: string) {
    return requestSchemas[target as Target];
  },
};
