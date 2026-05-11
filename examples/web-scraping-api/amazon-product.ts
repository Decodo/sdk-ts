import { DecodoClient, Target, type ScrapeRequest } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: 'VTAwMDAxNzk1MDc6UFcxMDcxZGQ3Yzg2ZjM5MjA1YjQ4NjNhZjk1OGMxMGUxNGY=',
  },
});

const req: ScrapeRequest = {
  target: Target.AmazonProduct,
  query: 'B09H74FXNW',
  parse: true,
};

const res = await client.webScrapingApi.scrape(req);

const firstResult = res.results[0];
console.log('status_code:', firstResult?.status_code);
console.log('task_id:', firstResult?.task_id);
console.log('content (preview):', firstResult.content);
