import { DecodoClient } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    apiKey: '<api_key>',
  },
});

const res = await client.webScrapingApi.search({
  query: 'shoes',
  geo: 'United States',
});

console.log(JSON.stringify(res, null, 2));
