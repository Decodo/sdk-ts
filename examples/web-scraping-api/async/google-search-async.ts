import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const metadata = await client.webScrapingApi.scrapeAsync({
  target: Target.GoogleSearch,
  query: 'shoes',
  geo: 'United States',
  parse: true,
});

console.log('Polling for results...');

const interval = setInterval(async () => {
  console.log('Polling for results...');

  const results = await client.webScrapingApi.getResults(metadata.id);
  if (results) {
    console.log(JSON.stringify(results.results[0].content, null, 2));
    clearInterval(interval);
  }
}, 3000);
