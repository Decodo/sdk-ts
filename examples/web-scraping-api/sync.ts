import { DecodoClient, type ScrapeRequest } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_api_token>',
  },
});

const req: ScrapeRequest = {
  target: 'google_search',
  query: 'shoes',
  geo: 'United States',
  parse: true,
};

const res = await client.webScrapingApi.scrape(req);

const firstResult = res.results[0];
console.log('status_code:', firstResult?.status_code);
console.log('task_id:', firstResult?.task_id);
console.log('content (preview):', firstResult.content);
