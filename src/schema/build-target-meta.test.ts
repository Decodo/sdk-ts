import { describe, expect, it } from 'vitest';
import { buildTargetMeta } from './build-target-meta.js';
import type { IrTarget } from './types.js';

describe('buildTargetMeta', () => {
  it('builds group, response_format, and parameter names excluding target', () => {
    const targets: Record<string, IrTarget> = {
      google_search: {
        group: 'Google',
        response_format: 'json',
        parameter_schema: {
          type: 'object',
          properties: {
            target: { type: 'string', const: 'google_search' },
            query: { type: 'string' },
            parse: { type: 'boolean' },
          },
          required: ['target', 'query'],
        },
      },
    };

    const meta = buildTargetMeta(targets);

    expect(meta.get('google_search')).toEqual({
      group: 'Google',
      response_format: 'json',
      parameters: ['query', 'parse'],
    });
  });
});
