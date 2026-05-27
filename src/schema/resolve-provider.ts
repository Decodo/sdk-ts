import { bundledSchemaProvider } from './bundled-provider.js';
import { createRemoteSchemaProvider } from './remote-provider.js';
import type { SchemaProvider, ValidationConfig } from './types.js';

const REMOTE_VALIDATION_ERROR =
  'Remote validation requires async initialization. Use DecodoClient.create() instead of new DecodoClient().';

export const resolveSchemaProvider = (
  validation?: ValidationConfig,
): SchemaProvider => {
  if (validation?.source === undefined || validation.source === 'bundled') {
    return bundledSchemaProvider;
  }

  throw new Error(REMOTE_VALIDATION_ERROR);
};

export const createSchemaProvider = async (
  validation?: ValidationConfig,
): Promise<SchemaProvider> => {
  if (validation?.source === undefined || validation.source === 'bundled') {
    return bundledSchemaProvider;
  }

  if (validation.source === 'remote') {
    return createRemoteSchemaProvider({
      url: validation.url,
      cachePath: validation.cachePath,
      ttlMs: validation.ttlMs,
    });
  }

  return bundledSchemaProvider;
};
