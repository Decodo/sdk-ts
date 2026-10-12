import { DecodoClient } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    apiKey: '<api_key>',
  },
});

const { status, pages } = await client.webScrapingApi.crawl(
  {
    url: 'https://decodo.com',
    limit: 10,
    output: 'markdown',
  },
  { pollInterval: 5000, timeout: 600_000 },
);

console.log(`Crawl ${status.crawl_id} finished as ${status.status}`);

for (const page of pages) {
  console.log(page.url, page.content?.length ?? 0);
}
