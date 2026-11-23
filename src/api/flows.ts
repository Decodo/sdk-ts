import * as z from 'zod';
import { prettifyError } from 'zod';
import type { JSONSchema4 } from 'json-schema';
import {
  AuthenticationError,
  DecodoError,
  JobTimeoutError,
  RateLimitError,
  ValidationError,
} from '../errors.js';
import type { HttpClient } from '../http.js';
import type {
  DecodoSchema,
  FlowSchema,
  IrBatchFlow,
  IrCallFlow,
  IrFlow,
  IrJobFlow,
  IrOperation,
} from '../schema/types.js';

const DEFAULT_POLL_INTERVAL_MS = 5_000;

type FlowOfPattern = {
  call: IrCallFlow;
  job: IrJobFlow;
  batch: IrBatchFlow;
};

export type WaitOptions = {
  pollInterval?: number;
  timeout?: number;
};

export type JobResultsOptions = {
  maxItems?: number;
};

type JobStatus = Record<string, unknown>;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const localPath = (path: unknown): string => {
  if (
    typeof path !== 'string' ||
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.includes('\\')
  ) {
    throw new Error(
      'The schema gave a request path that is not a path on the API host.',
    );
  }
  return path;
};

const isFlowSchema = (schema: DecodoSchema): schema is FlowSchema =>
  typeof (schema as Partial<FlowSchema>).getFlow === 'function' &&
  typeof (schema as Partial<FlowSchema>).getOperation === 'function';

export class Flows {
  private readonly http: HttpClient;
  private readonly schema: DecodoSchema;
  private readonly available: boolean;
  private readonly validators = new Map<string, z.ZodType | null>();

  constructor(
    http: HttpClient,
    schema: DecodoSchema,
    { available }: { available: boolean },
  ) {
    this.http = http;
    this.schema = schema;
    this.available = available;
  }

  get flowSchema(): FlowSchema {
    if (!this.available) {
      throw new Error(
        'Flows require an API key. Configure webScrapingApi with apiKey instead of token.',
      );
    }
    if (!isFlowSchema(this.schema)) {
      throw new Error(
        'The schema in use has no flows; they need Decodo IR 2.6.0 or newer.',
      );
    }
    return this.schema;
  }

  describe(flow: string): IrFlow;
  describe<P extends IrFlow['pattern']>(
    flow: string,
    pattern: P,
  ): FlowOfPattern[P];
  describe(flow: string, pattern?: IrFlow['pattern']): IrFlow {
    const found = this.flowSchema.getFlow(flow);
    if (!found) {
      throw new Error(`Unknown flow "${flow}".`);
    }
    if (pattern !== undefined && found.pattern !== pattern) {
      throw new Error(
        `Flow "${flow}" is a ${found.pattern} flow, not a ${pattern} flow.`,
      );
    }
    return found;
  }

  async checkKey(): Promise<void> {
    const check = this.flowSchema.getKeyCheck();
    if (!check) {
      throw new Error(
        'The schema in use has no key check; it needs Decodo IR 2.6.0 or newer.',
      );
    }
    try {
      await this.call(check.flow, check.params);
    } catch (err) {
      if (err instanceof AuthenticationError || err instanceof RateLimitError) {
        throw err;
      }
      if (err instanceof DecodoError) {
        return;
      }
      throw err;
    }
  }

  call(flow: string, params: Record<string, unknown>): Promise<unknown> {
    return this.send(this.describe(flow, 'call').run, { body: params });
  }

  async start(
    flow: string,
    params: Record<string, unknown>,
  ): Promise<JobStatus> {
    return (await this.send(this.describe(flow, 'job').start, {
      body: params,
    })) as JobStatus;
  }

  async startBatch(
    flow: string,
    params: Record<string, unknown>,
  ): Promise<JobStatus[]> {
    const described = this.describe(flow, 'batch');
    const response = (await this.send(described.start, { body: params })) as
      JobStatus | undefined;
    const items = response?.[described.itemsField];
    return Array.isArray(items) ? (items as JobStatus[]) : [];
  }

  async status(flow: string, jobId: string): Promise<JobStatus> {
    return (await this.send(this.describe(flow, 'job').status, {
      jobId,
    })) as JobStatus;
  }

  isPending(flow: string, status: JobStatus): boolean {
    const described = this.describe(flow, 'job');
    return described.pendingStatuses.includes(
      status[described.statusField] as string,
    );
  }

  hasFailed(flow: string, status: JobStatus): boolean {
    const described = this.describe(flow, 'job');
    return described.failedStatuses.includes(
      status[described.statusField] as string,
    );
  }

