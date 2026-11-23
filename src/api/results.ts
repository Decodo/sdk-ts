import { ResultError } from '../errors.js';
import type { IrResult, IrResultFailure } from '../schema/types.js';

const MISSING = Symbol('missing');
const RETRYABLE_STATUS = 429;
const SERVER_ERROR = 500;

type Found = unknown | typeof MISSING;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const at = (value: Found, path: string): Found => {
  const [segment, ...restSegments] = path.split('.');
  const rest = restSegments.join('.');

  if (segment === '*') {
    if (!Array.isArray(value)) {
      return MISSING;
    }
    return value
      .map((item) => (rest ? at(item, rest) : item))
      .filter((item) => item !== MISSING);
  }

  let step: Found = MISSING;
  if (/^\d+$/.test(segment)) {
    const index = Number(segment);
    step =
      Array.isArray(value) && index < value.length ? value[index] : MISSING;
  } else if (isRecord(value) && segment in value) {
    step = value[segment];
  }

  return rest && step !== MISSING ? at(step, rest) : step;
};

const throwIfFailed = (failure: IrResultFailure, response: unknown): void => {
  const value = at(response, failure.path);
  const failed =
    failure.equals !== undefined
      ? value !== MISSING && value === failure.equals
      : isNumber(value) && value >= (failure.atLeast ?? Infinity);

  if (!failed) {
    return;
  }

  const reported = failure.code ? at(response, failure.code) : MISSING;
  const code = reported === MISSING || reported === null ? value : reported;
  const message = failure.message ? at(response, failure.message) : MISSING;
  const retryable =
    Boolean(failure.retryable) ||
    (isNumber(code) && (code === RETRYABLE_STATUS || code >= SERVER_ERROR));
  const text =
    typeof message === 'string' && message
      ? message
      : `Decodo reported a failure (${String(code)}).`;

  throw new ResultError(text, String(code), retryable);
};

const isEmpty = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0) ||
  (isRecord(value) && Object.keys(value).length === 0);

const pick = (item: unknown, rule: IrResult): unknown => {
  if (rule.fields && Object.keys(rule.fields).length > 0) {
    const picked: Record<string, unknown> = {};
    for (const [name, path] of Object.entries(rule.fields)) {
      const value = at(item, path);
      if (value !== MISSING) {
        picked[name] = value;
      }
    }
    for (const name of rule.required ?? []) {
      if (isEmpty(picked[name])) {
        throw new ResultError(
          `Decodo returned a result with no ${name}.`,
          `empty_${name}`,
        );
      }
    }
    return picked;
  }

  if (rule.omit && rule.omit.length > 0 && isRecord(item)) {
    return Object.fromEntries(
      Object.entries(item).filter(([name]) => !rule.omit?.includes(name)),
    );
  }

  return item;
};

export const readResult = (
  rule: IrResult | undefined,
  response: unknown,
): unknown => {
  if (!rule) {
    return response;
  }

  for (const failure of rule.failures ?? []) {
    throwIfFailed(failure, response);
  }

  const result = rule.from ? at(response, rule.from) : response;
  if (result === MISSING || result === null || result === undefined) {
    throw new ResultError('Decodo returned no result.', 'empty_response');
  }

  return Array.isArray(result)
    ? result.map((item) => pick(item, rule))
    : pick(result, rule);
};
