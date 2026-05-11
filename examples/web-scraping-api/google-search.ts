import {
  DecodoClient,
  Target,
  type ScrapeRequest,
} from '../../build/esm/index';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_api_token>',
  },
});

const req: ScrapeRequest = {
  target: Target.GoogleSearch,
  query: 'shoes',
  geo: 'United States',
  parse: true,
};

const res = await client.webScrapingApi.scrape(req);

const firstResult = res.results[0];
console.log('status_code:', firstResult?.status_code);
console.log('task_id:', firstResult?.task_id);
console.log('content (preview):', firstResult.content);
