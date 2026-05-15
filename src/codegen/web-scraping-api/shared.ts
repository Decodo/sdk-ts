import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { JSONSchema4 } from 'json-schema';
import { IR } from '../types';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const localIrPath = resolve(__dirname, '../../../inputs/decodo.ir.json');

export const outDir = resolve(__dirname, '../../generated');

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

export const getTargetEnumSchema = (targetKeys: string[]): JSONSchema4 =>
  ({
    title: 'Target',
    description: 'Scrape target discriminator (wire string values).',
    type: 'string',
    enum: targetKeys,
    tsEnumNames: targetKeys.map(toEnumMemberName),
  }) as JSONSchema4;

export const stripTargetProperty = (schema: JSONSchema4): JSONSchema4 => {
  const properties = { ...(schema.properties ?? {}) };
  delete properties.target;
  const required = Array.isArray(schema.required)
    ? schema.required.filter((r: string) => r !== 'target')
    : undefined;
  const result: JSONSchema4 = { ...schema, properties };
  if (required && required.length > 0) {
    result.required = required;
  } else {
    delete result.required;
  }
  return result;
};

export const fetchIntermediateRepresentation = async (): Promise<IR> => {
  if (!existsSync(localIrPath)) {
    throw new Error(
      `IR file not found: ${localIrPath}. Add inputs/decodo.ir.json or update localIrPath.`,
    );
  }
  return JSON.parse(readFileSync(localIrPath, 'utf-8')) as IR;
};
