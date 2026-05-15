import { DecodoClient, Target } from '@decodo/sdk-ts';

const client = new DecodoClient({
  webScrapingApi: {
    token: '<web_auth_token>',
  },
});

const res = await client.webScrapingApi.scrape({
  target: Target.AppleAppStore,
  url: 'https://apps.apple.com/us/iphone/games',
});

console.log(JSON.stringify(res, null, 2));
