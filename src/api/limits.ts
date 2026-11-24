import type { IrSurfaceLimits } from '../schema/types.js';

export type LimitedResult = {
  text: string;
  truncated: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const capValues = (
  value: unknown,
  limits: IrSurfaceLimits,
  cut: { truncated: boolean },
  topLevel: boolean,
): unknown => {
  if (typeof value === 'string') {
    if (
      limits.maxTextChars !== undefined &&
      value.length > limits.maxTextChars
    ) {
      cut.truncated = true;
      return value.slice(0, limits.maxTextChars);
    }
    return value;
  }

  if (Array.isArray(value)) {
    const cap = topLevel ? limits.maxItems : limits.maxListValues;
    const kept =
      cap !== undefined && value.length > cap ? value.slice(0, cap) : value;
    if (kept.length < value.length) {
      cut.truncated = true;
    }
    return kept.map((item) => capValues(item, limits, cut, false));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([name, item]) => [
        name,
        capValues(item, limits, cut, false),
      ]),
    );
  }

  return value;
};

export const limitResult = (
  limits: IrSurfaceLimits | undefined,
  value: unknown,
): LimitedResult => {
  const cut = { truncated: false };
  const capped = limits ? capValues(value, limits, cut, true) : value;
  const text =
    typeof capped === 'string' ? capped : (JSON.stringify(capped) ?? '');
  const maxResultChars = limits?.maxResultChars;

  if (maxResultChars !== undefined && text.length > maxResultChars) {
    return { text: text.slice(0, maxResultChars), truncated: true };
  }

  return { text, truncated: cut.truncated };
};