  async wait(
    flow: string,
    jobId: string,
    { pollInterval, timeout }: WaitOptions = {},
  ): Promise<JobStatus> {
    const interval = pollInterval ?? this.pollInterval(flow);
    if (!(interval > 0)) {
      throw new Error(
        'pollInterval must be a positive number of milliseconds.',
      );
    }
    const deadline = timeout === undefined ? undefined : Date.now() + timeout;

    for (;;) {
      const status = await this.status(flow, jobId);
      if (!this.isPending(flow, status)) {
        return status;
      }
      if (deadline === undefined) {
        await sleep(interval);
        continue;
      }
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        throw new JobTimeoutError(flow, jobId, timeout ?? 0);
      }
      await sleep(Math.min(interval, remaining));
    }
  }

  async results(
    flow: string,
    jobId: string,
    { maxItems }: JobResultsOptions = {},
  ): Promise<unknown> {
    const described = this.describe(flow, 'job');
    let body = (await this.send(described.results, {
      jobId,
      query: described.resultsQuery,
    })) as JobStatus | undefined;
    const { pagination } = described;
    if (!pagination) {
      return body;
    }

    const itemsOf = (page: JobStatus | undefined): unknown[] => {
      const items = page?.[pagination.itemsField];
      return Array.isArray(items) ? items : [];
    };
    const items = itemsOf(body);

    while (maxItems === undefined || items.length < maxItems) {
      const next = body?.[pagination.nextUrlField];
      if (typeof next !== 'string' || !next) {
        break;
      }
      const url = new URL(next);
      body = await this.http.get<JobStatus>(
        `${localPath(url.pathname)}${url.search}`,
      );
      items.push(...itemsOf(body));
    }

    return maxItems === undefined ? items : items.slice(0, maxItems);
  }

  async cancel(flow: string, jobId: string): Promise<JobStatus> {
    const endpoint = this.describe(flow, 'job').cancel;
    if (!endpoint) {
      throw new Error(`Flow "${flow}" cannot be cancelled.`);
    }
    return (await this.send(endpoint, { jobId })) as JobStatus;
  }

  private pollInterval(flow: string): number {
    const seconds = this.describe(flow, 'job').pollSeconds;
    return typeof seconds === 'number' && seconds > 0
      ? seconds * 1000
      : DEFAULT_POLL_INTERVAL_MS;
  }

  private operation(name: string): IrOperation {
    const found = this.flowSchema.getOperation(name);
    if (!found) {
      throw new Error(`The schema has no operation "${name}".`);
    }
    return found;
  }

  private async send(
    operationName: string,
    {
      body,
      jobId,
      query,
    }: {
      body?: Record<string, unknown>;
      jobId?: string;
      query?: Record<string, string>;
    },
  ): Promise<unknown> {
    const operation = this.operation(operationName);
    let path = localPath(operation.path);

    if (jobId !== undefined) {
      const placeholder = /\{[^}]+\}/;
      if (!jobId || !placeholder.test(path)) {
        throw new Error(
          `Operation "${operationName}" needs a job id and a path with a place for it.`,
        );
      }
      path = path.replace(placeholder, encodeURIComponent(jobId));
    }

    if (query && Object.keys(query).length > 0) {
      path = `${path}?${new URLSearchParams(query).toString()}`;
    }

    if (body !== undefined) {
      this.validate(operationName, operation, body);
    }

    return this.http.request<unknown>(operation.method, path, body);
  }

  private validate(
    name: string,
    operation: IrOperation,
    body: Record<string, unknown>,
  ): void {
    const validator = this.validatorFor(name, operation, body);
    if (!validator) {
      return;
    }
    const parsed = validator.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(prettifyError(parsed.error));
    }
  }

  private validatorFor(
    name: string,
    operation: IrOperation,
    body: Record<string, unknown>,
  ): z.ZodType | undefined {
    const ownSchema = operation.requestSchema;
    if (!ownSchema?.properties && typeof body.target === 'string') {
      return this.schema.getRequestSchema(body.target);
    }
    if (!ownSchema) {
      return undefined;
    }
    if (!this.validators.has(name)) {
      this.validators.set(name, toZod(ownSchema));
    }
    return this.validators.get(name) ?? undefined;
  }
}

const toZod = (schema: JSONSchema4): z.ZodType | null => {
  try {
    return z.fromJSONSchema(schema as z.core.JSONSchema.JSONSchema);
  } catch {
    return null;
  }
};
