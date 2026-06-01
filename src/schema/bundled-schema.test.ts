import { describe, expect, it } from 'vitest';
import { Target } from '../generated/targets.js';
import { BundledSchema } from './bundled-schema.js';

describe('BundledSchema.shared', () => {
  const schema = BundledSchema.shared;

  it('lists bundled targets', () => {
    expect(schema.listTargets().length).toBeGreaterThan(0);
    expect(schema.listTargets()).toContain(Target.GoogleSearch);
  });

  it('returns target metadata for a known target', () => {
    const meta = schema.getTargetMeta(Target.GoogleSearch);

    expect(meta).toBeDefined();
    expect(meta?.group).toBe('Google');
    expect(meta?.parameters).toContain('query');
  });

  it('validates request payloads for a known target', () => {
    const requestSchema = schema.getRequestSchema(Target.GoogleSearch);

    expect(requestSchema?.safeParse({
      target: Target.GoogleSearch,
      query: 'coffee',
    }).success).toBe(true);

    expect(requestSchema?.safeParse({
      target: Target.GoogleSearch,
      page_from: -1,
    }).success).toBe(false);
  });

  it('returns JSON parameter schema for a known target', () => {
    const parameterSchema = schema.getTargetParameterSchema(Target.GoogleSearch);

    expect(parameterSchema?.properties).toHaveProperty('query');
  });

  it('returns empty shared parameters', () => {
    expect(schema.getSharedParameters()).toEqual({});
  });
});
