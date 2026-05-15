import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.BingSearch,
  query: 'electric vehicles',
  geo: 'United States',
  parse: true,
  locale: 'en-US',
});

console.log(JSON.stringify(res, null, 2));
