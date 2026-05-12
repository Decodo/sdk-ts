import { WebScrapingApiIR } from './web-scraping-api/types';

export type IR = {
  version: string;
  apis: {
    webScrapingApi: WebScrapingApiIR;
  };
};
