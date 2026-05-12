import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_api_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.GoogleSearch,
  query: 'shoes',
  geo: 'United States',
  parse: true,
});

const firstResult = res.results[0];
console.log(JSON.stringify(firstResult.content, null, 2));
