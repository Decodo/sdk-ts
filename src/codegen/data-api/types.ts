import type { JSONSchema4 } from 'json-schema';

export type DataApiEndpointIR = {
  method: string;
  path: string;
  summary?: string;
  description?: string;
  pathParameters?: JSONSchema4;
  queryParameters?: JSONSchema4;
  requestSchema?: JSONSchema4;
  successStatus: number;
  responseSchema: JSONSchema4;
};

export type DataApiIR = {
  label: string;
  baseUrl: string;
  auth: { type: string; [key: string]: unknown };
  endpoints: Record<string, DataApiEndpointIR>;
};
