export type { ScrapeRequest, BatchRequest } from '../generated/targets.js';

export type CrawlOptions = {
  pollInterval?: number;
  timeout?: number;
};

export type CrawlResultsOptions = {
  content?: boolean;
};
