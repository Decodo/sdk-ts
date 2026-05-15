import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const metadata = await client.webScrapingApi.scrapeBatch({
  target: Target.GoogleSearch,
  query: ['shoes', 'laptop'],
  parse: true,
});

console.log('Polling for results...');

const interval = setInterval(async () => {
  console.log('Polling for results...');

  const firstTaskId = metadata?.queries?.[0]?.id;
  if (!firstTaskId) {
    return;
  }

  const results = await client.webScrapingApi.getResults(firstTaskId);
  if (results) {
    console.log(JSON.stringify(results.results[0].content, null, 2));
    clearInterval(interval);
  }
}, 3000);
