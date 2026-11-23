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

export type IrOperation = {
  method: string;
  path: string;
  requestSchema?: JSONSchema4;
};

export type IrCallFlow = {
  pattern: 'call';
  run: string;
};

export type IrJobFlow = {
  pattern: 'job';
  start: string;
  status: string;
  results: string;
  cancel?: string;
  idField: string;
  statusField: string;
  pendingStatuses: string[];
  failedStatuses: string[];
  resultsQuery?: Record<string, string>;
  pagination?: { itemsField: string; nextUrlField: string };
  pollSeconds?: number;
};

export type IrBatchFlow = {
  pattern: 'batch';
  start: string;
  itemsField: string;
  job: string;
};

export type IrFlow = IrCallFlow | IrJobFlow | IrBatchFlow;

export type IrKeyCheck = {
  flow: string;
  params: Record<string, unknown>;
};

export type IrResultFailure = {
  path: string;
  equals?: string | number | boolean;
  atLeast?: number;
  message?: string;
  code?: string;
  retryable?: true;
};

export type IrResult = {
  failures?: IrResultFailure[];
  from?: string;
  fields?: Record<string, string>;
  omit?: string[];
  required?: string[];
};

export type IrSurfaceLimits = {
  maxResultChars?: number;
  maxTextChars?: number;
  maxItems?: number;
  maxListValues?: number;
  waitSeconds?: number;
};

export type IrSurfaceTool = {
  name: string;
  title?: string;
  description: string;
  group?: string;
  flow: string;
  step?: 'start' | 'status' | 'results' | 'cancel';
  result?: IrResult;
  limits?: IrSurfaceLimits;
  target?: string;
  fields?: string[];
  required?: string[];
  fixed?: Record<string, unknown>;
  defaults?: Record<string, unknown>;
  choices?: Record<string, Array<string | number | boolean>>;
  maximums?: Record<string, number>;
  minimums?: Record<string, number>;
  descriptions?: Record<string, string>;
};

export type IrSurface = {
  tools: IrSurfaceTool[];
};

export type IrFlowSections = {
  operations: Record<string, IrOperation>;
  flows: Record<string, IrFlow>;
  surfaces: Record<string, IrSurface>;
  keyCheck?: IrKeyCheck;
};

export type RemoteIr = {
  version: string;
  apis: {
    webScrapingApi: {
      parameters: Record<string, unknown>;
      targets: Record<string, IrTarget>;
    };
  };
} & Partial<IrFlowSections>;

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

export type FlowSchema = DecodoSchema & {
  getOperation: (operation: string) => IrOperation | undefined;
  getFlow: (flow: string) => IrFlow | undefined;
  getSurface: (client: string) => IrSurface | undefined;
  getKeyCheck: () => IrKeyCheck | undefined;
};
