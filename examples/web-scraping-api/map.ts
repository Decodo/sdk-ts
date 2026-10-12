import { DecodoClient } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    apiKey: '<api_key>',
  },
});

const res = await client.webScrapingApi.map({
  url: 'https://decodo.com',
  limit: 100,
});

console.log(JSON.stringify(res.results[0].content.links, null, 2));
