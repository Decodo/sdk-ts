export type IRParameter = {
  type: string;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: (string | number)[];
  items?: { type: string };
};

export type IRTarget = {
  group: string;
  responseFormat: string;
  parameters: string[];
};

export type WebScrapingApiIR = {
  label: string;
  baseUrl: string;
  auth: { type: string; [key: string]: unknown };
  endpoints: Record<
    string,
    { method: string; path: string; description: string }
  >;
  parameters: Record<string, IRParameter>;
  targets: Record<string, IRTarget>;
};
