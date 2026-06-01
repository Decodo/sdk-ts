import {
  DEFAULT_IR_BASE,
  DEFAULT_IR_LIST_URL,
  DEFAULT_IR_PREFIX,
} from './constants.js';
import type { GcsObjectList, LatestIrLocation } from './types.js';

const IR_OBJECT_PATTERN = /^decodo-ir-v(.+)\.json$/;

const parseSemver = (version: string): [number, number, number] | null => {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    return null;
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
};

const compareSemver = (left: string, right: string): number => {
  const parsedLeft = parseSemver(left);
  const parsedRight = parseSemver(right);

  if (!parsedLeft || !parsedRight) {
    return left.localeCompare(right);
  }

  for (let i = 0; i < 3; i += 1) {
    if (parsedLeft[i] !== parsedRight[i]) {
      return parsedLeft[i] - parsedRight[i];
    }
  }

  return 0;
};

const parseIrVersions = (names: string[]): string[] => {
  const versions: string[] = [];

  for (const name of names) {
    const match = IR_OBJECT_PATTERN.exec(name);
    if (match && parseSemver(match[1])) {
      versions.push(match[1]);
    }
  }

  return versions;
};

export const resolveLatestIr = async (): Promise<LatestIrLocation> => {
  const res = await fetch(DEFAULT_IR_LIST_URL, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to list IR versions from ${DEFAULT_IR_LIST_URL}: HTTP ${res.status}`,
    );
  }

  const body = (await res.json()) as GcsObjectList;
  const names = body.items?.map((item) => item.name) ?? [];
  const versions = parseIrVersions(names);

  if (versions.length === 0) {
    throw new Error(
      `No versioned IR objects found in bucket with prefix "${DEFAULT_IR_PREFIX}".`,
    );
  }

  const version = versions.reduce((latest, current) =>
    compareSemver(current, latest) > 0 ? current : latest,
  );

  return {
    version,
    url: `${DEFAULT_IR_BASE}/${DEFAULT_IR_PREFIX}${version}.json`,
  };
};
