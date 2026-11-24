import type { JSONSchema4 } from 'json-schema';
import { JobTimeoutError, ResultError } from '../errors.js';
import type { FlowSchema, IrFlow, IrSurfaceTool } from '../schema/types.js';
import type { Flows } from './flows.js';
import { readResult } from './results.js';

const isIdStep = (tool: IrSurfaceTool): boolean =>
  tool.step === 'status' || tool.step === 'results' || tool.step === 'cancel';

const CURSOR = 'cursor';

const flowOf = (schema: FlowSchema, tool: IrSurfaceTool): IrFlow => {
  const flow = schema.getFlow(tool.flow);
  if (!flow) {
    throw new Error(
      `Tool "${tool.name}" names flow "${tool.flow}", which the schema lacks.`,
    );
  }
  if (flow.pattern === 'job' && !tool.step) {
    throw new Error(
      `Tool "${tool.name}" runs job flow "${tool.flow}" but names no step.`,
    );
  }
  return flow;
};

const sourceSchema = (
  schema: FlowSchema,
  tool: IrSurfaceTool,
  flow: IrFlow,
): JSONSchema4 => {
  if (tool.target) {
    const found = schema.getTargetParameterSchema(tool.target);
    if (!found) {
      throw new Error(
        `Tool "${tool.name}" names target "${tool.target}", which the schema lacks.`,
      );
    }
    return found;
  }

  const operation = flow.pattern === 'call' ? flow.run : flow.start;
  const found = schema.getOperation(operation)?.requestSchema;
  if (!found) {
    throw new Error(
      `Tool "${tool.name}" has no field list: operation "${operation}" has no request schema.`,
    );
  }
  return found;
};

const shownProperty = (
  tool: IrSurfaceTool,
  name: string,
  api: JSONSchema4 | undefined,
): JSONSchema4 => {
  const property: JSONSchema4 = { ...(api ?? {}) };
  const description = tool.descriptions?.[name];
  const choices = tool.choices?.[name];

  if (description) {
    property.description = description;
  }
  if (choices) {
    property.enum = choices;
  }
  if (tool.defaults && name in tool.defaults) {
    property.default = tool.defaults[name] as JSONSchema4['default'];
  }
  if (tool.minimums?.[name] !== undefined) {
    property.minimum = tool.minimums[name];
  }
  if (tool.maximums?.[name] !== undefined) {
    property.maximum = tool.maximums[name];
  }

  return property;
};

export const buildToolInputSchema = (
  schema: FlowSchema,
  tool: IrSurfaceTool,
): JSONSchema4 => {
  const flow = flowOf(schema, tool);

  if (isIdStep(tool)) {
    if (flow.pattern !== 'job') {
      throw new Error(
        `Tool "${tool.name}" has step "${tool.step}", which only job flows have.`,
      );
    }
    const paged = tool.step === 'results' && flow.pagination;
    return {
      type: 'object',
      properties: {
        [flow.idField]: {
          type: 'string',
          ...(tool.descriptions?.[flow.idField] && {
            description: tool.descriptions[flow.idField],
          }),
        },
        ...(paged && {
          [CURSOR]: {
            type: 'string',
            description:
              'nextCursor from the previous call; leave it out for the first results',
          },
        }),
      },
      required: [flow.idField],
      additionalProperties: false,
    };
  }

  const source = sourceSchema(schema, tool, flow);
  const apiProperties = (source.properties ?? {}) as Record<
    string,
    JSONSchema4
  >;
  const apiRequired = Array.isArray(source.required)
    ? (source.required as string[])
    : [];
  const fields = tool.fields ?? [];
  const properties = Object.fromEntries(
    fields.map((name) => [
      name,
      shownProperty(tool, name, apiProperties[name]),
    ]),
  );
  const required = [
    ...new Set([
      ...(tool.required ?? []),
      ...apiRequired.filter((name) => fields.includes(name)),
    ]),
  ];

  return {
    type: 'object',
    properties,
    ...(required.length > 0 && { required }),
    additionalProperties: false,
  };
};

export const buildToolRequest = (
  tool: IrSurfaceTool,
  args: Record<string, unknown>,
): Record<string, unknown> => {
  const request: Record<string, unknown> = {};

  for (const name of tool.fields ?? []) {
    if (args[name] !== undefined) {
      request[name] = args[name];
    } else if (tool.defaults?.[name] !== undefined) {
      request[name] = tool.defaults[name];
    }
  }

  return { ...request, ...tool.fixed };
};

const jobIdOf = (
  flow: IrFlow,
  tool: IrSurfaceTool,
  args: Record<string, unknown>,
): string => {
  if (flow.pattern !== 'job') {
    throw new Error(
      `Tool "${tool.name}" has step "${tool.step}", which only job flows have.`,
    );
  }
  const id = args[flow.idField];
  if (typeof id !== 'string' || !id) {
    throw new Error(`Tool "${tool.name}" needs ${flow.idField}.`);
  }
  return id;
};

const runResults = async (
  flows: Flows,
  tool: IrSurfaceTool,
  flow: IrFlow,
  args: Record<string, unknown>,
): Promise<unknown> => {
  const jobId = jobIdOf(flow, tool, args);
  const waitSeconds = tool.limits?.waitSeconds;
  let failedStatus: string | undefined;

  if (waitSeconds) {
    let status: Record<string, unknown>;
    try {
      status = await flows.wait(tool.flow, jobId, {
        timeout: waitSeconds * 1000,
      });
    } catch (err) {
      if (err instanceof JobTimeoutError) {
        return flows.status(tool.flow, jobId);
      }
      throw err;
    }
    if (flows.hasFailed(tool.flow, status) && flow.pattern === 'job') {
      failedStatus = String(status[flow.statusField]);
    }
  }

  const failed = (): ResultError =>
    new ResultError(
      `The ${tool.flow} job ${jobId} ended with status "${failedStatus}".`,
      failedStatus ?? 'failed',
    );

  if (flow.pattern !== 'job' || !flow.pagination) {
    if (failedStatus) {
      throw failed();
    }
    return readResult(
      tool.result,
      await flows.results(tool.flow, jobId, { maxItems: tool.limits?.maxItems }),
    );
  }

  const cursor = args[CURSOR];
  const page = await flows.resultsPage(tool.flow, jobId, {
    cursor: typeof cursor === 'string' && cursor ? cursor : undefined,
    maxItems: tool.limits?.maxItems,
  });
  // A cancelled or faulted job keeps the pages it finished; only a job with none is an error.
  if (failedStatus && page.items.length === 0 && !cursor) {
    throw failed();
  }

  return {
    items: readResult(tool.result, page.items),
    ...(page.nextCursor && { nextCursor: page.nextCursor }),
    ...(failedStatus && { status: failedStatus }),
  };
};

export const runTool = async (
  flows: Flows,
  tool: IrSurfaceTool,
  args: Record<string, unknown>,
): Promise<unknown> => {
  const flow = flowOf(flows.flowSchema, tool);

  switch (tool.step) {
    case 'status':
      return flows.status(tool.flow, jobIdOf(flow, tool, args));
    case 'cancel':
      return flows.cancel(tool.flow, jobIdOf(flow, tool, args));
    case 'results':
      return runResults(flows, tool, flow, args);
    case 'start':
      return flows.start(tool.flow, buildToolRequest(tool, args));
    default:
      break;
  }

  const request = buildToolRequest(tool, args);
  if (flow.pattern === 'batch') {
    return flows.startBatch(tool.flow, request);
  }
  return readResult(tool.result, await flows.call(tool.flow, request));
};
