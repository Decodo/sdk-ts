import type { JSONSchema4 } from 'json-schema';
import {
  requestJsonSchemas,
  requestSchemas,
} from '../generated/request-schemas.js';
import { targetMeta, Target, targets } from '../generated/targets.js';
import { flowSections, flowSectionsVersion } from '../generated/flows.js';
import type {
  FlowSchema,
  IrFlow,
  IrKeyCheck,
  IrOperation,
  IrSurface,
} from './types.js';

export class BundledSchema implements FlowSchema {
  static readonly shared = new BundledSchema();

  readonly version = flowSectionsVersion;

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

  getOperation(operation: string): IrOperation | undefined {
    return flowSections.operations[operation];
  }

  getFlow(flow: string): IrFlow | undefined {
    return flowSections.flows[flow];
  }

  getSurface(client: string): IrSurface | undefined {
    return flowSections.surfaces[client];
  }

  getKeyCheck(): IrKeyCheck | undefined {
    return flowSections.keyCheck;
  }
}
