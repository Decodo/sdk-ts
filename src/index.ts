export { DecodoClient } from './client.js';
export type { DecodoConfig, WebScrapingApiConfig } from './client.js';
export { WebScrapingApi } from './api/web-scraping-api.js';
export type { WebScrapingApiRoutes } from './api/web-scraping-api.js';
export { Flows } from './api/flows.js';
export type { JobResultsOptions, WaitOptions } from './api/flows.js';
export { readResult } from './api/results.js';
export { buildToolInputSchema, buildToolRequest, runTool } from './api/tools.js';
export { BundledSchema } from './schema/bundled-schema.js';
export { RemoteSchema } from './schema/remote-schema.js';
export type {
  DecodoSchema,
  FlowSchema,
  IrBatchFlow,
  IrCallFlow,
  IrFlow,
  IrFlowSections,
  IrJobFlow,
  IrKeyCheck,
  IrOperation,
  IrResult,
  IrResultFailure,
  IrSurface,
  IrSurfaceLimits,
  IrSurfaceTool,
  RemoteSchemaLoadOptions,
} from './schema/types.js';

export type {
  TargetString,
  TargetParamsMap,
  TargetMeta,
  ScrapeRequest,
  BatchRequest,
} from './generated/targets.js';
export {
  targets,
  targetMeta,
  Target,
} from './generated/targets.js';
export { requestSchemas } from './generated/request-schemas.js';
export { dataApiRequestSchemas } from './generated/data-api.js';
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
  CrawlPage,
  CrawlPageList,
  CrawlResult,
} from './types/responses.js';
export type {
  CrawlOptions,
  CrawlPagesOptions,
  CrawlResultsOptions,
} from './types/requests.js';
export type {
  RunSearchRequest,
  RunSearchResponse,
  MapSiteRequest,
  MapSiteResponse,
  StartCrawlRequest,
  StartCrawlResponse,
  GetCrawlStatusResponse,
  ListCrawlPagesResponse,
  CancelCrawlResponse,
} from './generated/data-api.js';

export {
  DecodoError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  TimeoutError,
  ResultError,
  JobTimeoutError,
} from './errors.js';
