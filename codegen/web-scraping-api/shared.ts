import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { JSONSchema4 } from 'json-schema';
import { IR } from '../types';
import { IRParameter, IRTarget, WebScrapingApiIR } from './types';

const __dirname = dirname(fileURLToPath(import.meta.url));

// todo: update to permanent IR location
export const IR_URL =
  'https://gist.githubusercontent.com/domantas-jurkus-dcd/43c47a102bcdf97842814d635ba47f05/raw/3b9e4a35f05ada3f8ed4410376f59ad89b4e6535/config.json';

export const outDir = resolve(__dirname, '../../src/generated');

export const compileOpts = {
  bannerComment: '',
  format: true,
  enableConstEnums: false,
  style: {
    singleQuote: true,
    semi: true,
    trailingComma: 'none' as const,
    tabWidth: 2,
  },
};

export const toPascalCase = (s: string): string =>
  s
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .split(/[_\s-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');

export const toEnumMemberName = (targetKey: string): string => {
  const pascal = toPascalCase(targetKey);
  if (/^[0-9]/.test(pascal) || !/^[A-Za-z_$]/.test(pascal)) {
    return `_${pascal}`;
  }
  return pascal;
};

const isValidIdentifier = (key: string): boolean =>
  /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);

export const propKey = (key: string): string =>
  isValidIdentifier(key) ? key : JSON.stringify(key);

export const parameterToJsonSchema = (param: IRParameter): JSONSchema4 => {
  const type = param.type as JSONSchema4['type'];
  const schema: JSONSchema4 = { type };

  if (param.maxLength !== undefined) {
    schema.maxLength = param.maxLength;
  }
  if (param.min !== undefined) {
    schema.minimum = param.min;
  }
  if (param.max !== undefined) {
    schema.maximum = param.max;
  }
  if (param.enum) {
    schema.enum = param.enum;
  }
  if (param.type === 'array' && param.items) {
    schema.items = parameterToJsonSchema(param.items as IRParameter);
  }
  if (param.type === 'object') {
    schema.additionalProperties = { type: 'string' };
  }

  return schema;
};

export const getTargetParamsSchema = (
  api: WebScrapingApiIR,
  target: IRTarget,
): JSONSchema4 => {
  const properties: Record<string, JSONSchema4> = {};
  for (const paramKey of target.parameters) {
    const param = api.parameters[paramKey];
    if (!param) {
      continue;
    }
    properties[paramKey] = parameterToJsonSchema(param);
  }
  return {
    type: 'object',
    properties,
    additionalProperties: false,
  };
};

export const getTargetEnumSchema = (targetKeys: string[]): JSONSchema4 =>
  ({
    title: 'Target',
    description: 'Scrape target discriminator (wire string values).',
    type: 'string',
    enum: targetKeys,
    tsEnumNames: targetKeys.map(toEnumMemberName),
  }) as JSONSchema4;

export const fetchIntermediateRepresentation = async (): Promise<IR> => {
  const res = await fetch(IR_URL);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch IR: ${res.status} ${res.statusText} (${IR_URL})`,
    );
  }
  const ir = (await res.json()) as IR;

  return ir;
};
