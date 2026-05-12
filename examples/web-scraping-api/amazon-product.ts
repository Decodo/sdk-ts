import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_api_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.AmazonProduct,
  query: 'B09H74FXNW',
  parse: true,
});

const firstResult = res.results[0];
console.log(JSON.stringify(firstResult.content, null, 2));
