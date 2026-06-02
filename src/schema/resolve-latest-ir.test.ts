import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_IR_BASE,
  DEFAULT_IR_LIST_URL,
  DEFAULT_IR_PREFIX,
} from './constants.js';
import { resolveLatestIr } from './resolve-latest-ir.js';
import { jsonResponse, mockFetch } from './test-helpers.js';

describe('resolveLatestIr', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('picks the highest semver and builds the IR URL', async () => {
    mockFetch((input) => {
      expect(String(input)).toBe(DEFAULT_IR_LIST_URL);
      return jsonResponse({
        items: [
          { name: `${DEFAULT_IR_PREFIX}1.0.0.json` },
          { name: `${DEFAULT_IR_PREFIX}2.1.0.json` },
          { name: `${DEFAULT_IR_PREFIX}2.0.9.json` },
        ],
      });
    });

    await expect(resolveLatestIr()).resolves.toEqual({
      version: '2.1.0',
      url: `${DEFAULT_IR_BASE}/${DEFAULT_IR_PREFIX}2.1.0.json`,
    });
  });

  it('throws when no versioned IR objects are found', async () => {
    mockFetch(() => jsonResponse({ items: [] }));

    await expect(resolveLatestIr()).rejects.toThrow(
      'No versioned IR objects found',
    );
  });
});
