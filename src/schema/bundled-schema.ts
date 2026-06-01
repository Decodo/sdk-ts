import type { JSONSchema4 } from 'json-schema';
import {
  requestJsonSchemas,
  requestSchemas,
} from '../generated/request-schemas.js';
import { targetMeta, Target, targets } from '../generated/targets.js';
import type { DecodoSchema } from './types.js';

export class BundledSchema implements DecodoSchema {
  static readonly shared = new BundledSchema();

  getRequestSchema(target: string) {
    return requestSchemas[target as Target];
  }

  listTargets(): string[] {
    return [...targets];
  }

  getTargetMeta(target: string) {
    return targetMeta[target as Target];
  }

  getTargetParameterSchema(target: string): JSONSchema4 | undefined {
    return requestJsonSchemas[target as Target] as unknown as JSONSchema4;
  }

  getSharedParameters(): Record<string, unknown> {
    return {};
  }
}
