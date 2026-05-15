import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.GoogleLens,
  query:
    'https://www.humanesociety.org/sites/default/files/2021-06/hamster-540188.jpg',
  headless: 'html',
});

console.log(JSON.stringify(res, null, 2));
