import { DecodoClient } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    apiKey: '<api_key>',
  },
});

const job = await client.webScrapingApi.startCrawl({
  url: 'https://decodo.com',
  limit: 10,
});

console.log('Polling for crawl status...');

const interval = setInterval(async () => {
  const progress = await client.webScrapingApi.getCrawlStatus(job.crawl_id);
  console.log(`${progress.status}: ${progress.completed}/${progress.discovered} pages`);

  if (progress.status !== 'pending') {
    clearInterval(interval);
    const pages = await client.webScrapingApi.getCrawlResults(job.crawl_id);
    console.log(JSON.stringify(pages, null, 2));
  }
}, 5000);
