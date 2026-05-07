export { DecodoClient } from './client.js';
export type { DecodoConfig } from './client.js';
export { WebScrapingApi } from './api/web-scraping-api.js';

export type {
  Target,
  TargetParamsMap,
  TargetMeta,
  ScrapeRequest,
  BatchRequest,
} from './generated/targets.js';
export { targets, targetMeta } from './generated/targets.js';
export { parameterMeta } from './generated/parameters.js';
export type { ParameterMeta } from './generated/parameters.js';

export type {
  SyncResponse,
  AsyncTaskResponse,
  BatchResponse,
  TaskMetadata,
  TaskResultsResponse,
  TaskStatus,
  ResultEntry,
} from './types/responses.js';

export {
  DecodoError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  TimeoutError,
} from './errors.js';
