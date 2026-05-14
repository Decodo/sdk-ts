import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.AmazonBestsellers,
  query: 'mobile-apps',
  parse: true,
});

console.log(JSON.stringify(res, null, 2));
