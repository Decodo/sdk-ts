import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.Universal,
  url: 'https://www.example.com',
  geo: 'United States',
  markdown: true,
});

console.log(JSON.stringify(res, null, 2));
