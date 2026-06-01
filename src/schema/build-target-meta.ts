import type { TargetMeta } from '../generated/targets.js';
import type { IrTarget } from './types.js';

const getTargetParameterKeys = (parameterSchema: IrTarget['parameter_schema']): string[] => {
  const properties = parameterSchema.properties ?? {};
  return Object.keys(properties).filter((key) => key !== 'target');
};

export const buildTargetMeta = (
  targets: Record<string, IrTarget>,
): Map<string, TargetMeta> => {
  const meta = new Map<string, TargetMeta>();

  for (const [targetKey, target] of Object.entries(targets)) {
    meta.set(targetKey, {
      group: target.group,
      response_format: target.response_format,
      parameters: getTargetParameterKeys(target.parameter_schema),
    });
  }

  return meta;
};
