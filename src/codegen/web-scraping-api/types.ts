import type { JSONSchema4 } from 'json-schema';

export type IRTarget = {
  group: string;
  response_format: string;
  parameter_schema: JSONSchema4;
};

export type WebScrapingApiIR = {
  label: string;
  baseUrl: string;
  auth: { type: string; [key: string]: unknown };
  endpoints: Record<
    string,
    { method: string; path: string; description: string }
  >;
  targets: Record<string, IRTarget>;
};
